/**
 * RPC Proxy Configuration
 * Feature: 004-rpc-proxy-failover
 *
 * Builds chain-specific provider URLs using prefix maps.
 * Chain validation uses getChainById() from entities/network (single source of truth).
 * Provider subdomain prefixes are provider-specific config that lives here.
 */

import { getChainById } from '@/entities/network'
import type { RpcConfig, RpcProviderConfig } from '../model/types'

/** Alchemy subdomain prefixes per chain ID */
const ALCHEMY_PREFIXES: Record<number, string> = {
  1: 'eth-mainnet',
  42161: 'arb-mainnet',
  10: 'opt-mainnet',
  137: 'polygon-mainnet',
  11155111: 'eth-sepolia',
  421614: 'arb-sepolia',
  11155420: 'opt-sepolia',
  80002: 'polygon-amoy',
}

/** Infura subdomain prefixes per chain ID */
const INFURA_PREFIXES: Record<number, string> = {
  1: 'mainnet',
  42161: 'arbitrum-mainnet',
  10: 'optimism-mainnet',
  137: 'polygon-mainnet',
  11155111: 'sepolia',
  421614: 'arbitrum-sepolia',
  11155420: 'optimism-sepolia',
  80002: 'polygon-amoy',
}

/**
 * Load and validate RPC configuration from environment variables
 *
 * @param chainId - Target chain ID (default: 1 = Ethereum mainnet)
 * @throws Error if chain is unsupported, provider prefix is missing, or API keys missing in production
 */
export function loadRpcConfig(chainId: number = 1): RpcConfig {
  const chain = getChainById(chainId)
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }

  const alchemyPrefix = ALCHEMY_PREFIXES[chainId]
  const infuraPrefix = INFURA_PREFIXES[chainId]
  if (!alchemyPrefix || !infuraPrefix) {
    throw new Error(`No provider configuration for chain ID: ${chainId} (${chain.name})`)
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  const alchemyApiKey = process.env.ALCHEMY_API_KEY
  const infuraApiKey = process.env.INFURA_API_KEY

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
    url: alchemyApiKey ? `https://${alchemyPrefix}.g.alchemy.com/v2/${alchemyApiKey}` : '',
    apiKey: alchemyApiKey || '',
  }

  const fallback: RpcProviderConfig = {
    name: 'Infura',
    url: infuraApiKey ? `https://${infuraPrefix}.infura.io/v3/${infuraApiKey}` : '',
    apiKey: infuraApiKey || '',
  }

  return {
    providers: { primary, fallback },
    rateLimit: { requestsPerMinute: 100, windowSeconds: 60 },
    mock: { enabled: isDevelopment },
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
