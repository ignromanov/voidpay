import React, { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Hexagon, Hash, ExternalLink, AlertTriangle } from 'lucide-react'
import { Totals } from '../lib/calculate-totals'
import { formatAmount, formatShortAddress } from '../lib/format'
import {
  NETWORK_BADGES,
  BLOCK_EXPLORERS,
  NETWORK_CONFIG,
} from '@/entities/network/config/ui-config'
import { cn } from '@/shared/lib/utils'
import { CopyButton } from '@/shared/ui'
import { InvoicePaperVariant } from '../types'

function getExplorerUrl(networkId: number, hash: string): string {
  const config = BLOCK_EXPLORERS[networkId]
  if (!config) return '#'
  return `${config.url}/tx/${hash}`
}

interface PaperTotalsProps {
  totals: Totals
  currency: string
  taxPercent?: string | undefined
  discountPercent?: string | undefined
  showMagicDust?: boolean
  showQR?: boolean
  invoiceUrl?: string
  // Payment details props
  networkId: number
  senderAddress: string
  tokenAddress?: string | undefined
  txHash?: string | undefined
  txHashValidated?: boolean | undefined
  variant?: InvoicePaperVariant
}

export const PaperTotals = React.memo<PaperTotalsProps>(
  ({
    totals,
    currency,
    taxPercent,
    discountPercent,
    showMagicDust = true,
    showQR = true,
    invoiceUrl,
    networkId,
    senderAddress,
    tokenAddress,
    txHash,
    txHashValidated = true,
    variant = 'default',
  }) => {
    const isInteractive = variant === 'full'

    // SSR-safe URL handling
    // TODO: [P0.11.3] Generate EIP-681 payment URI for direct wallet integration
    // Native ETH: ethereum:0xRecipient@chainId?value=amountInWei
    // ERC-20: ethereum:0xToken@chainId/transfer?address=0xRecipient&uint256=amount
    // See: https://eips.ethereum.org/EIPS/eip-681
    const qrUrl = useMemo(() => {
      if (invoiceUrl) return invoiceUrl
      return typeof window !== 'undefined' ? window.location.href : 'https://voidpay.xyz'
    }, [invoiceUrl])

    const badgeConfig = NETWORK_BADGES[networkId] || { variant: 'outline' }

    const networkBadgeClass = cn(
      'text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize',
      badgeConfig.variant === 'secondary' && 'bg-secondary text-secondary-foreground',
      badgeConfig.variant === 'destructive' && 'bg-destructive text-destructive-foreground',
      badgeConfig.variant === 'default' && 'bg-primary text-primary-foreground',
      badgeConfig.variant === 'outline' && 'border-input bg-background'
    )

    const networkName =
      NETWORK_CONFIG.find((n) => n.chainId === networkId)?.name ?? networkId.toString()

    return (
      <section className="mt-auto border-t border-zinc-200 pt-4">
        <div className="flex items-start gap-4">
          {/* Payment Info Block - QR + Details unified */}
          <div
            className="flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
            role="region"
            aria-label="Payment information"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-3 py-1.5">
              <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
                Payment Info
              </span>
              <Hexagon className="h-3 w-3 text-zinc-400" aria-hidden="true" />
            </div>

            {/* Content: QR + Details side by side */}
            <div className="flex">
              {/* QR Code */}
              {showQR && (
                <div className="flex flex-col items-center justify-center gap-1 border-r border-zinc-200 p-3">
                  <div
                    className="flex aspect-square w-24 items-center justify-center rounded border border-zinc-200 bg-white p-1"
                    role="img"
                    aria-label="QR code linking to this invoice"
                    title={`QR Code: ${qrUrl}`}
                  >
                    <QRCodeSVG value={qrUrl} className="h-full w-full" level="H" />
                  </div>
                  <span className="text-[7px] font-semibold tracking-wide text-zinc-400 uppercase">
                    Scan for payment link
                  </span>
                </div>
              )}

              {/* Payment Details */}
              <div className="min-w-[220px] space-y-1.5 p-2.5">
                {/* Network row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase">Network</span>
                  <span className={networkBadgeClass}>{networkName}</span>
                </div>

                {/* Token row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase">Token</span>
                  <span
                    className="font-mono text-[9px] font-bold whitespace-nowrap text-zinc-700"
                    title={tokenAddress}
                  >
                    {currency}
                    {tokenAddress && (
                      <span className="font-normal text-zinc-400">
                        {' '}
                        ({formatShortAddress(tokenAddress)})
                      </span>
                    )}
                  </span>
                </div>

                {/* Wallet Address - prominent */}
                <div className="space-y-1 pt-1.5">
                  <span className="block text-[9px] font-bold text-zinc-500 uppercase">
                    Pay To (Wallet)
                  </span>
                  <div className="flex items-center gap-1">
                    <div
                      className="flex-1 rounded border border-zinc-200 bg-white px-2 py-1.5 font-mono text-[10px] leading-relaxed font-medium text-zinc-950"
                      title={senderAddress}
                      aria-label={`Wallet address: ${senderAddress}`}
                    >
                      {senderAddress || '0x...'}
                    </div>
                    {isInteractive && senderAddress && (
                      <CopyButton
                        value={senderAddress}
                        size="sm"
                        aria-label="Copy wallet address"
                      />
                    )}
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
                        href={getExplorerUrl(networkId, txHash)}
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
          </div>

          {/* Right - Totals */}
          <div className="ml-auto flex-shrink-0">
            {/* Grid for consistent alignment: label | amount | currency */}
            <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-3 gap-y-1 text-sm">
              <span className="text-zinc-600">Subtotal</span>
              <span className="text-right font-mono text-zinc-600 tabular-nums">
                {formatAmount(totals.subtotal)}
              </span>
              <span className="font-mono text-zinc-600">{currency}</span>

              {totals.taxAmount > 0 && (
                <>
                  <span className="text-zinc-600">Tax{taxPercent ? ` (${taxPercent})` : ''}</span>
                  <span
                    className="text-right font-mono text-red-800 tabular-nums"
                    aria-label={`Plus ${formatAmount(totals.taxAmount)} ${currency} tax`}
                  >
                    +{formatAmount(totals.taxAmount)}
                  </span>
                  <span className="font-mono text-red-800">{currency}</span>
                </>
              )}

              {totals.discountAmount > 0 && (
                <>
                  <span className="text-zinc-600">
                    Discount{discountPercent ? ` (${discountPercent})` : ''}
                  </span>
                  <span
                    className="text-right font-mono text-emerald-600 tabular-nums"
                    aria-label={`Minus ${formatAmount(totals.discountAmount)} ${currency} discount`}
                  >
                    -{formatAmount(totals.discountAmount)}
                  </span>
                  <span className="font-mono text-emerald-600">{currency}</span>
                </>
              )}
            </div>

            <div className="my-2 h-px bg-black"></div>

            <div className="flex items-baseline justify-between gap-4">
              <span className="text-lg font-bold tracking-tight text-black">Total</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-black tracking-tighter text-violet-600 tabular-nums">
                  {formatAmount(totals.total)}
                </span>
                <span className="text-base font-bold text-violet-500">{currency}</span>
              </div>
            </div>

            {showMagicDust && totals.magicDust > 0 && (
              <div
                className="mt-1 text-right"
                title="Unique micro-amount for payment identification"
              >
                <span className="text-[9px] tracking-wide text-zinc-400 uppercase">
                  Payment ID:{' '}
                </span>
                <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                  {totals.total.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }
)

PaperTotals.displayName = 'PaperTotals'
