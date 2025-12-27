import React, { useCallback, useState } from 'react'
import { Hexagon, Hash, ExternalLink, Copy, Check, AlertTriangle } from 'lucide-react'
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
  onCopyAddress?: ((address: string) => void) | undefined
}

export const PaymentDetails = React.memo<PaymentDetailsProps>(
  ({
    networkId,
    senderAddress,
    currency,
    tokenAddress,
    txHash,
    txHashValidated = true,
    onCopyAddress,
  }) => {
    const [copied, setCopied] = useState(false)

    const getExplorerUrl = (hash: string) => {
      const config = BLOCK_EXPLORERS[networkId]
      if (!config) return '#'
      return `${config.url}/tx/${hash}`
    }

    const formatShortAddress = (addr: string) => {
      if (!addr || addr.length < 10) return addr
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const handleCopyAddress = useCallback(async () => {
      if (!senderAddress) return

      try {
        await navigator.clipboard.writeText(senderAddress)
        setCopied(true)
        onCopyAddress?.(senderAddress)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Clipboard API not available - silent fail
      }
    }, [senderAddress, onCopyAddress])

    const badgeConfig = NETWORK_BADGES[networkId] || { variant: 'outline' }

    // Determine the class for the network badge based on its variant
    const networkBadgeClass = cn(
      'text-xs font-bold px-2 py-0.5 rounded border capitalize',
      badgeConfig.variant === 'secondary' && 'bg-secondary text-secondary-foreground',
      badgeConfig.variant === 'destructive' && 'bg-destructive text-destructive-foreground',
      badgeConfig.variant === 'default' && 'bg-primary text-primary-foreground',
      badgeConfig.variant === 'outline' && 'border-input bg-background'
    )

    const networkName =
      NETWORK_CONFIG.find((n) => n.chainId === networkId)?.name ?? networkId.toString()

    return (
      <div className="flex flex-col items-end" role="region" aria-label="Payment details">
        <div className="relative w-full max-w-[320px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-4 py-2">
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              Payment Details
            </span>
            <Hexagon className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Network</span>
              <span className={networkBadgeClass}>{networkName}</span>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase">
                Pay To (Wallet)
              </span>
              <div className="group relative">
                <div className="rounded border border-zinc-200 bg-white p-1.5 pr-8 font-mono text-[10px] break-all text-zinc-900">
                  {senderAddress || '0x...'}
                </div>
                {senderAddress && (
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className={cn(
                      'absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-1 transition-colors',
                      'hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1',
                      copied && 'text-emerald-600'
                    )}
                    aria-label={copied ? 'Address copied' : 'Copy wallet address'}
                    title={copied ? 'Copied!' : 'Copy address'}
                  >
                    {copied ? (
                      <Check className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Copy
                        className="h-3 w-3 text-zinc-400 group-hover:text-zinc-600"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Token</span>
                <span className="block font-mono text-xs font-bold text-black">{currency}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">
                  Token Contract
                </span>
                <span className="block truncate rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] text-zinc-600">
                  {formatShortAddress(tokenAddress ?? '')}
                </span>
              </div>
            </div>

            {txHash && (
              <div className="mt-2 border-t border-dashed border-zinc-300 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                    <Hash className="h-2.5 w-2.5" aria-hidden="true" /> Transaction Ref
                    {!txHashValidated && (
                      <span
                        className="ml-1 flex items-center gap-0.5 text-amber-600"
                        title="Transaction not yet verified on-chain"
                      >
                        <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                        <span className="text-[8px]">Unverified</span>
                      </span>
                    )}
                  </span>
                  <a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'group flex flex-col gap-1 rounded border px-2 py-1 transition-colors',
                      'focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1',
                      txHashValidated
                        ? 'border-emerald-100 bg-emerald-50 hover:border-emerald-300'
                        : 'border-amber-100 bg-amber-50 hover:border-amber-300'
                    )}
                    aria-label={`View transaction ${txHash.slice(0, 10)}... on block explorer`}
                    title="View on Explorer"
                  >
                    <span
                      className={cn(
                        'font-mono text-[9px] font-medium break-all',
                        txHashValidated ? 'text-emerald-700' : 'text-amber-700'
                      )}
                    >
                      {txHash}
                    </span>
                    <div className="flex justify-end">
                      <ExternalLink
                        className={cn(
                          'h-2.5 w-2.5',
                          txHashValidated
                            ? 'text-emerald-400 group-hover:text-emerald-600'
                            : 'text-amber-400 group-hover:text-amber-600'
                        )}
                        aria-hidden="true"
                      />
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

PaymentDetails.displayName = 'PaymentDetails'
