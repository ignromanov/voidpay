'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import {
  NetworkEthereum,
  NetworkArbitrumOne,
  NetworkOptimism,
  NetworkPolygon,
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
}

/**
 * Network brand colors for fallback circles
 */
const NETWORK_COLORS: Record<number, string> = {
  1: 'bg-indigo-500',      // Ethereum
  42161: 'bg-blue-500',    // Arbitrum
  10: 'bg-red-500',        // Optimism
  137: 'bg-purple-500',    // Polygon
}

/**
 * Network short names for fallback letters
 */
const NETWORK_LETTERS: Record<number, string> = {
  1: 'E',      // Ethereum
  42161: 'A',  // Arbitrum
  10: 'O',     // Optimism
  137: 'P',    // Polygon
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
 *
 * @example
 * ```tsx
 * <NetworkIcon chainId={1} size={24} />        // Ethereum
 * <NetworkIcon chainId={42161} size={20} />    // Arbitrum
 * ```
 */
export const NetworkIcon = forwardRef<HTMLSpanElement, NetworkIconProps>(
  ({ chainId, size = 24, variant = 'branded', className, ...props }, ref) => {
    const IconComponent = NETWORK_ICONS[chainId]

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
          {...props}
        >
          <IconComponent size={size} className="flex-shrink-0" />
        </span>
      )
    }

    // Fallback: colored circle with letter
    const bgColor = NETWORK_COLORS[chainId] || 'bg-zinc-600'
    const letter = NETWORK_LETTERS[chainId] || '?'

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
        aria-label={`Chain ${chainId}`}
        {...props}
      >
        {letter}
      </span>
    )
  }
)

NetworkIcon.displayName = 'NetworkIcon'
