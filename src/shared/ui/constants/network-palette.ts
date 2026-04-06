/**
 * Canonical Network Color Palette
 *
 * Single source of truth for network brand colors (hex values).
 * All other network visual configs derive from this palette.
 *
 * When adding a new network:
 * 1. Add entry here
 * 2. Add chain in entities/network/config/chains.ts
 * 3. Add testnet mapping in entities/network/lib/testnet-utils.ts
 * 4. Everything else derives automatically via withTestnets()
 */

/**
 * Network brand colors (hex values)
 */
export interface NetworkPalette {
  /** Primary brand color */
  primary: string
  /** Secondary/darker brand color */
  secondary: string
  /** Accent color for highlights */
  accent: string
  /** Glow/ambient effect color (rgba) */
  glow: string
}

/**
 * Canonical network palette keyed by theme name.
 * Ethereum uses VoidPay brand violet (not ETH gray).
 */
export const NETWORK_PALETTE = {
  ethereum: {
    primary: '#7C3AED',
    secondary: '#4C1D95',
    accent: '#8B5CF6',
    glow: 'rgba(124, 58, 237, 0.2)',
  },
  arbitrum: {
    primary: '#12AAFF',
    secondary: '#1B4B7A',
    accent: '#28A0F0',
    glow: 'rgba(18, 170, 255, 0.2)',
  },
  optimism: {
    primary: '#FF0420',
    secondary: '#7A1B1B',
    accent: '#FF3D3D',
    glow: 'rgba(255, 4, 32, 0.2)',
  },
  polygon: {
    primary: '#8247E5',
    secondary: '#4A2C91',
    accent: '#A56EFF',
    glow: 'rgba(130, 71, 229, 0.2)',
  },
  base: {
    primary: '#0052FF',
    secondary: '#1A3A7A',
    accent: '#3B82F6',
    glow: 'rgba(0, 82, 255, 0.2)',
  },
} as const satisfies Record<string, NetworkPalette>

/** All supported network theme names */
export type NetworkThemeName = keyof typeof NETWORK_PALETTE

/** Default palette for unknown networks */
export const DEFAULT_PALETTE: NetworkPalette = {
  primary: '#71717A',   // zinc-500
  secondary: '#3F3F46', // zinc-700
  accent: '#A1A1AA',    // zinc-400
  glow: 'rgba(113, 113, 122, 0.2)',
}
