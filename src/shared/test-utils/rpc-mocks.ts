/**
 * RPC Mock Utilities for Web3 Testing
 *
 * Provides utilities to mock RPC calls in tests without making actual network requests.
 * This is critical for:
 * - Faster tests (no network latency)
 * - Deterministic results (no flaky tests from network issues)
 * - Testing edge cases (simulate errors, specific responses)
 * - CI/CD environments (no external dependencies)
 *
 * Usage:
 * ```ts
 * import { mockRpcCall, mockGetBalance, createMockRpcHandler } from '@/shared/test-utils/rpc-mocks'
 *
 * // Mock a specific balance
 * vi.spyOn(globalThis, 'fetch').mockImplementation(mockGetBalance('0x...', '1000000000000000000'))
 *
 * // Or use the handler for multiple calls
 * vi.spyOn(globalThis, 'fetch').mockImplementation(createMockRpcHandler({
 *   eth_getBalance: () => '0x1000000000000000000',
 *   eth_call: () => '0x...',
 * }))
 * ```
 */

import { vi } from 'vitest'

// Common ERC20 token addresses for testing
export const MOCK_TOKENS = {
  USDC_MAINNET: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT_MAINNET: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI_MAINNET: '0x6B175474E89094C44Da98b954EesdfcDC46f',
  WETH_MAINNET: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
} as const

// Common test wallet addresses
export const MOCK_WALLETS = {
  SENDER: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  RECEIVER: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  EMPTY: '0x0000000000000000000000000000000000000000',
} as const

// Type for RPC method handlers
export type RpcMethodHandler = (params: unknown[]) => unknown
export type RpcHandlerMap = Record<string, RpcMethodHandler>

/**
 * Creates a JSON-RPC response object
 */
export function createRpcResponse<T>(id: number | string, result: T) {
  return {
    jsonrpc: '2.0',
    id,
    result,
  }
}

/**
 * Creates a JSON-RPC error response
 */
export function createRpcError(id: number | string, code: number, message: string) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
    },
  }
}

/**
 * Creates a mock fetch handler for RPC calls
 *
 * @param handlers - Map of RPC method names to handler functions
 * @returns A mock fetch implementation
 */
export function createMockRpcHandler(handlers: RpcHandlerMap) {
  return async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Only intercept POST requests (RPC calls)
    if (init?.method !== 'POST' || !init?.body) {
      return new Response('Not Found', { status: 404 })
    }

    const body = JSON.parse(init.body as string)
    const { id, method, params } = body

    const handler = handlers[method]
    if (handler) {
      const result = handler(params || [])
      return new Response(JSON.stringify(createRpcResponse(id, result)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Return error for unhandled methods
    return new Response(JSON.stringify(createRpcError(id, -32601, `Method not found: ${method}`)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * Creates a mock for eth_getBalance that returns a specific balance
 *
 * @param address - The address to check (for validation)
 * @param balance - The balance to return (in wei, as hex string or decimal string)
 */
export function mockGetBalance(address: string, balance: string) {
  const hexBalance = balance.startsWith('0x') ? balance : `0x${BigInt(balance).toString(16)}`
  return createMockRpcHandler({
    eth_getBalance: (params) => {
      const requestedAddress = (params as string[])[0]
      if (requestedAddress && requestedAddress.toLowerCase() === address.toLowerCase()) {
        return hexBalance
      }
      return '0x0'
    },
  })
}

/**
 * Creates a mock for eth_call (used for ERC20 balanceOf, etc.)
 *
 * @param responses - Map of call data to responses
 */
export function mockEthCall(responses: Record<string, string>) {
  return createMockRpcHandler({
    eth_call: (params) => {
      const [{ to, data }] = params as [{ to: string; data: string }]
      const key = `${to.toLowerCase()}-${data.toLowerCase()}`
      return responses[key] || '0x0'
    },
  })
}

/**
 * Creates a mock for eth_blockNumber
 */
export function mockBlockNumber(blockNumber: number) {
  return createMockRpcHandler({
    eth_blockNumber: () => `0x${blockNumber.toString(16)}`,
  })
}

/**
 * Creates a mock for eth_getTransactionReceipt
 */
export function mockTransactionReceipt(
  txHash: string,
  status: 'success' | 'fail',
  blockNumber: number
) {
  return createMockRpcHandler({
    eth_getTransactionReceipt: (params) => {
      const hash = (params as string[])[0]
      if (hash && hash.toLowerCase() === txHash.toLowerCase()) {
        return {
          transactionHash: txHash,
          blockNumber: `0x${blockNumber.toString(16)}`,
          status: status === 'success' ? '0x1' : '0x0',
          gasUsed: '0x5208', // 21000
          cumulativeGasUsed: '0x5208',
          logs: [],
        }
      }
      return null
    },
  })
}

/**
 * Spies on fetch and mocks RPC calls
 * Returns a cleanup function
 */
export function setupRpcMocks(handlers: RpcHandlerMap) {
  const mockFetch = createMockRpcHandler(handlers)
  const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(mockFetch)

  return () => {
    spy.mockRestore()
  }
}

/**
 * Standard mock handlers for common test scenarios
 */
export const STANDARD_RPC_MOCKS: RpcHandlerMap = {
  eth_chainId: () => '0x1', // Mainnet
  eth_blockNumber: () => '0x10d4f00', // Some recent block
  eth_getBalance: () => '0xde0b6b3a7640000', // 1 ETH
  eth_gasPrice: () => '0x3b9aca00', // 1 gwei
  eth_estimateGas: () => '0x5208', // 21000
  net_version: () => '1',
  web3_clientVersion: () => 'MockClient/1.0.0',
}

/**
 * Creates a comprehensive mock for testing payment verification
 *
 * @param params - Configuration for the mock scenario
 */
export function mockPaymentVerification(params: {
  recipientAddress: string
  expectedAmount: string
  tokenAddress?: string
  confirmed: boolean
  blockNumber: number
}) {
  const handlers: RpcHandlerMap = {
    ...STANDARD_RPC_MOCKS,
    eth_blockNumber: () => `0x${params.blockNumber.toString(16)}`,
  }

  if (params.tokenAddress) {
    // ERC20 token transfer - mock balanceOf call
    handlers.eth_call = (rpcParams) => {
      const [{ to, data }] = rpcParams as [{ to: string; data: string }]
      // balanceOf selector: 0x70a08231
      if (
        to.toLowerCase() === params.tokenAddress?.toLowerCase() &&
        data.startsWith('0x70a08231')
      ) {
        return `0x${BigInt(params.expectedAmount).toString(16).padStart(64, '0')}`
      }
      return '0x0'
    }
  } else {
    // Native ETH transfer - mock getBalance
    handlers.eth_getBalance = (rpcParams) => {
      const address = (rpcParams as string[])[0]
      if (address && address.toLowerCase() === params.recipientAddress.toLowerCase()) {
        return `0x${BigInt(params.expectedAmount).toString(16)}`
      }
      return '0x0'
    }
  }

  return createMockRpcHandler(handlers)
}
