/**
 * Network Theme Configuration
 *
 * Defines visual themes for each supported network.
 * Derives from canonical NETWORK_PALETTE + withTestnets (zero manual testnet entries).
 */

import { NETWORK_PALETTE, DEFAULT_PALETTE, type NetworkPalette } from '@/shared/ui/constants/network-palette'
import { withTestnets } from '@/entities/network'
import {
  mainnet, arbitrum, optimism, polygon, base,
} from 'viem/chains'

/**
 * Network theme = palette colors + display name, keyed by chain ID.
 */
export interface NetworkTheme extends NetworkPalette {
  name: string
}

/**
 * Build NETWORK_THEMES from canonical palette.
 * Testnet entries are derived automatically via withTestnets().
 */
const MAINNET_THEMES: Record<number, NetworkTheme> = {
  [mainnet.id]: { name: 'Ethereum', ...NETWORK_PALETTE.ethereum },
  [arbitrum.id]: { name: 'Arbitrum', ...NETWORK_PALETTE.arbitrum },
  [optimism.id]: { name: 'Optimism', ...NETWORK_PALETTE.optimism },
  [polygon.id]: { name: 'Polygon', ...NETWORK_PALETTE.polygon },
  [base.id]: { name: 'Base', ...NETWORK_PALETTE.base },
}

/**
 * Network themes mapped by chain ID (mainnet + testnet).
 * Testnet entries inherit their mainnet parent's colors.
 */
export const NETWORK_THEMES: Record<number, NetworkTheme> = withTestnets(MAINNET_THEMES)

/**
 * Default theme for unknown networks
 */
export const DEFAULT_NETWORK_THEME: NetworkTheme = {
  name: 'Unknown',
  ...DEFAULT_PALETTE,
}

/**
 * Get network theme by chain ID.
 * Returns the theme object with name + colors, or undefined if not found.
 */
export function getNetworkTheme(chainId: number): NetworkTheme | undefined {
  return NETWORK_THEMES[chainId]
}

/**
 * Get a specific color from a network theme.
 */
export function getNetworkThemeColor(chainId: number, colorKey: keyof NetworkPalette): string {
  const theme = NETWORK_THEMES[chainId] ?? DEFAULT_NETWORK_THEME
  return theme[colorKey]
}
