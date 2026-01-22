'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import {
  TokenETH,
  TokenUSDC,
  TokenUSDT,
  TokenDAI,
  TokenWBTC,
  TokenMATIC,
  TokenOP,
  TokenARB,
} from '@web3icons/react'
import { cn } from '@/shared/lib/utils'

/**
 * Known token symbols mapped to their web3icons components
 * Only includes tokens we actively support to keep bundle size minimal
 */
const TOKEN_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  ETH: TokenETH,
  WETH: TokenETH, // WETH uses same icon as ETH
  USDC: TokenUSDC,
  USDT: TokenUSDT,
  DAI: TokenDAI,
  WBTC: TokenWBTC,
  MATIC: TokenMATIC,
  POL: TokenMATIC, // Polygon renamed MATIC to POL
  OP: TokenOP,
  ARB: TokenARB,
}

/**
 * Fallback colors for tokens without icons
 * Based on common token brand colors
 */
const TOKEN_COLORS: Record<string, string> = {
  ETH: 'bg-indigo-500',
  WETH: 'bg-indigo-400',
  USDC: 'bg-blue-500',
  USDT: 'bg-emerald-500',
  DAI: 'bg-amber-500',
  WBTC: 'bg-orange-500',
  MATIC: 'bg-purple-500',
  POL: 'bg-purple-500',
  OP: 'bg-red-500',
  ARB: 'bg-blue-400',
}

export interface TokenIconProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** Token symbol (e.g., ETH, USDC) */
  symbol: string
  /** Icon size in pixels */
  size?: number
  /** Show fallback letter if icon not available */
  showFallback?: boolean
}

/**
 * Token Icon with Web3Icons and Fallback
 *
 * Displays branded token icons for known tokens (ETH, USDC, etc.)
 * Falls back to a colored circle with first letter for unknown tokens.
 *
 * @example
 * ```tsx
 * <TokenIcon symbol="ETH" size={24} />
 * <TokenIcon symbol="CUSTOM" size={20} />
 * ```
 */
export const TokenIcon = forwardRef<HTMLSpanElement, TokenIconProps>(
  ({ symbol, size = 24, showFallback = true, className, ...props }, ref) => {
    const upperSymbol = symbol.toUpperCase()
    const IconComponent = TOKEN_ICONS[upperSymbol]

    // If we have a branded icon, use it
    if (IconComponent) {
      return (
        <span ref={ref} className={cn('inline-flex items-center justify-center', className)} {...props}>
          <IconComponent size={size} className="flex-shrink-0" />
        </span>
      )
    }

    // Fallback: colored circle with first letter
    if (!showFallback) return null

    const bgColor = TOKEN_COLORS[upperSymbol] || 'bg-zinc-600'
    const letter = symbol.charAt(0).toUpperCase()

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full text-white font-bold',
          bgColor,
          className
        )}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
        }}
        aria-label={`${symbol} token`}
        {...props}
      >
        {letter}
      </span>
    )
  }
)

TokenIcon.displayName = 'TokenIcon'
