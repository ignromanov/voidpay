'use client'

/**
 * LazyWalletButton - Dynamically loaded wallet connection button
 *
 * Reduces initial bundle size by ~60-80KB by lazy-loading RainbowKit.
 * Shows a disabled placeholder while the heavy dependencies load.
 */

import dynamic from 'next/dynamic'
import { Wallet } from 'lucide-react'
import { Button } from './button'

const WalletButton = dynamic(
  () => import('./wallet-button').then((mod) => ({ default: mod.WalletButton })),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" size="sm" className="gap-1.5" disabled>
        <Wallet className="h-4 w-4" />
        Connect
      </Button>
    ),
  }
)

export { WalletButton as LazyWalletButton }
