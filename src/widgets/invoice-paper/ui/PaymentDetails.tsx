import React from 'react'
import { Hexagon, Hash, ExternalLink } from 'lucide-react'
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
}

export const PaymentDetails = React.memo<PaymentDetailsProps>(
  ({ networkId, senderAddress, currency, tokenAddress, txHash }) => {
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

    // Determine the class for the network badge based on its variant
    const networkBadgeClass = cn(
      'text-xs font-bold px-2 py-0.5 rounded border capitalize',
      badgeConfig.variant === 'secondary' && 'bg-secondary text-secondary-foreground',
      badgeConfig.variant === 'destructive' && 'bg-destructive text-destructive-foreground',
      badgeConfig.variant === 'default' && 'bg-primary text-primary-foreground',
      badgeConfig.variant === 'outline' && 'border-input bg-background'
    )

    return (
      <div className="flex flex-col items-end">
        <div className="relative w-full max-w-[320px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-4 py-2">
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              Payment Details
            </span>
            <Hexagon className="h-4 w-4 text-zinc-400" />
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Network</span>
              <span className={networkBadgeClass}>
                {NETWORK_CONFIG.find((n) => n.chainId === networkId)?.name || networkId.toString()}
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase">
                Pay To (Wallet)
              </span>
              <div className="rounded border border-zinc-200 bg-white p-1.5 font-mono text-[10px] break-all text-zinc-900">
                {senderAddress || '0x...'}
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
                  {formatShortAddress(tokenAddress || '')}
                </span>
              </div>
            </div>

            {txHash && (
              <div className="mt-2 border-t border-dashed border-zinc-300 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                    <Hash className="h-2.5 w-2.5" /> Transaction Ref
                  </span>
                  <a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1 rounded border border-emerald-100 bg-emerald-50 px-2 py-1 transition-colors hover:border-emerald-300"
                    title="View on Explorer"
                  >
                    <span className="font-mono text-[9px] font-medium break-all text-emerald-700">
                      {txHash}
                    </span>
                    <div className="flex justify-end">
                      <ExternalLink className="h-2.5 w-2.5 text-emerald-400 group-hover:text-emerald-600" />
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
