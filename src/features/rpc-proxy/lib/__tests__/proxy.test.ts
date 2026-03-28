/**
 * Tests for features/rpc-proxy/lib/proxy.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { JsonRpcRequest } from '../../model/types'

// Mock config and validateServerSideOnly before importing proxy
vi.mock('../config', () => ({
  loadRpcConfig: vi.fn(() => ({
    providers: {
      primary: { name: 'Alchemy', url: 'https://alchemy.example.com', apiKey: 'alchemy-key' },
      fallback: { name: 'Infura', url: 'https://infura.example.com', apiKey: 'infura-key' },
    },
    rateLimit: { requestsPerMinute: 100, windowSeconds: 60 },
    mock: { enabled: false },
  })),
  validateServerSideOnly: vi.fn(), // no-op in tests (Node env)
}))

function makeRequest(method: string, params: unknown[] = [], id: number | string | null = 1): JsonRpcRequest {
  return { jsonrpc: '2.0', method, params, id }
}

function makeJsonResponse(result: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve({ jsonrpc: '2.0', result, id: 1 }),
  } as unknown as Response
}

function makeJsonErrorResponse(code: number, message: string) {
  return {
    ok: true,
    json: () => Promise.resolve({ jsonrpc: '2.0', error: { code, message }, id: 1 }),
  } as unknown as Response
}

describe('proxyRequest — allowed methods', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns method-not-allowed error for disallowed method', async () => {
    const { proxyRequest } = await import('../proxy')
    const request = makeRequest('eth_subscribe')
    const result = await proxyRequest(request, 1)
    expect(result.response.error?.code).toBe(-32601)
    expect(result.response.error?.message).toContain('eth_subscribe')
    expect(result.provider).toBe('primary')
    expect(result.requestId).toMatch(/^req_/)
  })

  it('returns method-not-allowed for admin_peers', async () => {
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('admin_peers'), 1)
    expect(result.response.error?.code).toBe(-32601)
  })

  it('returns successful response from primary provider', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(makeJsonResponse('0x1234'))
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('eth_blockNumber'), 1)
    expect(result.provider).toBe('primary')
    expect(result.response.result).toBe('0x1234')
    expect(result.requestId).toMatch(/^req_/)
  })

  it('falls over to fallback when primary fails', async () => {
    vi.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Primary timeout'))
      .mockResolvedValueOnce(makeJsonResponse('0x5678'))
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('eth_blockNumber'), 1)
    expect(result.provider).toBe('fallback')
    expect(result.response.result).toBe('0x5678')
  })

  it('returns error when both providers fail', async () => {
    vi.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Primary down'))
      .mockRejectedValueOnce(new Error('Fallback down'))
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('eth_blockNumber'), 1)
    expect(result.provider).toBe('fallback')
    expect(result.response.error?.code).toBe(-32603)
    expect(result.response.error?.message).toContain('unavailable')
  })

  it('triggers failover for retryable RPC error code -32603', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(makeJsonErrorResponse(-32603, 'Internal error'))
      .mockResolvedValueOnce(makeJsonResponse('0xabc'))
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('eth_blockNumber'), 1)
    expect(result.provider).toBe('fallback')
    expect(result.response.result).toBe('0xabc')
  })

  it('triggers failover for retryable RPC error code -32000', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(makeJsonErrorResponse(-32000, 'Server error'))
      .mockResolvedValueOnce(makeJsonResponse('0xdef'))
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('eth_call'), 1)
    expect(result.provider).toBe('fallback')
    expect(result.response.result).toBe('0xdef')
  })

  it('triggers failover for rate limit error code 429', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(makeJsonErrorResponse(429, 'Too many requests'))
      .mockResolvedValueOnce(makeJsonResponse('0x1'))
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('eth_getBalance'), 1)
    expect(result.provider).toBe('fallback')
  })

  it('does NOT trigger failover for non-retryable error code -32601', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(makeJsonErrorResponse(-32601, 'Method not found'))
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('eth_blockNumber'), 1)
    // Non-retryable: stays on primary, returns error as-is
    expect(result.provider).toBe('primary')
    expect(result.response.error?.code).toBe(-32601)
  })

  it('throws when HTTP response is not ok', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
      .mockResolvedValueOnce(makeJsonResponse('0x1'))
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('eth_blockNumber'), 1)
    expect(result.provider).toBe('fallback')
  })

  it('generates unique requestIds per call', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(makeJsonResponse('0x1'))
    const { proxyRequest } = await import('../proxy')
    const [r1, r2] = await Promise.all([
      proxyRequest(makeRequest('eth_blockNumber'), 1),
      proxyRequest(makeRequest('eth_blockNumber'), 1),
    ])
    expect(r1.requestId).not.toBe(r2.requestId)
  })

  it('preserves request id in response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ jsonrpc: '2.0', result: '0x1', id: 'my-custom-id' }),
    } as unknown as Response)
    const { proxyRequest } = await import('../proxy')
    const result = await proxyRequest(makeRequest('eth_blockNumber', [], 'my-custom-id'), 1)
    expect(result.response.id).toBe('my-custom-id')
  })
})

describe('proxyRequest — all allowed methods pass through', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const allowedMethods = [
    'eth_blockNumber',
    'eth_call',
    'eth_getBalance',
    'eth_getGasPrice',
    'eth_maxPriorityFeePerGas',
    'eth_feeHistory',
    'eth_estimateGas',
    'eth_getTransactionCount',
    'eth_sendRawTransaction',
    'eth_getTransactionByHash',
    'eth_getTransactionReceipt',
    'eth_getBlockByNumber',
    'eth_getCode',
    'eth_chainId',
    'net_version',
  ]

  for (const method of allowedMethods) {
    it(`allows ${method}`, async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(makeJsonResponse('0x1'))
      const { proxyRequest } = await import('../proxy')
      const result = await proxyRequest(makeRequest(method), 1)
      expect(result.response.error?.code).not.toBe(-32601)
    })
  }
})
