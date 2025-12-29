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
  }) => {
    // SSR-safe URL handling
    const qrUrl = useMemo(() => {
      if (invoiceUrl) return invoiceUrl
      return typeof window !== 'undefined' ? window.location.href : 'https://voidpay.xyz'
    }, [invoiceUrl])

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
                    Scan to Pay
                  </span>
                </div>
              )}

              {/* Payment Details */}
              <div className="min-w-[220px] space-y-1.5 p-2.5">
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
          <div className="ml-auto min-w-[180px] flex-shrink-0 space-y-1">
            <div className="flex justify-between gap-4 text-sm text-zinc-600">
              <span>Subtotal</span>
              <span className="text-right font-mono tabular-nums">
                {formatAmount(totals.subtotal)} {currency}
              </span>
            </div>

            {totals.taxAmount > 0 && (
              <div className="flex justify-between gap-4 text-sm text-zinc-600">
                <span>Tax{taxPercent ? ` (${taxPercent})` : ''}</span>
                <span
                  className="text-right font-mono text-red-800 tabular-nums"
                  aria-label={`Plus ${formatAmount(totals.taxAmount)} ${currency} tax`}
                >
                  +{formatAmount(totals.taxAmount)} {currency}
                </span>
              </div>
            )}

            {totals.discountAmount > 0 && (
              <div className="flex justify-between gap-4 text-sm text-zinc-600">
                <span>Discount{discountPercent ? ` (${discountPercent})` : ''}</span>
                <span
                  className="text-right font-mono text-emerald-600 tabular-nums"
                  aria-label={`Minus ${formatAmount(totals.discountAmount)} ${currency} discount`}
                >
                  -{formatAmount(totals.discountAmount)} {currency}
                </span>
              </div>
            )}

            <div className="h-px bg-black"></div>

            <div className="flex items-baseline justify-between gap-3 pt-0.5">
              <span className="text-lg font-bold tracking-tight text-black">Total</span>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-black tracking-tighter text-violet-600 tabular-nums">
                    {formatAmount(totals.total)}
                  </span>
                  <span className="text-base font-bold text-violet-500">{currency}</span>
                </div>
                {showMagicDust && totals.magicDust > 0 && (
                  <div className="mt-0.5">
                    <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                      Exact: {totals.total.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
)

PaperTotals.displayName = 'PaperTotals'
