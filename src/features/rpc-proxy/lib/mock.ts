/**
 * Mock RPC Provider for Development
 * Feature: 004-rpc-proxy-failover
 */

import type { JsonRpcRequest, JsonRpcResponse, MockTransaction, MockMode } from '../model/types'

// In-memory transaction state for mock provider
const mockTransactions = new Map<string, MockTransaction>()

/**
 * Handle mock RPC requests with simulation modes
 * @param request JSON-RPC request
 * @param mode Simulation mode (success, error, slow)
 * @returns Mock JSON-RPC response
 */
export async function handleMockRequest(
  request: JsonRpcRequest,
  mode: MockMode = 'success'
): Promise<JsonRpcResponse> {
  // Simulate network delay based on mode
  const delay = getDelayForMode(mode)
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Simulate error mode
  if (mode === 'error') {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Mock error: Simulated RPC failure',
      },
      id: request.id,
    }
  }

  // Handle different RPC methods
  switch (request.method) {
    case 'eth_blockNumber':
      return mockBlockNumber(request)

    case 'eth_call':
      return mockCall(request)

    case 'eth_getBalance':
      return mockGetBalance(request)

    case 'eth_getGasPrice':
      return mockGetGasPrice(request)

    case 'eth_estimateGas':
      return mockEstimateGas(request)

    case 'eth_sendRawTransaction':
      return mockSendRawTransaction(request)

    case 'eth_getTransactionReceipt':
      return mockGetTransactionReceipt(request)

    case 'eth_chainId':
      return mockChainId(request)

    case 'net_version':
      return mockNetVersion(request)

    default:
      return {
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `Method not found: ${request.method}`,
        },
        id: request.id,
      }
  }
}

/**
 * Get delay in milliseconds based on simulation mode
 */
function getDelayForMode(mode: MockMode): number {
  switch (mode) {
    case 'success':
      return Math.random() * 2000 + 1000 // 1-3 seconds
    case 'slow':
      return Math.random() * 20000 + 10000 // 10-30 seconds
    case 'error':
      return Math.random() * 1000 + 500 // 0.5-1.5 seconds
    default:
      return 1000
  }
}

/**
 * Mock eth_blockNumber
 */
function mockBlockNumber(request: JsonRpcRequest): JsonRpcResponse {
  const blockNumber = Math.floor(Date.now() / 1000) // Use timestamp as block number
  return {
    jsonrpc: '2.0',
    result: `0x${blockNumber.toString(16)}`,
    id: request.id,
  }
}

/**
 * Mock eth_call
 */
function mockCall(request: JsonRpcRequest): JsonRpcResponse {
  // Return mock data (e.g., for ERC20 balance)
  return {
    jsonrpc: '2.0',
    result: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000', // 1 ETH in wei
    id: request.id,
  }
}

/**
 * Mock eth_getBalance
 */
function mockGetBalance(request: JsonRpcRequest): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    result: '0x1bc16d674ec80000', // 2 ETH in wei
    id: request.id,
  }
}

/**
 * Mock eth_getGasPrice
 */
function mockGetGasPrice(request: JsonRpcRequest): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    result: '0x3b9aca00', // 1 gwei
    id: request.id,
  }
}

/**
 * Mock eth_estimateGas
 */
function mockEstimateGas(request: JsonRpcRequest): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    result: '0x5208', // 21000 gas (standard transfer)
    id: request.id,
  }
}

/**
 * Mock eth_sendRawTransaction
 */
function mockSendRawTransaction(request: JsonRpcRequest): JsonRpcResponse {
  const txHash = generateFakeTxHash()

  // Store transaction state
  mockTransactions.set(txHash, {
    hash: txHash,
    status: 'pending',
    from: '0x0000000000000000000000000000000000000000',
    to: '0x0000000000000000000000000000000000000001',
    value: '0x0',
    timestamp: Date.now(),
  })

  // Simulate transaction confirmation after 3 seconds
  setTimeout(() => {
    const tx = mockTransactions.get(txHash)
    if (tx) {
      tx.status = 'success'
      mockTransactions.set(txHash, tx)
    }
  }, 3000)

  return {
    jsonrpc: '2.0',
    result: txHash,
    id: request.id,
  }
}

/**
 * Mock eth_getTransactionReceipt
 */
function mockGetTransactionReceipt(request: JsonRpcRequest): JsonRpcResponse {
  const txHash = request.params[0] as string
  const tx = mockTransactions.get(txHash)

  if (!tx) {
    return {
      jsonrpc: '2.0',
      result: null, // Transaction not found
      id: request.id,
    }
  }

  if (tx.status === 'pending') {
    return {
      jsonrpc: '2.0',
      result: null, // Still pending
      id: request.id,
    }
  }

  return {
    jsonrpc: '2.0',
    result: {
      transactionHash: tx.hash,
      transactionIndex: '0x1',
      blockNumber: '0x' + Math.floor(Date.now() / 1000).toString(16),
      blockHash: generateFakeTxHash(),
      from: tx.from,
      to: tx.to,
      cumulativeGasUsed: '0x5208',
      gasUsed: '0x5208',
      contractAddress: null,
      logs: [],
      logsBloom:
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      status: tx.status === 'success' ? '0x1' : '0x0',
      effectiveGasPrice: '0x3b9aca00',
    },
    id: request.id,
  }
}

/**
 * Mock eth_chainId
 */
function mockChainId(request: JsonRpcRequest): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    result: '0x1', // Ethereum Mainnet
    id: request.id,
  }
}

/**
 * Mock net_version
 */
function mockNetVersion(request: JsonRpcRequest): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    result: '1', // Ethereum Mainnet
    id: request.id,
  }
}

/**
 * Generate a fake transaction hash
 */
function generateFakeTxHash(): string {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return (
    '0x' +
    Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  )
}

/**
 * Check if mock mode should be enabled
 */
export function shouldUseMock(url: URL): boolean {
  // Enable mock if:
  // 1. Running on localhost
  // 2. debug=1 query param is present
  // 3. NODE_ENV is development

  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  const hasDebugParam =
    url.searchParams.get('debug') === '1' || url.searchParams.get('debug') === 'true'
  const isDevelopment = process.env.NODE_ENV === 'development'

  return isLocalhost || hasDebugParam || isDevelopment
}

/**
 * Get mock mode from query parameters
 */
export function getMockMode(url: URL): MockMode {
  const mode = url.searchParams.get('mock')

  if (mode === 'error' || mode === 'slow' || mode === 'success') {
    return mode
  }

  return 'success'
}
