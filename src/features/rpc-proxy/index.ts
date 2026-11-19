// Public API for features/rpc-proxy

// Types
export type {
  JsonRpcRequest,
  JsonRpcResponse,
  RpcConfig,
  RpcProviderConfig,
  ProxyResult,
} from './model/types'

// Core proxy functionality
export { proxyRequest } from './lib/proxy'
export { loadRpcConfig, validateServerSideOnly } from './lib/config'

// Mock mode (for development/testing)
export { getMockMode, handleMockRequest, shouldUseMock } from './lib/mock'
