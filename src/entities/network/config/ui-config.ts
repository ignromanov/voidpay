/**
 * Network UI Configuration
 *
 * Visual metadata for network selectors and UI components.
 * Separated from chain configuration to allow UI customization
 * without affecting blockchain connectivity.
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
} from 'viem/chains'
import { HexagonIcon, TriangleIcon, ZapIcon } from '@/shared/ui/icons'
import { NETWORK_CODES, type NetworkId } from './networks'
import type { NetworkThemeName } from '@/shared/ui/constants/network-palette'
import { TESTNET_PARENT, withTestnets, resolveMainnetId } from '../lib/testnet-utils'

/**
 * Network name type for UI theming
 * Used for network-specific visual styling across the app
 * @deprecated Use NetworkThemeName from network-palette.ts directly
 */
export type NetworkName = NetworkThemeName

/**
 * Map chain ID to network theme name.
 * Resolves testnets to their mainnet parent before matching.
 */
export function getNetworkThemeName(chainId: number): NetworkThemeName {
  const resolvedId = resolveMainnetId(chainId)
  switch (resolvedId) {
    case arbitrum.id:
      return 'arbitrum'
    case optimism.id:
      return 'optimism'
    case polygon.id:
      return 'polygon'
    case base.id:
      return 'base'
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
    icon: HexagonIcon,
    iconFilled: false,
    colorClass: 'text-indigo-400',
  },
  {
    chainId: arbitrum.id,
    name: 'Arbitrum',
    icon: TriangleIcon,
    iconFilled: true,
    colorClass: 'text-blue-400',
  },
  {
    chainId: optimism.id,
    name: 'Optimism',
    icon: ZapIcon,
    iconFilled: true,
    colorClass: 'text-red-400',
  },
  {
    chainId: polygon.id,
    name: 'Polygon',
    icon: HexagonIcon,
    iconFilled: true,
    colorClass: 'text-purple-400',
  },
  {
    chainId: base.id,
    name: 'Base',
    icon: HexagonIcon,
    iconFilled: true,
    colorClass: 'text-blue-500',
  },
]

/**
 * Testnet display names for UI (shorter than NETWORKS canonical names)
 */
const TESTNET_NAMES: Record<number, string> = {
  [sepolia.id]: 'Sepolia',
  [arbitrumSepolia.id]: 'Arb Sepolia',
  [optimismSepolia.id]: 'OP Sepolia',
  [polygonAmoy.id]: 'Polygon Amoy',
  [baseSepolia.id]: 'Base Sepolia',
}

/**
 * Testnet UI configs derived from mainnet parents
 * Inherits icon, iconFilled, colorClass — only chainId and name differ
 */
const TESTNET_NETWORK_CONFIG: NetworkConfig[] = Object.entries(TESTNET_PARENT).map(
  ([testnetId, mainnetId]) => {
    const parent = NETWORK_CONFIG.find((c) => c.chainId === mainnetId)!
    return { ...parent, chainId: Number(testnetId), name: TESTNET_NAMES[Number(testnetId)] ?? parent.name }
  }
)

/**
 * Network short code → display name (derived from NETWORK_CONFIG + TESTNET_NETWORK_CONFIG).
 * Used by server-side renderers (OG images, PDF) where chain objects are unavailable.
 */
export const NETWORK_CODE_NAMES: Record<string, string> = Object.fromEntries(
  [...NETWORK_CONFIG, ...TESTNET_NETWORK_CONFIG].map((c) => [
    NETWORK_CODES[c.chainId as NetworkId],
    c.name,
  ]),
)

/**
 * Get network configs based on environment configuration
 * Returns mainnet-only by default, includes testnets when NEXT_PUBLIC_ENABLE_TESTNETS=true
 * Mirrors getSupportedChains() pattern from chains.ts
 */
