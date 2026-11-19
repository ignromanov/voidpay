/**
 * Fail-closed contract for the shared edge-guard limiter (#368).
 * Upstash is mocked; no in-memory limiter exists anywhere.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockLimit, mockPing, ratelimitConfigs, redisConfigs, ctor } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
  mockPing: vi.fn(),
  ratelimitConfigs: [] as Record<string, unknown>[],
  redisConfigs: [] as Record<string, unknown>[],
  ctor: { ratelimitThrows: false, redisThrows: false },
}))

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    ping = mockPing
    constructor(config: Record<string, unknown>) {
      if (ctor.redisThrows) throw new Error('bad redis url')
      redisConfigs.push(config)
    }
  },
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    class MockRatelimit {
      limit = (identifier: string) => mockLimit(this.prefix, identifier)
      prefix: string
      constructor(config: Record<string, unknown>) {
        if (ctor.ratelimitThrows) throw new Error('bad limiter config')
        ratelimitConfigs.push(config)
        this.prefix = config.prefix as string
      }
    },
    {
      slidingWindow: (tokens: number, window: string) => ({ algo: 'sliding', tokens, window }),
      fixedWindow: (tokens: number, window: string) => ({ algo: 'fixed', tokens, window }),
    }
  ),
}))

const NOW = 1_800_000_000_000

function ok(overrides: Record<string, unknown> = {}) {
  return { success: true, limit: 100, remaining: 99, reset: NOW + 60_000, pending: Promise.resolve(), ...overrides }
}

function req(ip = '203.0.113.7'): Headers {
  return new Headers({ 'x-real-ip': ip })
}

async function load() {
  return await import('../rate-limit')
}

beforeEach(() => {
  vi.resetModules()
  mockLimit.mockReset()
  mockPing.mockReset()
  ratelimitConfigs.length = 0
  redisConfigs.length = 0
  ctor.ratelimitThrows = false
  ctor.redisThrows = false
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('KV_REST_API_URL', 'https://example.upstash.io')
  vi.stubEnv('KV_REST_API_TOKEN', 'test-token')
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('checkRateLimit — fail-closed table', () => {
  it.each([
    ['KV_REST_API_URL', ''],
    ['KV_REST_API_TOKEN', ''],
  ])('missing %s → unavailable(unconfigured)', async (name, value) => {
    vi.stubEnv(name, value)
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('rpc', req())).toEqual({ kind: 'unavailable', cause: 'unconfigured' })
    expect(mockLimit).not.toHaveBeenCalled()
  })

  it('Ratelimit constructor throw → unavailable(error)', async () => {
    ctor.ratelimitThrows = true
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('transfers', req())).toEqual({ kind: 'unavailable', cause: 'error' })
  })

  it('Redis constructor throw → unavailable(error)', async () => {
    ctor.redisThrows = true
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('rpc', req())).toEqual({ kind: 'unavailable', cause: 'error' })
  })

  it('limit() throw → unavailable(error)', async () => {
    mockLimit.mockRejectedValue(new Error('ECONNREFUSED'))
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('rpc', req())).toEqual({ kind: 'unavailable', cause: 'error' })
  })

  it("reason 'timeout' (Upstash resolves success:true) → unavailable(timeout)", async () => {
    mockLimit.mockResolvedValue(ok({ success: true, limit: 0, remaining: 0, reset: 0, reason: 'timeout' }))
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('rpc', req())).toEqual({ kind: 'unavailable', cause: 'timeout' })
  })

  it('success:false → deny with limit/remaining/reset', async () => {
    mockLimit.mockResolvedValue(ok({ success: false, remaining: 0, reset: NOW + 12_300 }))
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('rpc', req())).toEqual({ kind: 'deny', limit: 100, remaining: 0, reset: NOW + 12_300 })
  })

  it('success:true → allow', async () => {
    mockLimit.mockResolvedValue(ok())
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('rpc', req())).toEqual({ kind: 'allow', limit: 100, remaining: 99, reset: NOW + 60_000 })
  })

  it('a later success is not poisoned by an earlier failure (no cached failure)', async () => {
    ctor.ratelimitThrows = true
    const { checkRateLimit } = await load()
    expect((await checkRateLimit('rpc', req())).kind).toBe('unavailable')
    ctor.ratelimitThrows = false
    mockLimit.mockResolvedValue(ok())
    expect((await checkRateLimit('rpc', req())).kind).toBe('allow')
  })
})

describe('checkRateLimit — bypass', () => {
  it('NODE_ENV=development allows without touching Redis, even unconfigured', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('KV_REST_API_URL', '')
    const { checkRateLimit } = await load()
    const decision = await checkRateLimit('rpc', req())
    expect(decision.kind).toBe('allow')
    expect(mockLimit).not.toHaveBeenCalled()
  })

  it('NODE_ENV=test is NOT a bypass', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('KV_REST_API_URL', '')
    const { checkRateLimit } = await load()
    expect((await checkRateLimit('rpc', req())).kind).toBe('unavailable')
  })
})

describe('checkRateLimit — client configuration', () => {
  it('builds Redis with bounded retries and Ratelimit with a 2s timeout', async () => {
    mockLimit.mockResolvedValue(ok())
    const { checkRateLimit } = await load()
    await checkRateLimit('rpc', req())

    expect(redisConfigs).toHaveLength(1)
    expect(redisConfigs[0]).toMatchObject({
      url: 'https://example.upstash.io',
      token: 'test-token',
      retry: { retries: 2 },
    })
    const rpc = ratelimitConfigs.find((c) => c.prefix === 'rpc_ratelimit')
    expect(rpc).toMatchObject({
      timeout: 2000,
      analytics: false,
      limiter: { algo: 'sliding', tokens: 100, window: '60 s' },
    })
    // ephemeralCache left at the library default (deny cache on)
    expect(rpc).not.toHaveProperty('ephemeralCache')
  })

  it('configures transfers per-IP and the global fixed-window cap', async () => {
    mockLimit.mockResolvedValue(ok())
    const { checkRateLimit, TRANSFERS_GLOBAL_CAP } = await load()
    await checkRateLimit('transfers', req())

    expect(TRANSFERS_GLOBAL_CAP).toBe(300)
    expect(ratelimitConfigs.find((c) => c.prefix === 'transfers_ratelimit')).toMatchObject({
      timeout: 2000,
      limiter: { algo: 'sliding', tokens: 10, window: '60 s' },
    })
    expect(ratelimitConfigs.find((c) => c.prefix === 'transfers_ratelimit_global')).toMatchObject({
      timeout: 2000,
      limiter: { algo: 'fixed', tokens: 300, window: '60 s' },
    })
  })

  it('reuses the clients across calls (lazy module-scope singletons)', async () => {
    mockLimit.mockResolvedValue(ok())
    const { checkRateLimit } = await load()
    await checkRateLimit('rpc', req())
    await checkRateLimit('transfers', req())
    await checkRateLimit('rpc', req('198.51.100.1'))
    expect(redisConfigs).toHaveLength(1)
    expect(ratelimitConfigs).toHaveLength(3)
  })
})

describe('checkRateLimit — transfers global cap', () => {
  it('checks the per-IP bucket first and skips the global bucket on per-IP deny', async () => {
    mockLimit.mockResolvedValue(ok({ success: false, limit: 10, remaining: 0 }))
    const { checkRateLimit } = await load()
    const decision = await checkRateLimit('transfers', req())
    expect(decision.kind).toBe('deny')
    expect(mockLimit).toHaveBeenCalledTimes(1)
    expect(mockLimit.mock.calls[0]![0]).toBe('transfers_ratelimit')
  })

  it('denies when the per-IP bucket allows but the global cap is exhausted', async () => {
    mockLimit
      .mockResolvedValueOnce(ok({ limit: 10, remaining: 9 }))
      .mockResolvedValueOnce(ok({ success: false, limit: 300, remaining: 0, reset: NOW + 5_000 }))
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('transfers', req())).toEqual({ kind: 'deny', limit: 300, remaining: 0, reset: NOW + 5_000 })
    expect(mockLimit.mock.calls[1]![0]).toBe('transfers_ratelimit_global')
  })

  it('global timeout → unavailable(timeout)', async () => {
    mockLimit.mockResolvedValueOnce(ok({ limit: 10, remaining: 9 })).mockResolvedValueOnce(ok({ reason: 'timeout' }))
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('transfers', req())).toEqual({ kind: 'unavailable', cause: 'timeout' })
  })

  it('global throw → unavailable(error)', async () => {
    mockLimit.mockResolvedValueOnce(ok({ limit: 10, remaining: 9 })).mockRejectedValueOnce(new Error('boom'))
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('transfers', req())).toEqual({ kind: 'unavailable', cause: 'error' })
  })

  it('both allow → allow reporting the per-IP budget', async () => {
    mockLimit
      .mockResolvedValueOnce(ok({ limit: 10, remaining: 7, reset: NOW + 1_000 }))
      .mockResolvedValueOnce(ok({ limit: 300, remaining: 250 }))
    const { checkRateLimit } = await load()
    expect(await checkRateLimit('transfers', req())).toEqual({ kind: 'allow', limit: 10, remaining: 7, reset: NOW + 1_000 })
  })

  it('rpc never consults the global transfers bucket', async () => {
    mockLimit.mockResolvedValue(ok())
    const { checkRateLimit } = await load()
    await checkRateLimit('rpc', req())
    expect(mockLimit).toHaveBeenCalledTimes(1)
    expect(mockLimit.mock.calls[0]![0]).toBe('rpc_ratelimit')
  })
})

describe('checkRateLimit — identifier privacy', () => {
  const RAW_IP = '203.0.113.7'

  async function identifierFor(headers: Headers): Promise<string> {
    mockLimit.mockResolvedValue(ok())
    const { checkRateLimit } = await load()
    await checkRateLimit('rpc', headers)
    return mockLimit.mock.calls.at(-1)![1] as string
  }

  it('sends a 32-hex-char HMAC, never the raw IP', async () => {
    const id = await identifierFor(req(RAW_IP))
    expect(id).toMatch(/^[0-9a-f]{32}$/)
    expect(id).not.toBe(RAW_IP)
    expect(id).not.toContain(RAW_IP)
  })

  it('is HMAC-SHA256(KV_REST_API_TOKEN, bucket) truncated to 16 bytes', async () => {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', enc.encode('test-token'), { name: 'HMAC', hash: 'SHA-256' }, false, [
      'sign',
    ])
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(RAW_IP)))
    const expected = Array.from(sig.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('')
    expect(await identifierFor(req(RAW_IP))).toBe(expected)
  })

  it('is stable for one client and shared inside one IPv6 /64', async () => {
    mockLimit.mockResolvedValue(ok())
    const { checkRateLimit } = await load()
    await checkRateLimit('rpc', req('2001:db8:1:2::1'))
    await checkRateLimit('rpc', req('2001:db8:1:2:ffff::9'))
    await checkRateLimit('rpc', req('2001:db8:1:3::1'))
    const [a, b, c] = mockLimit.mock.calls.map((call) => call[1])
    expect(a).toBe(b)
    expect(a).not.toBe(c)
  })

  it('changes when the token changes', async () => {
    const a = await identifierFor(req(RAW_IP))
    vi.resetModules()
    vi.stubEnv('KV_REST_API_TOKEN', 'rotated-token')
    const b = await identifierFor(req(RAW_IP))
    expect(a).not.toBe(b)
  })

  it('never logs the raw IP or the identifier', async () => {
    mockLimit.mockRejectedValue(new Error('ECONNREFUSED'))
    const { checkRateLimit } = await load()
    await checkRateLimit('rpc', req(RAW_IP))

    mockLimit.mockReset()
    const id = await identifierFor(req(RAW_IP))
    const logged = JSON.stringify([
      ...vi.mocked(console.error).mock.calls,
      ...vi.mocked(console.warn).mock.calls,
    ])
    expect(vi.mocked(console.error)).toHaveBeenCalled()
    expect(logged).not.toContain(RAW_IP)
    expect(logged).not.toContain(id)
  })

  it('never logs upstream error text (UpstashError embeds the command and Redis keys)', async () => {
    const hex = 'deadbeefcafebabe0123456789abcdef'
    mockLimit.mockRejectedValue(
      new Error(`ERR quota exceeded, command was: ["EVALSHA","abc","rpc_ratelimit:${hex}:1"]`)
    )
    const { checkRateLimit } = await load()
    await checkRateLimit('rpc', req(RAW_IP))

    const logged = JSON.stringify(vi.mocked(console.error).mock.calls)
    expect(vi.mocked(console.error)).toHaveBeenCalled()
    expect(logged).not.toContain('command was')
    expect(logged).not.toContain('quota exceeded')
    expect(logged).not.toContain(hex)
    expect(logged).toContain('Error')
  })
})

describe('limitResponse', () => {
  it('returns null for allow', async () => {
    const { limitResponse } = await load()
    expect(limitResponse({ kind: 'allow', limit: 100, remaining: 5, reset: NOW }, NOW)).toBeNull()
  })

  it('maps unavailable to 503 with Retry-After: 30 and no cause', async () => {
    const { limitResponse } = await load()
    for (const cause of ['unconfigured', 'error', 'timeout'] as const) {
      const res = limitResponse({ kind: 'unavailable', cause }, NOW)
      expect(res).toEqual({ status: 503, headers: { 'Retry-After': '30' } })
      expect(JSON.stringify(res)).not.toContain(cause)
    }
  })

  it('maps deny to 429 with Retry-After computed from reset', async () => {
    const { limitResponse } = await load()
    expect(limitResponse({ kind: 'deny', limit: 100, remaining: 0, reset: NOW + 12_300 }, NOW)).toEqual({
      status: 429,
      headers: {
        'Retry-After': '13',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil((NOW + 12_300) / 1000)),
      },
    })
  })

  it('clamps Retry-After to at least 1 second', async () => {
    const { limitResponse } = await load()
    expect(limitResponse({ kind: 'deny', limit: 10, remaining: 0, reset: NOW - 5_000 }, NOW)!.headers['Retry-After']).toBe(
      '1'
    )
    expect(limitResponse({ kind: 'deny', limit: 10, remaining: 0, reset: NOW }, NOW)!.headers['Retry-After']).toBe('1')
  })
})

describe('rateLimitHeaders', () => {
  it('reports the remaining budget on allow', async () => {
    const { rateLimitHeaders } = await load()
    expect(rateLimitHeaders({ kind: 'allow', limit: 100, remaining: 42, reset: NOW })).toEqual({
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '42',
    })
  })

  it('is empty for unavailable', async () => {
    const { rateLimitHeaders } = await load()
    expect(rateLimitHeaders({ kind: 'unavailable', cause: 'error' })).toEqual({})
  })
})

describe('isRedisHealthy — memoized ping', () => {
  it('returns false without pinging when unconfigured', async () => {
    vi.stubEnv('KV_REST_API_TOKEN', '')
    const { isRedisHealthy } = await load()
    expect(await isRedisHealthy()).toBe(false)
    expect(mockPing).not.toHaveBeenCalled()
  })

  it('pings Redis at most once per 30 s', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(NOW)
    mockPing.mockResolvedValue('PONG')
    const { isRedisHealthy } = await load()

    expect(await isRedisHealthy()).toBe(true)
    now.mockReturnValue(NOW + 29_999)
    expect(await isRedisHealthy()).toBe(true)
    expect(mockPing).toHaveBeenCalledTimes(1)

    now.mockReturnValue(NOW + 30_000)
    expect(await isRedisHealthy()).toBe(true)
    expect(mockPing).toHaveBeenCalledTimes(2)
  })

  it('shares one in-flight ping across concurrent callers', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW)
    mockPing.mockResolvedValue('PONG')
    const { isRedisHealthy } = await load()
    await Promise.all([isRedisHealthy(), isRedisHealthy(), isRedisHealthy()])
    expect(mockPing).toHaveBeenCalledTimes(1)
  })

  it('reports false when the ping never settles (2 s timeout)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      mockPing.mockReturnValue(new Promise(() => {}))
      const { isRedisHealthy } = await load()
      const pending = isRedisHealthy()
      await vi.advanceTimersByTimeAsync(2000)
      expect(await pending).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('reports false on ping failure and memoizes it', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW)
    mockPing.mockRejectedValue(new Error('down'))
    const { isRedisHealthy } = await load()
    expect(await isRedisHealthy()).toBe(false)
    expect(await isRedisHealthy()).toBe(false)
    expect(mockPing).toHaveBeenCalledTimes(1)
  })

  it('reports false when the Redis constructor throws', async () => {
    ctor.redisThrows = true
    const { isRedisHealthy } = await load()
    expect(await isRedisHealthy()).toBe(false)
  })
})
