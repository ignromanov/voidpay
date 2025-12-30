/**
 * DemoSection constants
 * Feature: 012-landing-page
 */

// Invoice paper dimensions (A4 at 96 DPI)
export const INVOICE_WIDTH = 794
export const INVOICE_HEIGHT = 1123

// Network theme colors for background glow
export const NETWORK_THEMES = {
  ethereum: {
    badge: 'bg-blue-600',
    glowFrom: 'from-blue-600/40',
    glowTo: 'to-indigo-600/40',
  },
  arbitrum: {
    badge: 'bg-cyan-600',
    glowFrom: 'from-cyan-600/40',
    glowTo: 'to-blue-600/40',
  },
  optimism: {
    badge: 'bg-red-600',
    glowFrom: 'from-red-600/40',
    glowTo: 'to-orange-600/40',
  },
  polygon: {
    badge: 'bg-purple-600',
    glowFrom: 'from-purple-600/40',
    glowTo: 'to-violet-600/40',
  },
} as const

export type NetworkName = keyof typeof NETWORK_THEMES

// Chain ID → Network name mapping
export function getNetworkName(netId: number): NetworkName {
  if (netId === 42161) return 'arbitrum'
  if (netId === 10) return 'optimism'
  if (netId === 137) return 'polygon'
  return 'ethereum'
}
