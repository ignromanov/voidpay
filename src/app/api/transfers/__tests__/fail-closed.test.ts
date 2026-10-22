/**
 * /api/transfers fail-closed contract, end-to-end through the real edge-guard (#368).
 * Only Upstash and fetch (Alchemy) are mocked. No in-memory fallback exists.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { estimateCurrentBlock } from '@/entities/network'

const { mockLimit, ctor } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
  ctor: { throws: false },
}))

vi.mock('@upstash/redis', () => ({ Redis: class MockRedis {} }))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    class MockRatelimit {
      prefix: string
      limit = (identifier: string) => mockLimit(this.prefix, identifier)
      constructor(config: { prefix: string }) {
        if (ctor.throws) throw new Error('bad config')
        this.prefix = config.prefix
      }
    },
    { slidingWindow: vi.fn(), fixedWindow: vi.fn() }
  ),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const NOW = 1_800_000_000_000
const BODY = {
  chainId: 1,
  toAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  fromBlock: `0x${(estimateCurrentBlock(1)! - 10).toString(16)}`,
  category: 'external',
}

async function post() {
  const { POST } = await import('../route')
  return POST(
    new Request('http://localhost/api/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-real-ip': '203.0.113.7' },
      body: JSON.stringify(BODY),
    })
  )
}

function okLimit(overrides: Record<string, unknown> = {}) {
  return { success: true, limit: 10, remaining: 9, reset: NOW + 60_000, ...overrides }
}

beforeEach(() => {
  vi.resetModules()
  mockLimit.mockReset()
  mockFetch.mockReset().mockResolvedValue({
    ok: true,
    json: async () => ({ jsonrpc: '2.0', id: 1, result: { transfers: [] } }),
  })
  ctor.throws = false
  vi.stubEnv('KV_REST_API_URL', 'https://example.upstash.io')
  vi.stubEnv('KV_REST_API_TOKEN', 'test-token')
  vi.stubEnv('ALCHEMY_API_KEY', 'test-key')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('/api/transfers — fail-closed', () => {
  const failures: [string, () => void][] = [
    ['missing KV env', () => vi.stubEnv('KV_REST_API_TOKEN', '')],
    ['Ratelimit constructor throws', () => (ctor.throws = true)],
    ['limit() throws', () => mockLimit.mockRejectedValue(new Error('ECONNREFUSED'))],
    ["limit() resolves reason:'timeout'", () => mockLimit.mockResolvedValue(okLimit({ reason: 'timeout' }))],
    [
      "global cap resolves reason:'timeout'",
      () => mockLimit.mockResolvedValueOnce(okLimit()).mockResolvedValueOnce(okLimit({ reason: 'timeout' })),
    ],
  ]

  it.each(failures)('%s → 503, Retry-After: 30, zero Alchemy calls', async (_name, arrange) => {
    arrange()
    const res = await post()
    expect(res.status).toBe(503)
    expect(res.headers.get('retry-after')).toBe('30')
    expect(await res.json()).toEqual({ error: 'Service temporarily unavailable' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('per-client deny → 429 with Retry-After from reset, zero Alchemy calls', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW)
    mockLimit.mockResolvedValue(okLimit({ success: false, remaining: 0, reset: NOW + 30_000 }))
    const res = await post()
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBe('30')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('global cap deny → 429, zero Alchemy calls', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW)
    mockLimit
      .mockResolvedValueOnce(okLimit())
      .mockResolvedValueOnce(okLimit({ success: false, limit: 300, remaining: 0, reset: NOW + 2_500 }))
    const res = await post()
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBe('3')
    expect(res.headers.get('x-ratelimit-limit')).toBe('300')
    expect(mockLimit.mock.calls.map((c) => c[0])).toEqual(['transfers_ratelimit', 'transfers_ratelimit_global'])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('allow → forwarded to Alchemy', async () => {
    mockLimit.mockResolvedValue(okLimit())
    const res = await post()
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalled()
  })
})
