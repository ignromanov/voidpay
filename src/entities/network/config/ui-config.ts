/**
 * Network UI Configuration
 *
 * Visual metadata for network selectors and UI components.
 * Separated from chain configuration to allow UI customization
 * without affecting blockchain connectivity.
 */

import { mainnet, arbitrum, optimism, polygon } from 'viem/chains'
import { Hexagon, Triangle, Zap } from 'lucide-react'

/**
 * Network name type for UI theming
 * Used for network-specific visual styling across the app
 */
export type NetworkName = 'ethereum' | 'arbitrum' | 'optimism' | 'polygon'

/**
 * Map chain ID to network theme name
 * Used for visual theming (colors, backgrounds, etc.)
 */
export function getNetworkTheme(chainId: number): NetworkName {
  switch (chainId) {
    case arbitrum.id:
      return 'arbitrum'
    case optimism.id:
      return 'optimism'
    case polygon.id:
      return 'polygon'
    default:
      return 'ethereum'
  }
}

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
    chainId: mainnet.id,
    name: 'Ethereum',
    icon: Hexagon,
    iconFilled: false,
    colorClass: 'text-indigo-400',
  },
  {
    chainId: arbitrum.id,
    name: 'Arbitrum',
    icon: Triangle,
    iconFilled: true,
    colorClass: 'text-blue-400',
  },
  {
    chainId: optimism.id,
    name: 'Optimism',
    icon: Zap,
    iconFilled: true,
    colorClass: 'text-red-400',
  },
  {
    chainId: polygon.id,
    name: 'Polygon',
    icon: Hexagon,
    iconFilled: true,
    colorClass: 'text-purple-400',
  },
]

/**
 * Network badge configuration with brand colors
 */
export const NETWORK_BADGES: Record<
  number,
  {
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
    /** Tailwind classes for network-specific coloring */
    colorClass: string
  }
> = {
  [mainnet.id]: {
    variant: 'secondary',
    colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  [arbitrum.id]: { variant: 'default', colorClass: 'bg-blue-100 text-blue-700 border-blue-200' },
  [optimism.id]: { variant: 'destructive', colorClass: 'bg-red-100 text-red-700 border-red-200' },
  [polygon.id]: {
    variant: 'outline',
    colorClass: 'bg-purple-100 text-purple-700 border-purple-200',
  },
}

/**
 * Block explorers for each chain
 */
export const BLOCK_EXPLORERS: Record<number, { name: string; url: string }> = {
  [mainnet.id]: { name: 'Etherscan', url: 'https://etherscan.io' },
  [arbitrum.id]: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  [optimism.id]: { name: 'Optimism Etherscan', url: 'https://optimistic.etherscan.io' },
  [polygon.id]: { name: 'Polygonscan', url: 'https://polygonscan.com' },
}

/**
 * Network-specific shadows for the invoice paper
 */
export const NETWORK_SHADOWS: Record<number, string> = {
  [mainnet.id]: 'shadow-indigo-500/20',
  [arbitrum.id]: 'shadow-blue-500/20',
  [optimism.id]: 'shadow-red-500/20',
  [polygon.id]: 'shadow-purple-500/20',
}

/**
 * Network-specific glow gradients for invoice background effect
 * Uses Tailwind gradient classes (from-X to-Y)
 * @deprecated Use NETWORK_GLOW_SHADOWS instead (box-shadow doesn't affect layout)
 */
export const NETWORK_GLOWS: Record<number, { from: string; to: string }> = {
  [mainnet.id]: { from: 'from-indigo-600/40', to: 'to-blue-600/40' },
  [arbitrum.id]: { from: 'from-cyan-600/40', to: 'to-blue-600/40' },
  [optimism.id]: { from: 'from-red-600/40', to: 'to-orange-600/40' },
  [polygon.id]: { from: 'from-purple-600/40', to: 'to-violet-600/40' },
}

/**
 * Network-specific glow using CSS pseudo-element (::before)
 * Pseudo-element doesn't affect layout calculations
 * Uses elliptical shape with large blur for soft ambient effect
 *
 * Base classes (applied in InvoicePaper):
 * - before:absolute before:-inset-[40%] before:z-[-1] before:rounded-full
 * - before:blur-[120px] before:opacity-50 before:bg-gradient-to-br
 * - print:before:hidden
 *
 * This config provides network-specific gradient colors
 */
export const NETWORK_GLOW_SHADOWS: Record<number, string> = {
  // Indigo → Blue elliptical glow
  [mainnet.id]: 'before:from-indigo-500/60 before:to-blue-500/40',
  // Cyan → Blue elliptical glow
  [arbitrum.id]: 'before:from-cyan-500/60 before:to-blue-500/40',
  // Red → Orange elliptical glow
  [optimism.id]: 'before:from-red-500/60 before:to-orange-500/40',
  // Purple → Violet elliptical glow
  [polygon.id]: 'before:from-purple-500/60 before:to-violet-500/40',
}
