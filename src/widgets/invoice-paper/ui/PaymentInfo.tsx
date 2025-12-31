import React, { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Hexagon, Hash, ExternalLink, AlertTriangle } from 'lucide-react'
import { formatShortAddress } from '../lib/format'
import { NETWORK_BADGES } from '@/entities/network'
import { getExplorerUrl, getNetworkName } from '@/entities/network'
import { APP_URLS } from '@/shared/config'
import { cn } from '@/shared/lib/utils'
import { CopyButton } from '@/shared/ui'
import { InvoicePaperVariant, InvoiceStatus } from '../types'

interface PaymentInfoProps {
  /** Network chain ID */
  networkId: number
  /** Recipient wallet address */
  senderAddress: string
  /** Currency symbol (e.g., USDC, ETH) */
  currency: string
  /** Token contract address (optional for native tokens) */
  tokenAddress?: string | undefined
  /** Transaction hash when payment is made */
  txHash?: string | undefined
  /** Whether the transaction has been validated on-chain */
  txHashValidated?: boolean | undefined
  /** Invoice URL for QR code */
  invoiceUrl?: string | undefined
  /** Whether to show the QR code section (auto-hides when txHash present) */
  showQR?: boolean
  /** Display variant - 'full' enables interactive elements */
  variant?: InvoicePaperVariant
  /** Invoice status - used to determine if QR should be hidden */
  status?: InvoiceStatus | undefined
}

export const PaymentInfo = React.memo<PaymentInfoProps>(
  ({
    networkId,
    senderAddress,
    currency,
    tokenAddress,
    txHash,
    txHashValidated = true,
    invoiceUrl,
    showQR = true,
    variant = 'default',
    status,
  }) => {
    const isInteractive = variant === 'full'
    // Hide QR code when invoice is paid (txHash present) to give txHash more space
    const shouldShowQR = showQR && !txHash && status !== 'paid'

    // SSR-safe URL handling
    // TODO: [P0.11.3] Generate EIP-681 payment URI for direct wallet integration
    // Native ETH: ethereum:0xRecipient@chainId?value=amountInWei
    // ERC-20: ethereum:0xToken@chainId/transfer?address=0xRecipient&uint256=amount
    // See: https://eips.ethereum.org/EIPS/eip-681
    const qrUrl = useMemo(() => {
      if (invoiceUrl) return invoiceUrl
      return typeof window !== 'undefined' ? window.location.href : APP_URLS.base
    }, [invoiceUrl])

    const badgeConfig = NETWORK_BADGES[networkId] || {
      variant: 'outline' as const,
      colorClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    }

    const networkBadgeClass = cn(
      'text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize',
      badgeConfig.colorClass
    )

    const networkName = getNetworkName(networkId)

    return (
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
          {/* QR Code - hidden when paid to give txHash more space */}
          {shouldShowQR && (
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
                Recipient Wallet
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
                  <CopyButton value={senderAddress} size="sm" aria-label="Copy wallet address" />
                )}
              </div>
            </div>

            {/* Transaction Hash */}
            {txHash && (
              <div className="mt-1 border-t border-dashed border-zinc-300 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-[8px] font-bold text-zinc-400 uppercase">
                    <Hash className="h-2 w-2" aria-hidden="true" /> Transaction
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
                  {isInteractive ? (
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
                  ) : (
                    <div
                      className={cn(
                        'flex items-center gap-1 rounded border px-1.5 py-1',
                        txHashValidated
                          ? 'border-emerald-100 bg-emerald-50'
                          : 'border-amber-100 bg-amber-50'
                      )}
                    >
                      <span
                        className={cn(
                          'truncate font-mono text-[8px] font-medium',
                          txHashValidated ? 'text-emerald-800' : 'text-amber-800'
                        )}
                      >
                        {txHash}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

PaymentInfo.displayName = 'PaymentInfo'
