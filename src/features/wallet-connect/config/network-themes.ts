/**
 * Network Theme Configuration
 *
 * Defines visual themes for each supported network.
 * Used for ambient theming to indicate which network is connected.
 */

/**
 * Network theme definition
 */
export interface NetworkTheme {
  /** Network name for display */
  name: string
  /** Primary brand color */
  primary: string
  /** Secondary/background color */
  secondary: string
  /** Accent color for highlights */
  accent: string
  /** Glow/ambient effect color */
  glow: string
}

/**
 * Network themes mapped by chain ID
 *
 * Following VoidPay design guidelines:
 * - Ethereum: Electric Violet (VoidPay brand)
 * - Arbitrum: Blue/Cyan
 * - Optimism: Red/Orange
 * - Polygon: Purple
 */
export const NETWORK_THEMES: Record<number, NetworkTheme> = {
  // Ethereum Mainnet - Electric Violet (VoidPay brand color)
  1: {
    name: 'Ethereum',
    primary: '#7C3AED',
    secondary: '#4C1D95',
    accent: '#8B5CF6',
    glow: 'rgba(124, 58, 237, 0.2)',
  },
  // Arbitrum One - Blue
  42161: {
    name: 'Arbitrum',
    primary: '#12AAFF',
    secondary: '#1B4B7A',
    accent: '#28A0F0',
    glow: 'rgba(18, 170, 255, 0.2)',
  },
  // Optimism - Red/Orange
  10: {
    name: 'Optimism',
    primary: '#FF0420',
    secondary: '#7A1B1B',
    accent: '#FF3D3D',
    glow: 'rgba(255, 4, 32, 0.2)',
  },
  // Polygon - Purple
  137: {
    name: 'Polygon',
    primary: '#8247E5',
    secondary: '#4A2C91',
    accent: '#A56EFF',
    glow: 'rgba(130, 71, 229, 0.2)',
  },
  // Testnets - Same colors as their mainnet counterparts
  11155111: {
    name: 'Sepolia',
    primary: '#7C3AED',
    secondary: '#4C1D95',
    accent: '#8B5CF6',
    glow: 'rgba(124, 58, 237, 0.2)',
  },
  421614: {
    name: 'Arbitrum Sepolia',
    primary: '#12AAFF',
    secondary: '#1B4B7A',
    accent: '#28A0F0',
    glow: 'rgba(18, 170, 255, 0.2)',
  },
  11155420: {
    name: 'OP Sepolia',
    primary: '#FF0420',
    secondary: '#7A1B1B',
    accent: '#FF3D3D',
    glow: 'rgba(255, 4, 32, 0.2)',
  },
  80002: {
    name: 'Polygon Amoy',
    primary: '#8247E5',
    secondary: '#4A2C91',
    accent: '#A56EFF',
    glow: 'rgba(130, 71, 229, 0.2)',
  },
}

/**
 * Default theme for unknown networks
 */
export const DEFAULT_NETWORK_THEME: NetworkTheme = {
  name: 'Unknown',
  primary: '#71717A', // zinc-500
  secondary: '#3F3F46', // zinc-700
  accent: '#A1A1AA', // zinc-400
  glow: 'rgba(113, 113, 122, 0.2)',
}

/**
 * Get network theme by chain ID
 *
 * @param chainId - The chain ID
 * @returns Network theme or undefined if not found
 */
export function getNetworkTheme(chainId: number): NetworkTheme | undefined {
  return NETWORK_THEMES[chainId]
}

/**
 * Get a specific color from a network theme
 *
 * @param chainId - The chain ID
 * @param colorKey - Which color to get (primary, secondary, accent, glow)
 * @returns The color value or default fallback
 */
export function getNetworkThemeColor(chainId: number, colorKey: keyof NetworkTheme): string {
  const theme = NETWORK_THEMES[chainId] ?? DEFAULT_NETWORK_THEME
  return theme[colorKey]
}
