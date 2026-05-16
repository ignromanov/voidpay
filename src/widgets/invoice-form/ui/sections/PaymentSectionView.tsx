import React from 'react'
import { CoinsIcon } from '@/shared/ui/icons'
import { Heading } from '@/shared/ui/typography'
import { NetworkIcon } from '@/shared/ui/network-icon'
import { TokenIcon } from '@/shared/ui/token-icon'
import { cn } from '@/shared/lib/utils'

export interface PaymentSectionViewProps {
  networkLabel?: string
  tokenSymbol?: string
  /** Chain ID for rendering the network icon (e.g. 42161 for Arbitrum) */
  chainId?: number
  focusedField?: 'token' | 'network'
}

/**
 * PaymentSectionView — pure presentational display of network and token.
 *
 * No useCreatorStore, no NetworkSelect/TokenSelect interactives. Safe for Remotion, SSR, Storybook.
 * Container: PaymentSection.tsx
 */
export const PaymentSectionView = React.memo(function PaymentSectionView({
  networkLabel,
  tokenSymbol,
  chainId,
  focusedField,
}: PaymentSectionViewProps) {
  const focusRing = 'ring-2 ring-violet-500/60 ring-offset-1 ring-offset-zinc-950'

  return (
    <div className="space-y-4 border-t border-zinc-800/50 pt-4">
      <div className="mb-2 flex items-center gap-2">
        <CoinsIcon size={16} className="text-zinc-500" />
        <Heading variant="h4" className="text-zinc-500">
          Token & Network
        </Heading>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">Network</label>
        <div
          className={cn(
            'flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm',
            networkLabel ? 'text-zinc-200' : 'text-zinc-600',
            focusedField === 'network' && focusRing
          )}
        >
          {chainId !== undefined && <NetworkIcon chainId={chainId} size={16} />}
          {networkLabel ?? 'Select network'}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">Token</label>
        <div
          className={cn(
            'flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm',
            tokenSymbol ? 'text-zinc-200' : 'text-zinc-600',
            focusedField === 'token' && focusRing
          )}
        >
          {tokenSymbol && <TokenIcon symbol={tokenSymbol} size={16} />}
          {tokenSymbol ?? 'Select token'}
        </div>
      </div>
    </div>
  )
})
