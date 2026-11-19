/**
 * /api/rpc fail-closed contract, end-to-end through the real edge-guard (#368).
 * Only Upstash and the upstream provider are mocked.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockLimit, ctor, mockProxy } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
  ctor: { throws: false },
  mockProxy: vi.fn(),
}))

vi.mock('@upstash/redis', () => ({ Redis: class MockRedis {} }))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    class MockRatelimit {
      limit = mockLimit
      constructor() {
        if (ctor.throws) throw new Error('bad config')
      }
    },
    { slidingWindow: vi.fn(), fixedWindow: vi.fn() }
  ),
}))

vi.mock('@/features/rpc-proxy', () => ({
  shouldUseMock: vi.fn(() => false),
  getMockMode: vi.fn(),
  handleMockRequest: vi.fn(),
  proxyRequest: mockProxy,
}))

const NOW = 1_800_000_000_000

function request(): NextRequest {
  return new NextRequest('http://localhost:3000/api/rpc', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.7' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
  })
}

async function post() {
  const { POST } = await import('../route')
  return POST(request())
}

beforeEach(() => {
  vi.resetModules()
  mockLimit.mockReset()
  mockProxy.mockReset().mockResolvedValue({
    response: { jsonrpc: '2.0', result: '0x1', id: 1 },
    provider: 'primary',
    requestId: 'r',
  })
  ctor.throws = false
  vi.stubEnv('KV_REST_API_URL', 'https://example.upstash.io')
  vi.stubEnv('KV_REST_API_TOKEN', 'test-token')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('/api/rpc — fail-closed', () => {
  const failures: [string, () => void][] = [
    ['missing KV env', () => vi.stubEnv('KV_REST_API_URL', '')],
    ['Ratelimit constructor throws', () => (ctor.throws = true)],
    ['limit() throws', () => mockLimit.mockRejectedValue(new Error('ECONNREFUSED'))],
    [
      "limit() resolves reason:'timeout'",
      () => mockLimit.mockResolvedValue({ success: true, limit: 0, remaining: 0, reset: 0, reason: 'timeout' }),
    ],
  ]

  it.each(failures)('%s → 503, Retry-After: 30, no upstream call', async (_name, arrange) => {
    arrange()
    const res = await post()
    expect(res.status).toBe(503)
    expect(res.headers.get('retry-after')).toBe('30')
    expect(mockProxy).not.toHaveBeenCalled()
  })

  it('deny → 429 with Retry-After from reset, no upstream call', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW)
    mockLimit.mockResolvedValue({ success: false, limit: 100, remaining: 0, reset: NOW + 7_001 })
    const res = await post()
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBe('8')
    expect(res.headers.get('x-ratelimit-limit')).toBe('100')
    expect(mockProxy).not.toHaveBeenCalled()
  })

  it('allow → proxied', async () => {
    mockLimit.mockResolvedValue({ success: true, limit: 100, remaining: 99, reset: NOW + 60_000 })
    const res = await post()
    expect(res.status).toBe(200)
    expect(mockProxy).toHaveBeenCalledTimes(1)
    // The limiter saw an HMAC, never the raw IP
    expect(mockLimit.mock.calls[0]![0]).toMatch(/^[0-9a-f]{32}$/)
  })
})
