/**
 * Testnet Utilities
 *
 * Maps testnet chain IDs to their mainnet parents.
 * Provides withTestnets() to derive testnet config from mainnet-only records.
 */

import {
  mainnet, arbitrum, optimism, polygon, base,
  sepolia, arbitrumSepolia, optimismSepolia, polygonAmoy, baseSepolia,
} from 'viem/chains'

/**
 * Testnet → mainnet parent mapping (single source of truth).
 * When adding a new testnet, add it here — withTestnets() propagates automatically.
 */
export const TESTNET_PARENT: Record<number, number> = {
  [sepolia.id]: mainnet.id,
  [arbitrumSepolia.id]: arbitrum.id,
  [optimismSepolia.id]: optimism.id,
  [polygonAmoy.id]: polygon.id,
  [baseSepolia.id]: base.id,
}

/**
 * Resolve a chain ID to its mainnet parent.
 * Returns the chain ID unchanged if it's already mainnet or unknown.
 */
export function resolveMainnetId(chainId: number): number {
  return TESTNET_PARENT[chainId] ?? chainId
}

/**
 * Derive testnet entries from a mainnet-only Record using TESTNET_PARENT.
 * Testnet entries inherit the value of their mainnet parent.
 *
 * @example
 * const SHADOWS = withTestnets({
 *   [mainnet.id]: 'shadow-indigo-500/20',
 *   [base.id]: 'shadow-blue-500/20',
 * })
 * // Result includes sepolia → 'shadow-indigo-500/20', baseSepolia → 'shadow-blue-500/20', etc.
 */
export function withTestnets<T>(mainnetMap: Record<number, T>): Record<number, T> {
  const result = { ...mainnetMap }
  for (const [testnetId, mainnetId] of Object.entries(TESTNET_PARENT)) {
    const value = mainnetMap[mainnetId]
    if (value !== undefined) {
      result[Number(testnetId)] = value
    }
  }
  return result
}
