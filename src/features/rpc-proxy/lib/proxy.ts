/**
 * RPC Proxy Logic with Failover
 * Feature: 004-rpc-proxy-failover
 */

import type { JsonRpcRequest, JsonRpcResponse, ProxyResult, RpcMethod } from '../model/types';
import { loadRpcConfig, validateServerSideOnly } from './config';

// Allowlist of permitted RPC methods (security requirement FR-019)
const ALLOWED_METHODS = new Set<RpcMethod>([
  'eth_blockNumber',
  'eth_call',
  'eth_getBalance',
  'eth_getGasPrice',
  'eth_estimateGas',
  'eth_sendRawTransaction',
  'eth_getTransactionReceipt',
  'eth_chainId',
  'net_version',
] as const);

/**
 * Proxy an RPC request with automatic failover
 * @param request JSON-RPC request
 * @returns Proxy result with response and metadata
 */
export async function proxyRequest(request: JsonRpcRequest): Promise<ProxyResult> {
  validateServerSideOnly();
  
  // Validate method is allowlisted
  if (!ALLOWED_METHODS.has(request.method as RpcMethod)) {
    const requestId = generateRequestId();
    return {
      response: {
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `Method not allowed: ${request.method}`,
        },
        id: request.id,
      },
      provider: 'primary',
      requestId,
    };
  }
  
  const config = loadRpcConfig();
  const requestId = generateRequestId();
  
  // Try primary provider (Alchemy)
  try {
    const response = await fetchProvider(
      config.providers.primary.url,
      request,
      2000 // 2 second timeout for failover
    );
    
    return {
      response,
      provider: 'primary',
      requestId,
    };
  } catch {
    // Primary failed - try fallback (Infura)
    try {
      const response = await fetchProvider(
        config.providers.fallback.url,
        request,
        5000 // 5 second timeout for fallback
      );
      
      return {
        response,
        provider: 'fallback',
        requestId,
      };
    } catch {
      // Both providers failed
      return {
        response: {
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'All RPC providers unavailable. Please try again later.',
          },
          id: request.id,
        },
        provider: 'fallback',
        requestId,
      };
    }
  }
}

/**
 * Fetch from a specific RPC provider with timeout
 */
async function fetchProvider(
  url: string,
  request: JsonRpcRequest,
  timeoutMs: number
): Promise<JsonRpcResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json() as JsonRpcResponse;
    
    // Check for JSON-RPC error response
    if (data.error) {
      // Classify error - if it's a retryable error, throw to trigger failover
      if (isRetryableError(data.error.code)) {
        throw new Error(`RPC Error ${data.error.code}: ${data.error.message}`);
      }
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Determine if an error code is retryable (should trigger failover)
 */
function isRetryableError(code: number): boolean {
  // Retryable errors: rate limits, server errors, timeouts
  const retryableCodes = [
    -32603, // Internal error
    -32000, // Server error
    429,    // Rate limit (some providers use this)
  ];
  
  return retryableCodes.includes(code);
}

/**
 * Generate anonymous request ID for operational metrics
 * No user linkage - just for monitoring request flow
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
