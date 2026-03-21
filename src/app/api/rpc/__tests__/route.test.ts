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
  extractIpAddress: vi.fn(() => '127.0.0.1'),
  checkRateLimit: vi.fn(async () => ({ allowed: true, remaining: 95, limit: 100 })),
  proxyRequest: vi.fn(async (body: unknown) => ({
    response: { jsonrpc: '2.0', result: '0x1', id: (body as { id: unknown }).id ?? 1 },
    provider: 'primary',
    requestId: 'req_test_123',
  })),
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
    vi.mocked(mod.checkRateLimit).mockResolvedValue({ allowed: true, remaining: 95, limit: 100 })
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
    vi.mocked(mod.checkRateLimit).mockResolvedValue({ allowed: true, remaining: 95, limit: 100 })
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
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.shouldUseMock).mockReturnValue(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 503 when rate limiter is unavailable', async () => {
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.checkRateLimit).mockResolvedValue({
      allowed: false,
      unavailable: true,
      remaining: 0,
      limit: 0,
    })

    const { POST } = await import('../route')
    const res = await POST(makeNextRequest(validBody))
    expect(res.status).toBe(503)
    const json = await res.json()
    expect(json.error.code).toBe(-32603)
    expect(res.headers.get('retry-after')).toBe('30')
  })

  it('returns 429 when rate limit is exceeded', async () => {
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 100,
    })

    const { POST } = await import('../route')
    const res = await POST(makeNextRequest(validBody))
    expect(res.status).toBe(429)
    const json = await res.json()
    expect(json.error.code).toBe(429)
    expect(res.headers.get('retry-after')).toBe('60')
    expect(res.headers.get('x-ratelimit-limit')).toBe('100')
  })

  it('includes rate limit headers on success', async () => {
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.checkRateLimit).mockResolvedValue({ allowed: true, remaining: 42, limit: 100 })
    vi.mocked(mod.proxyRequest).mockResolvedValue({
      response: { jsonrpc: '2.0', result: '0x1', id: 1 },
      provider: 'primary',
      requestId: 'req_test',
    })

    const { POST } = await import('../route')
    const res = await POST(makeNextRequest(validBody))
    expect(res.status).toBe(200)
    expect(res.headers.get('x-ratelimit-limit')).toBe('100')
    expect(res.headers.get('x-ratelimit-remaining')).toBe('42')
  })
})

describe('POST /api/rpc — proxy results', () => {
  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('@/features/rpc-proxy')
    vi.mocked(mod.shouldUseMock).mockReturnValue(false)
    vi.mocked(mod.checkRateLimit).mockResolvedValue({ allowed: true, remaining: 95, limit: 100 })
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
  it('returns 204 with CORS headers', async () => {
    const { OPTIONS } = await import('../route')
    const req = new NextRequest('http://localhost:3000/api/rpc', {
      method: 'OPTIONS',
      headers: { origin: 'https://voidpay.xyz' },
    })
    const res = await OPTIONS(req)
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-methods')).toContain('POST')
    // origin header may be echoed or fall back to '*' depending on runtime
    const allowOrigin = res.headers.get('access-control-allow-origin')
    expect(allowOrigin === 'https://voidpay.xyz' || allowOrigin === '*').toBe(true)
    expect(res.headers.get('access-control-max-age')).toBe('86400')
  })

  it('returns * for access-control-allow-origin when no origin header', async () => {
    const { OPTIONS } = await import('../route')
    const req = new NextRequest('http://localhost:3000/api/rpc', { method: 'OPTIONS' })
    const res = await OPTIONS(req)
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })
})
