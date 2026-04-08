'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import {
  NetworkEthereum,
  NetworkArbitrumOne,
  NetworkOptimism,
  NetworkPolygon,
  NetworkBase,
} from '@web3icons/react'
import { cn } from '@/shared/lib/utils'

/**
 * Supported network chain IDs mapped to their web3icons components
 */
const NETWORK_ICONS: Record<number, React.ComponentType<{ className?: string; size?: number }>> = {
  1: NetworkEthereum,      // Ethereum Mainnet
  42161: NetworkArbitrumOne,  // Arbitrum One
  10: NetworkOptimism,     // Optimism
  137: NetworkPolygon,     // Polygon PoS
  8453: NetworkBase,       // Base
}

/**
 * Network brand colors for fallback circles
 */
const NETWORK_COLORS: Record<number, string> = {
  1: 'bg-indigo-500',      // Ethereum
  42161: 'bg-blue-500',    // Arbitrum
  10: 'bg-red-500',        // Optimism
  137: 'bg-purple-500',    // Polygon
  8453: 'bg-blue-600',     // Base
}

/**
 * Network short names for fallback letters
 */
const NETWORK_LETTERS: Record<number, string> = {
  1: 'E',      // Ethereum
  42161: 'A',  // Arbitrum
  10: 'O',     // Optimism
  137: 'P',    // Polygon
  8453: 'B',   // Base
}

/**
 * Testnet → mainnet chain ID resolution for icon lookup.
 * Duplicates TESTNET_PARENT from entities/network/lib/testnet-utils
 * because shared/ cannot import from entities/ (FSD).
 */
const TESTNET_TO_MAINNET: Record<number, number> = {
  11155111: 1,      // Sepolia → Ethereum
  421614: 42161,    // Arb Sepolia → Arbitrum
  11155420: 10,     // OP Sepolia → Optimism
  80002: 137,       // Polygon Amoy → Polygon
  84532: 8453,      // Base Sepolia → Base
}

const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum',
  42161: 'Arbitrum',
  10: 'Optimism',
  137: 'Polygon',
  8453: 'Base',
}

export interface NetworkIconProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** Network chain ID */
  chainId: number
  /** Icon size in pixels */
  size?: number
  /** Icon variant: 'branded' shows colors, 'mono' is grayscale */
  variant?: 'branded' | 'mono'
}

/**
 * Network Icon with Web3Icons
 *
 * Displays official network logos for supported chains.
 * Falls back to colored circle with letter for unknown networks.
 * Testnet chain IDs are resolved to their mainnet parent for icon lookup.
 *
 * @example
 * ```tsx
 * <NetworkIcon chainId={1} size={24} />        // Ethereum
 * <NetworkIcon chainId={42161} size={20} />    // Arbitrum
 * <NetworkIcon chainId={11155111} size={24} /> // Sepolia → shows Ethereum icon
 * ```
 */
export const NetworkIcon = forwardRef<HTMLSpanElement, NetworkIconProps>(
  ({ chainId, size = 24, variant = 'branded', className, ...props }, ref) => {
    const resolvedId = TESTNET_TO_MAINNET[chainId] ?? chainId
    const IconComponent = NETWORK_ICONS[resolvedId]

    // If we have a branded icon, use it
    if (IconComponent) {
      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center',
            variant === 'mono' && 'grayscale',
            className
          )}
          aria-label={NETWORK_NAMES[resolvedId] ?? `Chain ${chainId}`}
          {...props}
        >
          <IconComponent size={size} className="flex-shrink-0" />
        </span>
      )
    }

    // Fallback: colored circle with letter
    const bgColor = NETWORK_COLORS[resolvedId] || 'bg-zinc-600'
    const letter = NETWORK_LETTERS[resolvedId] || '?'

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full text-white font-bold',
          variant === 'mono' ? 'bg-zinc-500' : bgColor,
          className
        )}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.5,
        }}
        aria-label={NETWORK_NAMES[resolvedId] ?? `Chain ${chainId}`}
        {...props}
      >
        {letter}
      </span>
    )
  }
)

NetworkIcon.displayName = 'NetworkIcon'
