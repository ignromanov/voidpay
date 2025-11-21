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
