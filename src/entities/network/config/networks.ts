/**
 * Network Configuration
 *
 * Defines supported blockchain networks for VoidPay.
 * This is configuration data, placed in config/ segment per FSD conventions.
 */

import {
  mainnet,
  arbitrum,
  optimism,
  polygon,
  base,
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  baseSepolia,
} from 'wagmi/chains'

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
  [base.id]: {
    name: 'Base',
    chain: base,
    currency: 'ETH',
  },
  // Testnets
  [sepolia.id]: {
    name: 'Sepolia',
    chain: sepolia,
    currency: 'ETH',
  },
  [arbitrumSepolia.id]: {
    name: 'Arbitrum Sepolia',
    chain: arbitrumSepolia,
    currency: 'ETH',
  },
  [optimismSepolia.id]: {
    name: 'Optimism Sepolia',
    chain: optimismSepolia,
    currency: 'ETH',
  },
  [polygonAmoy.id]: {
    name: 'Polygon Amoy',
    chain: polygonAmoy,
    currency: 'POL',
  },
  [baseSepolia.id]: {
    name: 'Base Sepolia',
    chain: baseSepolia,
    currency: 'ETH',
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
  [base.id]: 'base',
  [sepolia.id]: 'sep',
  [arbitrumSepolia.id]: 'arb-sep',
  [optimismSepolia.id]: 'op-sep',
  [polygonAmoy.id]: 'amoy',
  [baseSepolia.id]: 'base-sep',
}

export const NETWORK_CODES_REVERSE: Record<string, NetworkId> = {
  eth: mainnet.id,
  arb: arbitrum.id,
  op: optimism.id,
  poly: polygon.id,
  base: base.id,
  sep: sepolia.id,
  'arb-sep': arbitrumSepolia.id,
  'op-sep': optimismSepolia.id,
  amoy: polygonAmoy.id,
  'base-sep': baseSepolia.id,
}
