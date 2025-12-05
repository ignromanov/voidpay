/**
 * RPC Proxy API Contract
 * Endpoint: POST /api/rpc
 */

export type RpcMethod =
  | 'eth_blockNumber'
  | 'eth_call'
  | 'eth_getBalance'
  | 'eth_getGasPrice'
  | 'eth_estimateGas'
  | 'eth_sendRawTransaction'
  | 'eth_getTransactionReceipt'
  | 'eth_chainId'
  | 'net_version'

export interface RpcApiRequest {
  jsonrpc: '2.0'
  method: RpcMethod
  params: any[]
  id: number | string
}

export interface RpcApiResponse {
  jsonrpc: '2.0'
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
  id: number | string
}

export interface RpcApiError {
  error: string
  code: 'RATE_LIMIT_EXCEEDED' | 'METHOD_NOT_ALLOWED' | 'PROVIDER_ERROR' | 'INTERNAL_ERROR'
}

/**
 * Query Parameters for Mock Mode
 */
export interface RpcMockQueryParams {
  mock?: 'success' | 'error' | 'slow'
  debug?: '1' | 'true'
}
