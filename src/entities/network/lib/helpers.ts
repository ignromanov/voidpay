/**
 * Network Helper Functions
 *
 * Utility functions for working with blockchain networks.
 */

import { BLOCK_EXPLORERS } from '../config/ui-config'
import { NETWORKS, type NetworkId } from '../config/networks'

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
 * Uses NETWORKS map for O(1) lookup across all 8 networks (mainnet + testnet)
 *
 * @param networkId - Chain ID of the network
 * @returns Network name (e.g., 'Ethereum', 'Arbitrum') or chain ID as string if unknown
 */
export function getNetworkName(networkId: number): string {
  const network = NETWORKS[networkId as NetworkId]
  return network?.name ?? networkId.toString()
}
