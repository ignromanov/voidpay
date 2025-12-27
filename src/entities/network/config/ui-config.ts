/**
 * Network UI Configuration
 *
 * Visual metadata for network selectors and UI components.
 * Separated from chain configuration to allow UI customization
 * without affecting blockchain connectivity.
 */

import { Hexagon, Triangle, Zap } from 'lucide-react'

/**
 * Network configuration for UI rendering
 */
export interface NetworkConfig {
  chainId: number
  name: string
  icon: React.ComponentType<{ className?: string }>
  iconFilled: boolean
  colorClass: string
}

/**
 * Network configuration for network selector
 *
 * Icons from lucide-react, colors match network branding
 */
export const NETWORK_CONFIG: NetworkConfig[] = [
  {
    chainId: 1,
    name: 'Ethereum',
    icon: Hexagon,
    iconFilled: false,
    colorClass: 'text-indigo-400',
  },
  {
    chainId: 42161,
    name: 'Arbitrum',
    icon: Triangle,
    iconFilled: true,
    colorClass: 'text-blue-400',
  },
  {
    chainId: 10,
    name: 'Optimism',
    icon: Zap,
    iconFilled: true,
    colorClass: 'text-red-400',
  },
  {
    chainId: 137,
    name: 'Polygon',
    icon: Hexagon,
    iconFilled: true,
    colorClass: 'text-purple-400',
  },
]

/**
 * Network badge variants for each chain
 */
export const NETWORK_BADGES: Record<
  number,
  { variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  1: { variant: 'secondary' },
  42161: { variant: 'default' },
  10: { variant: 'destructive' },
  137: { variant: 'outline' },
}

/**
 * Block explorers for each chain
 */
export const BLOCK_EXPLORERS: Record<number, { name: string; url: string }> = {
  1: { name: 'Etherscan', url: 'https://etherscan.io' },
  42161: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  10: { name: 'Optimism Etherscan', url: 'https://optimistic.etherscan.io' },
  137: { name: 'Polygonscan', url: 'https://polygonscan.com' },
}

/**
 * Network-specific shadows for the invoice paper
 */
export const NETWORK_SHADOWS: Record<number, string> = {
  1: 'shadow-indigo-500/20',
  42161: 'shadow-blue-500/20',
  10: 'shadow-red-500/20',
  137: 'shadow-purple-500/20',
}
