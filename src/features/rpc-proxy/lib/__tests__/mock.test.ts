/**
 * Tests for features/rpc-proxy/lib/mock.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { handleMockRequest, shouldUseMock, getMockMode } from '../mock'
import type { JsonRpcRequest } from '../../model/types'

function makeRequest(method: string, params: unknown[] = [], id: number | string | null = 1): JsonRpcRequest {
  return { jsonrpc: '2.0', method, params, id }
}

describe('getMockMode', () => {
  it('returns "success" when no mock param', () => {
    const url = new URL('http://localhost:3000/api/rpc')
    expect(getMockMode(url)).toBe('success')
  })

  it('returns "error" for ?mock=error', () => {
    const url = new URL('http://localhost:3000/api/rpc?mock=error')
    expect(getMockMode(url)).toBe('error')
  })

  it('returns "slow" for ?mock=slow', () => {
    const url = new URL('http://localhost:3000/api/rpc?mock=slow')
    expect(getMockMode(url)).toBe('slow')
  })

  it('returns "success" for ?mock=success', () => {
    const url = new URL('http://localhost:3000/api/rpc?mock=success')
    expect(getMockMode(url)).toBe('success')
  })

  it('returns "success" for unknown mock mode value', () => {
    const url = new URL('http://localhost:3000/api/rpc?mock=invalid')
    expect(getMockMode(url)).toBe('success')
  })
})

describe('shouldUseMock', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    delete process.env.ALCHEMY_API_KEY
    delete process.env.INFURA_API_KEY
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('returns true when ?mock param is present regardless of API keys', () => {
    process.env.ALCHEMY_API_KEY = 'some-key'
    const url = new URL('http://voidpay.xyz/api/rpc?mock')
    expect(shouldUseMock(url)).toBe(true)
  })

  it('returns false when API keys are configured (no mock param)', () => {
    process.env.ALCHEMY_API_KEY = 'alchemy-key'
    const url = new URL('http://voidpay.xyz/api/rpc')
    expect(shouldUseMock(url)).toBe(false)
  })

  it('returns false when INFURA_API_KEY is set (no mock param)', () => {
    process.env.INFURA_API_KEY = 'infura-key'
    const url = new URL('http://voidpay.xyz/api/rpc')
    expect(shouldUseMock(url)).toBe(false)
  })

  it('returns true for localhost when no API keys', () => {
    const url = new URL('http://localhost:3000/api/rpc')
    expect(shouldUseMock(url)).toBe(true)
  })

  it('returns true for 127.0.0.1 when no API keys', () => {
    const url = new URL('http://127.0.0.1:3000/api/rpc')
    expect(shouldUseMock(url)).toBe(true)
  })

  it('returns true when NODE_ENV is development and no API keys', () => {
    process.env.NODE_ENV = 'development'
    const url = new URL('http://voidpay.xyz/api/rpc')
    expect(shouldUseMock(url)).toBe(true)
  })
})

describe('handleMockRequest — success mode', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns error response for "error" mode', async () => {
    const request = makeRequest('eth_blockNumber')
    const promise = handleMockRequest(request, 'error')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.jsonrpc).toBe('2.0')
    expect(result.error?.code).toBe(-32603)
    expect(result.error?.message).toContain('Mock error')
    expect(result.id).toBe(1)
  })

  it('returns method-not-found for unknown method', async () => {
    const request = makeRequest('eth_unsupportedMethod')
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.error?.code).toBe(-32601)
    expect(result.error?.message).toContain('eth_unsupportedMethod')
  })

  it('handles eth_blockNumber', async () => {
    const request = makeRequest('eth_blockNumber')
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toMatch(/^0x[0-9a-f]+$/)
    expect(result.id).toBe(1)
  })

  it('handles eth_call', async () => {
    const request = makeRequest('eth_call', [{ to: '0x1234', data: '0x' }, 'latest'])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toMatch(/^0x/)
    expect(result.error).toBeUndefined()
  })

  it('handles eth_getBalance', async () => {
    const request = makeRequest('eth_getBalance', ['0x0000000000000000000000000000000000000001', 'latest'])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('0x1bc16d674ec80000')
  })

  it('handles eth_getGasPrice', async () => {
    const request = makeRequest('eth_getGasPrice')
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('0x3b9aca00')
  })

  it('handles eth_maxPriorityFeePerGas', async () => {
    const request = makeRequest('eth_maxPriorityFeePerGas')
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('0x59682f00')
  })

  it('handles eth_feeHistory', async () => {
    const request = makeRequest('eth_feeHistory', [4, 'latest', [25, 75]])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    const feeHistory = result.result as { oldestBlock: string; baseFeePerGas: string[] }
    expect(feeHistory.oldestBlock).toBe('0x1')
    expect(Array.isArray(feeHistory.baseFeePerGas)).toBe(true)
  })

  it('handles eth_estimateGas', async () => {
    const request = makeRequest('eth_estimateGas', [{ to: '0x1234', value: '0x0' }])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('0x5208')
  })

  it('handles eth_getTransactionCount', async () => {
    const request = makeRequest('eth_getTransactionCount', ['0x1234', 'latest'])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('0x1')
  })

  it('handles eth_sendRawTransaction and returns a tx hash', async () => {
    const request = makeRequest('eth_sendRawTransaction', ['0xdeadbeef'])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(typeof result.result).toBe('string')
    expect(result.result as string).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it('handles eth_getTransactionByHash for unknown hash (null result)', async () => {
    const request = makeRequest('eth_getTransactionByHash', ['0x' + 'ab'.repeat(32)])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBeNull()
  })

  it('handles eth_getTransactionReceipt for unknown hash (null result)', async () => {
    const request = makeRequest('eth_getTransactionReceipt', ['0x' + 'ab'.repeat(32)])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBeNull()
  })

  it('handles eth_getBlockByNumber', async () => {
    const request = makeRequest('eth_getBlockByNumber', ['latest', false])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    const block = result.result as { transactions: unknown[] }
    expect(Array.isArray(block.transactions)).toBe(true)
  })

  it('handles eth_getCode', async () => {
    const request = makeRequest('eth_getCode', ['0x1234', 'latest'])
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('0x')
  })

  it('handles eth_chainId with default chainId=1', async () => {
    const request = makeRequest('eth_chainId')
    const promise = handleMockRequest(request, 'success', 1)
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('0x1')
  })

  it('handles eth_chainId with chainId=137 (Polygon)', async () => {
    const request = makeRequest('eth_chainId')
    const promise = handleMockRequest(request, 'success', 137)
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('0x89')
  })

  it('handles net_version with default chainId=1', async () => {
    const request = makeRequest('net_version')
    const promise = handleMockRequest(request, 'success', 1)
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('1')
  })

  it('handles net_version with chainId=42161 (Arbitrum)', async () => {
    const request = makeRequest('net_version')
    const promise = handleMockRequest(request, 'success', 42161)
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.result).toBe('42161')
  })

  it('preserves request id in response', async () => {
    const request = makeRequest('eth_blockNumber', [], 'my-id-42')
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.id).toBe('my-id-42')
  })

  it('preserves null id in response', async () => {
    const request = makeRequest('eth_blockNumber', [], null)
    const promise = handleMockRequest(request, 'success')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(result.id).toBeNull()
  })
})

describe('handleMockRequest — sendRawTransaction + receipt flow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('receipt is null (pending) immediately after sendRawTransaction', async () => {
    // Mock Math.random to return 0 → delay = 1000ms (minimum for success mode)
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const sendRequest = makeRequest('eth_sendRawTransaction', ['0xdeadbeef'])
    const sendPromise = handleMockRequest(sendRequest, 'success')
    await vi.advanceTimersByTimeAsync(1000) // only initial delay, NOT the 3s confirmation
    const sendResult = await sendPromise
    const txHash = sendResult.result as string

    const receiptRequest = makeRequest('eth_getTransactionReceipt', [txHash])
    const receiptPromise = handleMockRequest(receiptRequest, 'success')
    await vi.advanceTimersByTimeAsync(1000) // only receipt's initial delay
    const receiptResult = await receiptPromise
    // Confirmation timer (3000ms from send) hasn't fired yet (only 2000ms total)
    expect(receiptResult.result).toBeNull()
  })

  it('getTransactionByHash returns tx data for known pending tx', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const sendRequest = makeRequest('eth_sendRawTransaction', ['0xdeadbeef'])
    const sendPromise = handleMockRequest(sendRequest, 'success')
    await vi.advanceTimersByTimeAsync(1000)
    const sendResult = await sendPromise
    const txHash = sendResult.result as string

    const getByHashRequest = makeRequest('eth_getTransactionByHash', [txHash])
    const getPromise = handleMockRequest(getByHashRequest, 'success')
    await vi.advanceTimersByTimeAsync(1000)
    const result = await getPromise
    const tx = result.result as { hash: string; blockNumber: string | null }
    expect(tx.hash).toBe(txHash)
    expect(tx.blockNumber).toBeNull() // still pending
  })
})
