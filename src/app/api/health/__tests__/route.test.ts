/**
 * Tests for src/app/api/health/route.ts
 * #368: health must not hit Redis on every GET (Upstash free-plan quota).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockPing } = vi.hoisted(() => ({ mockPing: vi.fn() }))

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    ping = mockPing
  },
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    class MockRatelimit {
      limit = vi.fn()
    },
    { slidingWindow: vi.fn(), fixedWindow: vi.fn() }
  ),
}))

async function loadGET() {
  return (await import('../route')).GET
}

beforeEach(() => {
  vi.resetModules()
  mockPing.mockReset().mockResolvedValue('PONG')
  vi.stubEnv('ALCHEMY_API_KEY', 'a')
  vi.stubEnv('INFURA_API_KEY', 'i')
  vi.stubEnv('KV_REST_API_URL', 'https://example.upstash.io')
  vi.stubEnv('KV_REST_API_TOKEN', 'test-token')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('GET /api/health', () => {
  it('reports ok when RPC and Redis are healthy', async () => {
    const GET = await loadGET()
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.checks.rateLimiter).toEqual({ configured: true, reachable: true })
  })

  it('is CDN-cacheable for 30 s', async () => {
    const GET = await loadGET()
    const res = await GET()
    expect(res.headers.get('cache-control')).toBe('public, s-maxage=30')
  })

  it('does not ping Redis on every GET within 30 s', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000)
    const GET = await loadGET()
    await GET()
    await GET()
    now.mockReturnValue(1_800_000_000_000 + 10_000)
    await GET()
    expect(mockPing).toHaveBeenCalledTimes(1)

    now.mockReturnValue(1_800_000_000_000 + 30_000)
    await GET()
    expect(mockPing).toHaveBeenCalledTimes(2)
  })

  it('reports degraded when Redis is unreachable', async () => {
    mockPing.mockRejectedValue(new Error('archived'))
    const GET = await loadGET()
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('degraded')
    expect(body.checks.rateLimiter).toEqual({ configured: true, reachable: false })
  })

  it('reports degraded without pinging when Redis is not configured', async () => {
    vi.stubEnv('KV_REST_API_URL', '')
    const GET = await loadGET()
    const body = await (await GET()).json()
    expect(body.status).toBe('degraded')
    expect(body.checks.rateLimiter).toEqual({ configured: false, reachable: false })
    expect(mockPing).not.toHaveBeenCalled()
  })

  it('returns 503 unavailable when RPC is not configured', async () => {
    vi.stubEnv('INFURA_API_KEY', '')
    const GET = await loadGET()
    const res = await GET()
    expect(res.status).toBe(503)
    expect((await res.json()).status).toBe('unavailable')
  })
})
