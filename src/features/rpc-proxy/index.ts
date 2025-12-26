// Public API for features/rpc-proxy

// Types
export type {
  JsonRpcRequest,
  JsonRpcResponse,
  RpcConfig,
  RpcProviderConfig,
  ProxyResult,
  RateLimitResult,
} from './model/types'

// Core proxy functionality
export { proxyRequest } from './lib/proxy'
export { loadRpcConfig, validateServerSideOnly } from './lib/config'
export { checkRateLimit, extractIpAddress } from './lib/rate-limit'

// Mock mode (for development/testing)
export { getMockMode, handleMockRequest, shouldUseMock } from './lib/mock'
