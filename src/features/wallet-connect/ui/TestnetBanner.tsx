'use client'

/**
 * Testnet Banner Component
 *
 * Displays a warning banner when connected to a testnet network.
 * Helps prevent accidental use of test funds.
 */

import { useChainId } from 'wagmi'
import { useMemo } from 'react'
import { isTestnetChain, getChainById } from '../config/chains'
import { cn } from '@/shared/lib/utils'

/**
 * Hook to check if currently connected to a testnet
 *
 * @returns Whether the connected chain is a testnet
 */
export function useIsTestnet(): boolean {
  const chainId = useChainId()
  return useMemo(() => (chainId ? isTestnetChain(chainId) : false), [chainId])
}

/**
 * Props for TestnetBanner component
 */
export interface TestnetBannerProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * Testnet Warning Banner
 *
 * Renders a visible warning when connected to a testnet network.
 * Returns null when on mainnet to avoid unnecessary DOM elements.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <TestnetBanner />
 * <main>{children}</main>
 * ```
 */
export function TestnetBanner({ className }: TestnetBannerProps) {
  const chainId = useChainId()
  const isTestnet = useIsTestnet()

  // Don't render anything on mainnet
  if (!isTestnet || !chainId) {
    return null
  }

  const chain = getChainById(chainId)
  const chainName = chain?.name ?? 'Unknown Testnet'

  return (
    <div
      role="alert"
      className={cn(
        'w-full border-b border-amber-500/20 bg-amber-500/10',
        'px-4 py-2 text-center',
        className
      )}
    >
      <p className="text-sm font-medium text-amber-500">
        <span className="font-bold">TESTNET MODE</span>
        {' · '}
        Connected to {chainName}
        {' · '}
        <span className="text-amber-400">Use test funds only. Do not send real assets.</span>
      </p>
    </div>
  )
}
