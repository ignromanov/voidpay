import React, { useState, useCallback } from 'react'
import { HashIcon, ExternalLinkIcon, AlertTriangleIcon, CheckIcon } from '@/shared/ui/icons'
import { PaymentQR } from '@/features/payment-qr'
import { formatShortAddress } from '../lib/format'
import { getExplorerUrl, getNetworkName } from '@/entities/network'
import { cn } from '@/shared/lib/utils'
import { NetworkIcon } from '@/shared/ui/network-icon'
import { TokenIcon } from '@/shared/ui/token-icon'
import { AddressAvatar } from '@/shared/ui/address-avatar'
import { isAddress } from 'viem'
import { InvoicePaperVariant, InvoiceStatus } from '../types'

interface PaymentInfoProps {
  /** Network chain ID */
  networkId: number
  /** Recipient wallet address */
  senderAddress?: string | undefined
  /** Currency symbol (e.g., USDC, ETH) */
  currency: string
  /** Token contract address (optional for native tokens) */
  tokenAddress?: string | undefined
  /** Transaction hash when payment is made */
  txHash?: string | undefined
  /** Whether the transaction has been validated on-chain */
  txHashValidated?: boolean | undefined
  /** Total in atomic units (bigint string) for PaymentQR */
  amount?: string | undefined
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
    amount,
    variant = 'default',
    status,
  }) => {
    const isInteractive = variant === 'full'
    // Hide QR when paid — txHash section takes QR's space
    const shouldShowQR = !txHash && status !== 'paid'

    const networkTextClass = 'text-[10px] font-semibold text-zinc-700 capitalize'

    const networkName = getNetworkName(networkId)

    const [copied, setCopied] = useState(false)
    const handleCopyAddress = useCallback(async () => {
      if (!senderAddress || !isInteractive) return
      try {
        await navigator.clipboard.writeText(senderAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch { /* clipboard not available */ }
    }, [senderAddress, isInteractive])

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
        </div>

        {/* Content: QR + Details side by side */}
        <div className="flex">
          {/* QR Code - hidden when paid to give txHash more space */}
          {shouldShowQR && (
            <div className="flex flex-col items-center justify-center gap-1 border-r border-zinc-200 p-3">
              <PaymentQR
                recipientAddress={senderAddress}
                chainId={networkId}
                amount={amount}
                tokenAddress={tokenAddress}
                size={88}
                variant="light"
              />
              <span className="text-[7px] font-semibold tracking-wide text-zinc-400 uppercase">
                Scan to pay
              </span>
            </div>
          )}

          {/* Payment Details */}
          <div className="max-w-[195px] space-y-1.5 p-2.5">
            {/* Network row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-bold text-zinc-400 uppercase">Network</span>
              <div className="flex items-center gap-2">
                <NetworkIcon chainId={networkId} size={18} />
                <span className={networkTextClass}>{networkName}</span>
              </div>
            </div>

            {/* Token row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-bold text-zinc-400 uppercase">Token</span>
              <div className="flex items-center gap-2">
                <TokenIcon symbol={currency} size={18} />
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
            </div>

            {/* Wallet Address - click-to-copy */}
            <div className="space-y-1 pt-1.5">
              <span className="block text-[9px] font-bold text-zinc-500 uppercase">
                Recipient Wallet
              </span>
              <div className="flex items-center gap-1">
                {senderAddress && isAddress(senderAddress) && (
                  <AddressAvatar
                    address={senderAddress as `0x${string}`}
                    size={24}
                    className="flex-shrink-0"
                  />
                )}
                <div
                  className={cn(
                    'relative flex-1 rounded border bg-white px-2 py-2 font-mono text-[10px] leading-relaxed font-medium break-all transition-colors',
                    senderAddress ? 'text-zinc-950' : 'text-zinc-400 italic',
                    copied
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-zinc-200',
                    isInteractive && senderAddress && 'cursor-pointer hover:border-zinc-300'
                  )}
                  onClick={isInteractive ? handleCopyAddress : undefined}
                  role={isInteractive && senderAddress ? 'button' : undefined}
                  tabIndex={isInteractive && senderAddress ? 0 : undefined}
                  onKeyDown={
                    isInteractive && senderAddress
                      ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopyAddress() } }
                      : undefined
                  }
                  title={isInteractive && senderAddress ? 'Click to copy address' : senderAddress}
                  aria-label={
                    senderAddress
                      ? `Wallet address: ${senderAddress}${isInteractive ? '. Click to copy' : ''}`
                      : 'Wallet address not set'
                  }
                >
                  {senderAddress || '0x... (wallet address)'}
                  {copied && (
                    <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-emerald-100 px-1 py-0.5 text-[8px] font-bold text-emerald-700">
                      <CheckIcon className="h-2.5 w-2.5" aria-hidden="true" />
                      Copied
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction Hash */}
            {txHash && (
              <div className="mt-1 border-t border-dashed border-zinc-300 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-[8px] font-bold text-zinc-400 uppercase">
                    <HashIcon className="h-2 w-2" aria-hidden="true" /> Transaction
                    {!txHashValidated && (
                      <span
                        className="ml-1 flex items-center gap-0.5 text-amber-600"
                        title="Transaction not yet verified on-chain"
                      >
                        <AlertTriangleIcon className="h-2.5 w-2.5" aria-hidden="true" />
                        <span className="text-[9px]">Unverified</span>
                      </span>
                    )}
                  </span>
                  {isInteractive ? (
                    <a
                      href={getExplorerUrl(networkId, txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'group flex min-h-[44px] items-center justify-between gap-1 rounded border px-1.5 py-1 transition-all',
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
                      <ExternalLinkIcon
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
