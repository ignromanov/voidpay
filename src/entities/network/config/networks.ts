/**
 * Network Configuration
 *
 * Defines supported blockchain networks for VoidPay.
 * This is configuration data, placed in config/ segment per FSD conventions.
 */

import { mainnet, arbitrum, optimism, polygon } from 'wagmi/chains'

export const NETWORKS = {
  [mainnet.id]: {
    name: 'Ethereum',
    chain: mainnet,
    currency: 'ETH',
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    chain: arbitrum,
    currency: 'ETH',
  },
  [optimism.id]: {
    name: 'Optimism',
    chain: optimism,
    currency: 'ETH',
  },
  [polygon.id]: {
    name: 'Polygon',
    chain: polygon,
    currency: 'MATIC',
  },
} as const

export type NetworkId = keyof typeof NETWORKS

/**
 * Short network codes for compact URLs (OG previews, etc.)
 */
export const NETWORK_CODES: Record<NetworkId, string> = {
  [mainnet.id]: 'eth',
  [arbitrum.id]: 'arb',
  [optimism.id]: 'op',
  [polygon.id]: 'poly',
}

export const NETWORK_CODES_REVERSE: Record<string, NetworkId> = {
  eth: mainnet.id,
  arb: arbitrum.id,
  op: optimism.id,
  poly: polygon.id,
}
