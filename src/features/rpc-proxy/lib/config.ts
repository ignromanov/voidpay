/**
 * RPC Proxy Configuration
 * Feature: 004-rpc-proxy-failover
 */

import type { RpcConfig, RpcProviderConfig } from '../model/types'

/**
 * Load and validate RPC configuration from environment variables
 * @throws Error if required environment variables are missing in production mode
 */
export function loadRpcConfig(): RpcConfig {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Primary provider (Alchemy)
  const alchemyApiKey = process.env.ALCHEMY_API_KEY
  const alchemyRpcUrl = process.env.ALCHEMY_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/'

  // Fallback provider (Infura)
  const infuraApiKey = process.env.INFURA_API_KEY
  const infuraRpcUrl = process.env.INFURA_RPC_URL || 'https://mainnet.infura.io/v3/'

  // Validate required keys in production
  if (!isDevelopment) {
    if (!alchemyApiKey) {
      throw new Error('ALCHEMY_API_KEY is required in production')
    }
    if (!infuraApiKey) {
      throw new Error('INFURA_API_KEY is required in production')
    }
  }

  const primary: RpcProviderConfig = {
    name: 'Alchemy',
    url: alchemyApiKey ? `${alchemyRpcUrl}${alchemyApiKey}` : '',
    apiKey: alchemyApiKey || '',
  }

  const fallback: RpcProviderConfig = {
    name: 'Infura',
    url: infuraApiKey ? `${infuraRpcUrl}${infuraApiKey}` : '',
    apiKey: infuraApiKey || '',
  }

  return {
    providers: {
      primary,
      fallback,
    },
    rateLimit: {
      requestsPerMinute: 100,
      windowSeconds: 60,
    },
    mock: {
      enabled: isDevelopment,
    },
  }
}

/**
 * Validate that API keys are not exposed in client bundle
 * This should be called only in server-side code
 */
export function validateServerSideOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error('RPC configuration must only be accessed server-side')
  }
}
