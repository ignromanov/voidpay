/**
 * Chain Configurations for VoidPay
 *
 * Defines all supported mainnet and testnet chains with their metadata.
 * Testnets are conditionally included based on NEXT_PUBLIC_ENABLE_TESTNETS.
 *
 * @see Constitutional Principle VII - Web3 Safety
 */

import {
  mainnet,
  arbitrum,
  optimism,
  polygon,
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
} from 'viem/chains'
import type { Chain } from 'viem'

/**
 * Supported mainnet chains (always available)
 *
 * - Ethereum (1)
 * - Arbitrum One (42161)
 * - Optimism (10)
 * - Polygon PoS (137)
 */
export const MAINNET_CHAINS: [Chain, ...Chain[]] = [mainnet, arbitrum, optimism, polygon]

/**
 * Supported testnet chains (available when NEXT_PUBLIC_ENABLE_TESTNETS=true)
 *
 * - Sepolia (11155111)
 * - Arbitrum Sepolia (421614)
 * - Optimism Sepolia (11155420)
 * - Polygon Amoy (80002)
 */
export const TESTNET_CHAINS: Chain[] = [sepolia, arbitrumSepolia, optimismSepolia, polygonAmoy]

/**
 * Chain IDs organized by network type
 */
export const SUPPORTED_CHAIN_IDS = {
  mainnet: [1, 42161, 10, 137] as const,
  testnet: [11155111, 421614, 11155420, 80002] as const,
} as const

/**
 * All supported chain IDs (mainnet + testnet)
 */
export const ALL_CHAIN_IDS = [
  ...SUPPORTED_CHAIN_IDS.mainnet,
  ...SUPPORTED_CHAIN_IDS.testnet,
] as const

/**
 * Get a chain by its ID
 *
 * @param chainId - The chain ID to look up
 * @returns The chain configuration or undefined if not found
 */
export function getChainById(chainId: number): Chain | undefined {
  const allChains = [...MAINNET_CHAINS, ...TESTNET_CHAINS]
  return allChains.find((chain) => chain.id === chainId)
}

/**
 * Get supported chains based on environment configuration
 *
 * Returns mainnet chains only by default.
 * Includes testnet chains when NEXT_PUBLIC_ENABLE_TESTNETS=true.
 *
 * @returns Array of supported chains
 */
export function getSupportedChains(): [Chain, ...Chain[]] {
  const enableTestnets = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'

  if (enableTestnets) {
    return [...MAINNET_CHAINS, ...TESTNET_CHAINS] as [Chain, ...Chain[]]
  }

  return MAINNET_CHAINS
}

/**
 * Check if a chain ID is a testnet
 *
 * @param chainId - The chain ID to check
 * @returns True if the chain is a testnet
 */
export function isTestnetChain(chainId: number): boolean {
  return (SUPPORTED_CHAIN_IDS.testnet as readonly number[]).includes(chainId)
}

/**
 * Get the chain name for display
 *
 * @param chainId - The chain ID
 * @returns The chain name or 'Unknown' if not found
 */
export function getChainName(chainId: number): string {
  const chain = getChainById(chainId)
  return chain?.name ?? 'Unknown'
}

/**
 * Get the block explorer URL for a chain
 *
 * @param chainId - The chain ID
 * @returns The block explorer URL or undefined
 */
export function getBlockExplorerUrl(chainId: number): string | undefined {
  const chain = getChainById(chainId)
  return chain?.blockExplorers?.default.url
}
