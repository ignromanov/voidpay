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
