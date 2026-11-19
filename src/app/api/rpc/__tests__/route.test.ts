/**
 * Tests for src/app/api/rpc/route.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock the rpc-proxy feature module
vi.mock('@/features/rpc-proxy', () => ({
  shouldUseMock: vi.fn(() => false),
  getMockMode: vi.fn(() => 'success'),
  handleMockRequest: vi.fn(async (body: unknown) => ({
    jsonrpc: '2.0',
    result: 'mock-result',
    id: (body as { id: unknown }).id ?? 1,
  })),
  proxyRequest: vi.fn(async (body: unknown) => ({
    response: { jsonrpc: '2.0', result: '0x1', id: (body as { id: unknown }).id ?? 1 },
    provider: 'primary',
    requestId: 'req_test_123',
  })),
}))

// Real header/origin helpers; only the Redis-backed decision is mocked
vi.mock('@/shared/lib/edge-guard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/edge-guard')>()),
  checkRateLimit: vi.fn(async () => ALLOW),
}))

const { ALLOW } = vi.hoisted(() => ({
  ALLOW: { kind: 'allow', limit: 100, remaining: 95, reset: 0 } as const,
}))

function makeNextRequest(
  body: unknown,
  {
    origin,
    referer,
    host,
    url = 'http://localhost:3000/api/rpc',
  }: { origin?: string; referer?: string; host?: string; url?: string } = {}
): NextRequest {
  const h = new Headers({ 'content-type': 'application/json' })
  // Force-set headers that some test environments strip as "forbidden"
  if (origin) h.set('origin', origin)
  if (referer) h.set('referer', referer)
  if (host) h.set('host', host)
  const req = new NextRequest(url, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(body),
  })
  // Double-set: some environments strip forbidden headers during construction
  if (origin) req.headers.set('origin', origin)
  if (referer) req.headers.set('referer', referer)
  if (host) req.headers.set('host', host)
  return req
}

const validBody = { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }

describe('POST /api/rpc — origin validation (production)', () => {
  beforeEach(async () => {
    vi.resetModules()
    // Reset the mock to default
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.shouldUseMock).mockReturnValue(false)
    vi.mocked((await import('@/shared/lib/edge-guard')).checkRateLimit).mockResolvedValue(ALLOW)
    vi.mocked(mod.proxyRequest).mockResolvedValue({
      response: { jsonrpc: '2.0', result: '0x1', id: 1 },
      provider: 'primary',
      requestId: 'req_test',
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('rejects request with no origin/referer in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { POST } = await import('../route')
    const req = makeNextRequest(validBody, { host: 'voidpay.xyz' })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe(-32600)
    expect(json.error.message).toBe('Invalid origin')
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('rejects a cross-site origin before the rate limiter and body parse', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { checkRateLimit } = await import('@/shared/lib/edge-guard')
    const { POST } = await import('../route')
    const req = new NextRequest('https://voidpay.xyz/api/rpc', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.com', host: 'voidpay.xyz' },
      body: 'not-json{{{',
    })
    req.headers.set('origin', 'https://evil.com')
    const res = await POST(req)
    expect(res.status).toBe(403)
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
    expect(vi.mocked(checkRateLimit)).not.toHaveBeenCalled()
  })

  it('allows request from same host (voidpay.xyz) in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { POST } = await import('../route')
    const req = makeNextRequest(validBody, {
      origin: 'https://voidpay.xyz',
      host: 'voidpay.xyz',
      url: 'https://voidpay.xyz/api/rpc',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('allows request from subdomain of voidpay.xyz in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { POST } = await import('../route')
    const req = makeNextRequest(validBody, {
      origin: 'https://staging.voidpay.xyz',
      host: 'voidpay.xyz',
      url: 'https://voidpay.xyz/api/rpc',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('allows request via referer from voidpay.xyz in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { POST } = await import('../route')
    const req = makeNextRequest(validBody, {
      referer: 'https://voidpay.xyz/create',
      host: 'voidpay.xyz',
      url: 'https://voidpay.xyz/api/rpc',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('does not validate origin in development', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const { POST } = await import('../route')
    const req = makeNextRequest(validBody)
    const res = await POST(req)
    // Should not 403 — may fail for other reasons but not origin
    expect(res.status).not.toBe(403)
  })
})

describe('POST /api/rpc — request validation', () => {
  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.shouldUseMock).mockReturnValue(false)
    vi.mocked((await import('@/shared/lib/edge-guard')).checkRateLimit).mockResolvedValue(ALLOW)
    vi.mocked(mod.proxyRequest).mockResolvedValue({
      response: { jsonrpc: '2.0', result: '0x1', id: 1 },
      provider: 'primary',
      requestId: 'req_test',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 400 when jsonrpc is not "2.0"', async () => {
    const { POST } = await import('../route')
    const req = makeNextRequest({ jsonrpc: '1.0', method: 'eth_blockNumber', params: [], id: 1 })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe(-32600)
    expect(json.error.message).toContain('"2.0"')
  })

  it('returns 400 when jsonrpc is missing', async () => {
    const { POST } = await import('../route')
    const req = makeNextRequest({ method: 'eth_blockNumber', params: [], id: 1 })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe(-32600)
  })

  it('returns 400 when method is missing', async () => {
    const { POST } = await import('../route')
    const req = makeNextRequest({ jsonrpc: '2.0', params: [], id: 1 })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.message).toContain('method is required')
  })

  it('returns 400 for invalid chainId (non-numeric)', async () => {
    const { POST } = await import('../route')
    const req = makeNextRequest(validBody, { url: 'http://localhost:3000/api/rpc?chainId=abc' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe(-32602)
    expect(json.error.message).toContain('chainId')
  })

  it('returns 400 for invalid chainId (negative)', async () => {
    const { POST } = await import('../route')
    const req = makeNextRequest(validBody, { url: 'http://localhost:3000/api/rpc?chainId=-1' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe(-32602)
  })

  it('returns 400 for invalid chainId (zero)', async () => {
    const { POST } = await import('../route')
    const req = makeNextRequest(validBody, { url: 'http://localhost:3000/api/rpc?chainId=0' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 500 for invalid JSON body', async () => {
    const { POST } = await import('../route')
    const req = new NextRequest('http://localhost:3000/api/rpc', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json{{{',
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})

describe('POST /api/rpc — mock mode', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.mocked((await import('@/shared/lib/edge-guard')).checkRateLimit).mockResolvedValue(ALLOW)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses mock mode when shouldUseMock returns true', async () => {
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.shouldUseMock).mockReturnValue(true)
    vi.mocked(mod.getMockMode).mockReturnValue('success')
    vi.mocked(mod.handleMockRequest).mockResolvedValue({
      jsonrpc: '2.0',
      result: 'mock-result',
      id: 1,
    })

    const { POST } = await import('../route')
    const req = makeNextRequest(validBody, { url: 'http://localhost:3000/api/rpc?mock' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.result).toBe('mock-result')
    expect(res.headers.get('x-mock-mode')).toBe('success')
  })

  it('returns 400 for mock error response', async () => {
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.shouldUseMock).mockReturnValue(true)
    vi.mocked(mod.getMockMode).mockReturnValue('error')
    vi.mocked(mod.handleMockRequest).mockResolvedValue({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Mock error' },
      id: 1,
    })

    const { POST } = await import('../route')
    const req = makeNextRequest(validBody, { url: 'http://localhost:3000/api/rpc?mock=error' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(res.headers.get('x-mock-mode')).toBe('error')
  })
})

describe('POST /api/rpc — rate limiting', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.mocked((await import('@/shared/lib/edge-guard')).checkRateLimit).mockReset().mockResolvedValue(ALLOW)
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.shouldUseMock).mockReturnValue(false)
    vi.mocked(mod.proxyRequest).mockResolvedValue({
      response: { jsonrpc: '2.0', result: '0x1', id: 1 },
      provider: 'primary',
      requestId: 'req_test',
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it.each(['unconfigured', 'error', 'timeout'] as const)(
    'returns 503 with Retry-After: 30 when the limiter is unavailable (%s)',
    async (cause) => {
      const { checkRateLimit } = await import('@/shared/lib/edge-guard')
      vi.mocked(checkRateLimit).mockResolvedValue({ kind: 'unavailable', cause })
      const mod = await import('@/features/rpc-proxy')

      const { POST } = await import('../route')
      const res = await POST(makeNextRequest(validBody))
      expect(res.status).toBe(503)
      expect(res.headers.get('retry-after')).toBe('30')
      // Generic body: the cause is never disclosed
      expect(await res.json()).toEqual({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Service temporarily unavailable. Please try again later.' },
        id: null,
      })
      expect(vi.mocked(mod.proxyRequest)).not.toHaveBeenCalled()
    }
  )

  it('returns 429 with Retry-After computed from reset', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000)
    const { checkRateLimit } = await import('@/shared/lib/edge-guard')
    vi.mocked(checkRateLimit).mockResolvedValue({
      kind: 'deny',
      limit: 100,
      remaining: 0,
      reset: 1_800_000_000_000 + 41_500,
    })
    const mod = await import('@/features/rpc-proxy')

    const { POST } = await import('../route')
    const res = await POST(makeNextRequest(validBody))
    expect(res.status).toBe(429)
    const json = await res.json()
    expect(json.error.code).toBe(429)
    expect(res.headers.get('retry-after')).toBe('42')
    expect(res.headers.get('x-ratelimit-limit')).toBe('100')
    expect(res.headers.get('x-ratelimit-remaining')).toBe('0')
    expect(vi.mocked(mod.proxyRequest)).not.toHaveBeenCalled()
  })

  it('rate-limits before parsing the body', async () => {
    const { checkRateLimit } = await import('@/shared/lib/edge-guard')
    vi.mocked(checkRateLimit).mockResolvedValue({ kind: 'deny', limit: 100, remaining: 0, reset: 0 })

    const { POST } = await import('../route')
    const res = await POST(
      new NextRequest('http://localhost:3000/api/rpc', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not-json{{{',
      })
    )
    expect(res.status).toBe(429)
  })

  it('checks the rpc policy with the request headers', async () => {
    const { checkRateLimit } = await import('@/shared/lib/edge-guard')
    const { POST } = await import('../route')
    await POST(makeNextRequest(validBody))
    expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith('rpc', expect.any(Headers))
  })

  it('includes rate limit headers on success', async () => {
    const { checkRateLimit } = await import('@/shared/lib/edge-guard')
    vi.mocked(checkRateLimit).mockResolvedValue({ kind: 'allow', limit: 100, remaining: 42, reset: 0 })

    const { POST } = await import('../route')
    const res = await POST(makeNextRequest(validBody))
    expect(res.status).toBe(200)
    expect(res.headers.get('x-ratelimit-limit')).toBe('100')
    expect(res.headers.get('x-ratelimit-remaining')).toBe('42')
  })

  it('rate-limits mock-mode requests too', async () => {
    const { checkRateLimit } = await import('@/shared/lib/edge-guard')
    vi.mocked(checkRateLimit).mockResolvedValue({ kind: 'deny', limit: 100, remaining: 0, reset: 0 })
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.shouldUseMock).mockReturnValue(true)

    const { POST } = await import('../route')
    const res = await POST(makeNextRequest(validBody, { url: 'http://localhost:3000/api/rpc?mock=slow' }))
    expect(res.status).toBe(429)
    expect(vi.mocked(mod.handleMockRequest)).not.toHaveBeenCalled()
  })

  it('?mock= in production goes through the limiter and the real provider', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALCHEMY_API_KEY', '')
    vi.stubEnv('INFURA_API_KEY', '')
    const { checkRateLimit } = await import('@/shared/lib/edge-guard')
    const mod = await import('@/features/rpc-proxy')
    const realMock = await vi.importActual<typeof import('@/features/rpc-proxy/lib/mock')>(
      '@/features/rpc-proxy/lib/mock'
    )
    vi.mocked(mod.shouldUseMock).mockImplementation(realMock.shouldUseMock)

    const { POST } = await import('../route')
    const res = await POST(
      makeNextRequest(validBody, {
        origin: 'https://voidpay.xyz',
        host: 'voidpay.xyz',
        url: 'https://voidpay.xyz/api/rpc?mock=slow',
      })
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('x-mock-mode')).toBeNull()
    expect(vi.mocked(checkRateLimit)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(mod.proxyRequest)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(mod.handleMockRequest)).not.toHaveBeenCalled()
  })
})

describe('POST /api/rpc — proxy results', () => {
  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.shouldUseMock).mockReturnValue(false)
    vi.mocked((await import('@/shared/lib/edge-guard')).checkRateLimit).mockResolvedValue(ALLOW)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 503 when all providers unavailable', async () => {
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.proxyRequest).mockResolvedValue({
      response: {
        jsonrpc: '2.0',
        error: { code: -32603, message: 'All RPC providers unavailable. Please try again later.' },
        id: 1,
      },
      provider: 'fallback',
      requestId: 'req_test',
    })

    const { POST } = await import('../route')
    const res = await POST(makeNextRequest(validBody))
    expect(res.status).toBe(503)
    expect(res.headers.get('retry-after')).toBe('60')
  })

  it('returns 400 for provider-specific error', async () => {
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.proxyRequest).mockResolvedValue({
      response: {
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not allowed: eth_subscribe' },
        id: 1,
      },
      provider: 'primary',
      requestId: 'req_test',
    })

    const { POST } = await import('../route')
    const res = await POST(makeNextRequest(validBody))
    expect(res.status).toBe(400)
  })

  it('uses chainId=1 when no chainId param', async () => {
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.proxyRequest).mockResolvedValue({
      response: { jsonrpc: '2.0', result: '0x1', id: 1 },
      provider: 'primary',
      requestId: 'req_test',
    })

    const { POST } = await import('../route')
    await POST(makeNextRequest(validBody))
    expect(vi.mocked(mod.proxyRequest)).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'eth_blockNumber' }),
      1
    )
  })

  it('passes chainId from query param', async () => {
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.proxyRequest).mockResolvedValue({
      response: { jsonrpc: '2.0', result: '0x89', id: 1 },
      provider: 'primary',
      requestId: 'req_test',
    })

    const { POST } = await import('../route')
    await POST(makeNextRequest(validBody, { url: 'http://localhost:3000/api/rpc?chainId=137' }))
    expect(vi.mocked(mod.proxyRequest)).toHaveBeenCalledWith(expect.anything(), 137)
  })
})

describe('Non-POST handlers', () => {
  it('GET returns 405', async () => {
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('POST')
  })

  it('PUT returns 405', async () => {
    const { PUT } = await import('../route')
    const res = await PUT()
    expect(res.status).toBe(405)
  })

  it('DELETE returns 405', async () => {
    const { DELETE } = await import('../route')
    const res = await DELETE()
    expect(res.status).toBe(405)
  })

  it('PATCH returns 405', async () => {
    const { PATCH } = await import('../route')
    const res = await PATCH()
    expect(res.status).toBe(405)
  })
})

describe('OPTIONS /api/rpc — CORS preflight', () => {
  it('returns 204 without Access-Control-Allow-Origin (same-origin only)', async () => {
    const { OPTIONS } = await import('../route')
    const res = await OPTIONS()
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
    expect(res.headers.get('access-control-allow-credentials')).toBeNull()
  })
})
