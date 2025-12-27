import React from 'react'
import { Hexagon, Hash, ExternalLink, AlertTriangle } from 'lucide-react'
import {
  NETWORK_BADGES,
  BLOCK_EXPLORERS,
  NETWORK_CONFIG,
} from '@/entities/network/config/ui-config'
import { cn } from '@/shared/lib/utils'

interface PaymentDetailsProps {
  networkId: number
  senderAddress: string
  currency: string
  tokenAddress?: string | undefined
  txHash?: string | undefined
  txHashValidated?: boolean | undefined
}

export const PaymentDetails = React.memo<PaymentDetailsProps>(
  ({ networkId, senderAddress, currency, tokenAddress, txHash, txHashValidated = true }) => {
    const getExplorerUrl = (hash: string) => {
      const config = BLOCK_EXPLORERS[networkId]
      if (!config) return '#'
      return `${config.url}/tx/${hash}`
    }

    const formatShortAddress = (addr: string) => {
      if (!addr || addr.length < 10) return addr
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const badgeConfig = NETWORK_BADGES[networkId] || { variant: 'outline' }

    const networkBadgeClass = cn(
      'text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize',
      badgeConfig.variant === 'secondary' && 'bg-secondary text-secondary-foreground',
      badgeConfig.variant === 'destructive' && 'bg-destructive text-destructive-foreground',
      badgeConfig.variant === 'default' && 'bg-primary text-primary-foreground',
      badgeConfig.variant === 'outline' && 'border-input bg-background'
    )

    const networkName =
      NETWORK_CONFIG.find((n) => n.chainId === networkId)?.name ?? networkId.toString()

    return (
      <div
        className={cn('max-w-[325px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50')}
        role="region"
        aria-label="Payment details"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-2.5 py-1.5">
          <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
            Payment Details
          </span>
          <Hexagon className="h-3 w-3 text-zinc-400" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="space-y-1.5 p-2.5">
          {/* Network row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-bold text-zinc-500 uppercase">Network</span>
            <span className={networkBadgeClass}>{networkName}</span>
          </div>

          {/* Token row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-bold text-zinc-500 uppercase">Token</span>
            <span
              className="font-mono text-[10px] font-bold whitespace-nowrap text-black"
              title={tokenAddress}
            >
              {currency}
              {tokenAddress && (
                <span className="font-normal text-zinc-500">
                  {' '}
                  ({formatShortAddress(tokenAddress)})
                </span>
              )}
            </span>
          </div>

          {/* Wallet Address */}
          <div className="space-y-0.5 pt-1">
            <span className="block text-[9px] font-bold text-zinc-500 uppercase">
              Pay To (Wallet)
            </span>
            <div
              className="rounded border border-zinc-200 bg-white px-2 py-1 font-mono text-[9px] leading-relaxed text-zinc-950"
              title={senderAddress}
              aria-label={`Wallet address: ${senderAddress}`}
            >
              {senderAddress || '0x...'}
            </div>
          </div>

          {/* Transaction Hash */}
          {txHash && (
            <div className="mt-1 border-t border-dashed border-zinc-300 pt-2">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 text-[8px] font-bold text-zinc-400 uppercase">
                  <Hash className="h-2 w-2" aria-hidden="true" /> Tx
                  {!txHashValidated && (
                    <span
                      className="ml-1 flex items-center gap-0.5 text-amber-600"
                      title="Transaction not yet verified on-chain"
                    >
                      <AlertTriangle className="h-2 w-2" aria-hidden="true" />
                      <span className="text-[7px]">Unverified</span>
                    </span>
                  )}
                </span>
                <a
                  href={getExplorerUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group flex items-center justify-between gap-1 rounded border px-1.5 py-1 transition-all',
                    'focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1',
                    'hover:shadow-sm',
                    txHashValidated
                      ? 'border-emerald-100 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100'
                      : 'border-amber-100 bg-amber-50 hover:border-amber-300 hover:bg-amber-100'
                  )}
                  aria-label={`View transaction ${txHash.slice(0, 10)}... on block explorer`}
                  title="View on Block Explorer"
                >
                  <span
                    className={cn(
                      'truncate font-mono text-[8px] font-medium',
                      txHashValidated ? 'text-emerald-800' : 'text-amber-800'
                    )}
                  >
                    {txHash}
                  </span>
                  <ExternalLink
                    className={cn(
                      'h-2.5 w-2.5 flex-shrink-0',
                      txHashValidated
                        ? 'text-emerald-500 group-hover:text-emerald-700'
                        : 'text-amber-500 group-hover:text-amber-700'
                    )}
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

PaymentDetails.displayName = 'PaymentDetails'