export function getNetworkConfig(): NetworkConfig[] {
  const enableTestnets = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
  return enableTestnets ? [...NETWORK_CONFIG, ...TESTNET_NETWORK_CONFIG] : NETWORK_CONFIG
}

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
> = withTestnets({
  [mainnet.id]: {
    variant: 'secondary',
    colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  [arbitrum.id]: { variant: 'default', colorClass: 'bg-sky-100 text-sky-700 border-sky-200' },
  [optimism.id]: { variant: 'destructive', colorClass: 'bg-red-100 text-red-700 border-red-200' },
  [polygon.id]: {
    variant: 'outline',
    colorClass: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  [base.id]: {
    variant: 'default',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
})

/**
 * Network badge colors for dark UI (zinc-950 backgrounds).
 * Consumed by NetworkBadge in features/invoice-history.
 * Keyed by chainId; includes forward entry for Base (8453).
 */
export const NETWORK_BADGES_DARK: Record<number, string> = {
  [mainnet.id]: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  [arbitrum.id]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [optimism.id]: 'bg-red-500/10 text-red-400 border-red-500/20',
  [polygon.id]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  8453: 'bg-blue-500/10 text-blue-500 border-blue-500/20', // Base (reserved)
}

/**
 * Block explorers for each chain
 * NOTE: intentionally NOT using withTestnets() — testnets have different explorer URLs
 */
export const BLOCK_EXPLORERS: Record<number, { name: string; url: string }> = {
  [mainnet.id]: { name: 'Etherscan', url: 'https://etherscan.io' },
  [arbitrum.id]: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  [optimism.id]: { name: 'Optimism Etherscan', url: 'https://optimistic.etherscan.io' },
  [polygon.id]: { name: 'Polygonscan', url: 'https://polygonscan.com' },
  [base.id]: { name: 'BaseScan', url: 'https://basescan.org' },
  [sepolia.id]: { name: 'Sepolia Etherscan', url: 'https://sepolia.etherscan.io' },
  [arbitrumSepolia.id]: { name: 'Arbiscan Sepolia', url: 'https://sepolia.arbiscan.io' },
  [optimismSepolia.id]: { name: 'OP Sepolia Blockscout', url: 'https://optimism-sepolia.blockscout.com' },
  [polygonAmoy.id]: { name: 'Amoy Polygonscan', url: 'https://amoy.polygonscan.com' },
  [baseSepolia.id]: { name: 'BaseScan Sepolia', url: 'https://sepolia.basescan.org' },
}

/**
 * Network brand colors as hex values (for server-side rendering: OG images, PDF, etc.)
 * Mirrors colorClass Tailwind values — keep in sync with NETWORK_CONFIG above.
 *
 * Keyed by network short code (from NETWORK_CODES) for use in OG preview routes
 * where chain IDs are not available.
 */
export const NETWORK_CODE_COLORS: Record<string, string> = {
  eth: '#818CF8', // indigo-400
  arb: '#60A5FA', // blue-400
  op: '#F87171', // red-400
  poly: '#C084FC', // purple-400
  sep: '#818CF8', // inherits ethereum
  'arb-sep': '#60A5FA', // inherits arbitrum
  'op-sep': '#F87171', // inherits optimism
  amoy: '#C084FC', // inherits polygon
  base: '#3B82F6', // blue-500
  'base-sep': '#3B82F6', // inherits base
}

/**
 * Network-specific shadows for the invoice paper
 */
export const NETWORK_SHADOWS: Record<number, string> = withTestnets({
  [mainnet.id]: 'shadow-indigo-500/20',
  [arbitrum.id]: 'shadow-blue-500/20',
  [optimism.id]: 'shadow-red-500/20',
  [polygon.id]: 'shadow-purple-500/20',
  [base.id]: 'shadow-blue-500/20',
})

/**
 * Network-specific glow gradients for invoice background effect
 * Uses Tailwind gradient classes (from-X to-Y)
 * @deprecated Use NETWORK_GLOW_SHADOWS instead (box-shadow doesn't affect layout)
 */
export const NETWORK_GLOWS: Record<number, { from: string; to: string }> = withTestnets({
  [mainnet.id]: { from: 'from-indigo-600/40', to: 'to-blue-600/40' },
  [arbitrum.id]: { from: 'from-cyan-600/40', to: 'to-blue-600/40' },
  [optimism.id]: { from: 'from-red-600/40', to: 'to-orange-600/40' },
  [polygon.id]: { from: 'from-purple-600/40', to: 'to-violet-600/40' },
  [base.id]: { from: 'from-blue-600/40', to: 'to-indigo-600/40' },
})

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
export const NETWORK_GLOW_SHADOWS: Record<number, string> = withTestnets({
  // Indigo → Blue elliptical glow
  [mainnet.id]: 'before:from-indigo-500/60 before:to-blue-500/40',
  // Cyan → Blue elliptical glow
  [arbitrum.id]: 'before:from-cyan-500/60 before:to-blue-500/40',
  // Red → Orange elliptical glow
  [optimism.id]: 'before:from-red-500/60 before:to-orange-500/40',
  // Purple → Violet elliptical glow
  [polygon.id]: 'before:from-purple-500/60 before:to-violet-500/40',
  // Blue → Indigo elliptical glow
  [base.id]: 'before:from-blue-600/60 before:to-indigo-500/40',
})

/**
 * Network-specific glowing border for fullscreen modal
 * Uses ring (border) + box-shadow for glow effect
 *
 * RGB values for shadow colors:
 * - Indigo-500: 99, 102, 241
 * - Cyan-500: 6, 182, 212
 * - Red-500: 239, 68, 68
 * - Purple-500: 168, 85, 247
 */
export const NETWORK_GLOW_BORDERS: Record<number, string> = withTestnets({
  [mainnet.id]: 'ring-2 ring-indigo-500/60 shadow-[0_0_48px_rgba(99,102,241,0.4)]',
  [arbitrum.id]: 'ring-2 ring-cyan-500/60 shadow-[0_0_48px_rgba(6,182,212,0.4)]',
  [optimism.id]: 'ring-2 ring-red-500/60 shadow-[0_0_48px_rgba(239,68,68,0.4)]',
  [polygon.id]: 'ring-2 ring-purple-500/60 shadow-[0_0_48px_rgba(168,85,247,0.4)]',
  // Blue-500 RGB: 59, 130, 246
  [base.id]: 'ring-2 ring-blue-500/60 shadow-[0_0_48px_rgba(59,130,246,0.4)]',
})
