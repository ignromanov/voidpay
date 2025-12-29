/**
 * Network Helper Functions
 *
 * Utility functions for working with blockchain networks.
 */

import { BLOCK_EXPLORERS, NETWORK_CONFIG } from '../config/ui-config'

/**
 * Get the block explorer URL for a transaction hash on a specific network
 *
 * @param networkId - Chain ID of the network
 * @param hash - Transaction hash
 * @returns Full URL to the transaction on the block explorer, or '#' if network is unknown
 */
export function getExplorerUrl(networkId: number, hash: string): string {
  const config = BLOCK_EXPLORERS[networkId]
  if (!config) return '#'
  return `${config.url}/tx/${hash}`
}

/**
 * Get the human-readable network name by chain ID
 *
 * @param networkId - Chain ID of the network
 * @returns Network name (e.g., 'Ethereum', 'Arbitrum') or chain ID as string if unknown
 */
export function getNetworkName(networkId: number): string {
  return NETWORK_CONFIG.find((n) => n.chainId === networkId)?.name ?? networkId.toString()
}
