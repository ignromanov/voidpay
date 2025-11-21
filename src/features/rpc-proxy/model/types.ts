/**
 * RPC Proxy Types
 * Feature: 004-rpc-proxy-failover
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
  | 'net_version';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: unknown[];
  id: number | string | null;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id: number | string | null;
}

export interface RpcProviderConfig {
  name: 'Alchemy' | 'Infura';
  url: string;
  apiKey: string;
}

export interface RpcConfig {
  providers: {
    primary: RpcProviderConfig;
    fallback: RpcProviderConfig;
  };
  rateLimit: {
    requestsPerMinute: number;
    windowSeconds: number;
  };
  mock: {
    enabled: boolean;
  };
}

export interface MockTransaction {
  hash: string;
  status: 'pending' | 'success' | 'reverted';
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

export type MockMode = 'success' | 'error' | 'slow';

export interface ProxyResult {
  response: JsonRpcResponse;
  provider: 'primary' | 'fallback' | 'mock';
  requestId: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}
