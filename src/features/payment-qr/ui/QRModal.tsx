'use client'

import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/ui/dialog'
import { NetworkIcon } from '@/shared/ui/network-icon'
import { TokenIcon } from '@/shared/ui/token-icon'
import { CopyButton } from '@/shared/ui/copy-button'
import { MagicDustBadge } from '@/shared/ui/magic-dust-badge'
import { getNetworkName } from '@/entities/network'
import { buildPaymentUri } from '../lib/build-payment-uri'
import { PaymentQR } from './PaymentQR'
import type { Invoice } from '@/shared/lib/invoice-types'

interface QRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Full invoice data for EIP-681 URI generation */
  invoice: Invoice
  /** Formatted clean display amount (e.g. "1,500.00") */
  amount: string
  /** Exact total in atomic units (for EIP-681 URI) */
  exactTotal: string
  /** Formatted exact total with dust for footnote (e.g. "1,500.000042") */
  magicDustAmount?: string | undefined
}

export function QRModal({
  open,
  onOpenChange,
  invoice,
  amount,
  exactTotal,
  magicDustAmount,
}: QRModalProps) {
  const networkName = getNetworkName(invoice.networkId)
  const recipientAddress = invoice.from.walletAddress

  // Build EIP-681 payment URI for "Copy Payment URI" display
  const paymentUri = useMemo(
    () =>
      buildPaymentUri({
        recipientAddress,
        chainId: invoice.networkId,
        amount: exactTotal,
        tokenAddress: invoice.tokenAddress,
      }),
    [recipientAddress, invoice.networkId, exactTotal, invoice.tokenAddress]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm border-zinc-800 bg-zinc-950/95 p-5 backdrop-blur-xl"
        aria-describedby={undefined}
      >
        <DialogTitle className="text-base font-bold text-white">
          Scan to Pay
        </DialogTitle>

        <div className="flex max-h-[85dvh] flex-col items-center gap-3 overflow-y-auto">
          {/* Inverted QR code — white modules on dark bg with VoidPay logo */}
          <div className="flex-shrink-0 p-2" data-testid="qr-card">
            <PaymentQR
              recipientAddress={recipientAddress}
              chainId={invoice.networkId}
              amount={exactTotal}
              tokenAddress={invoice.tokenAddress}
              size={240}
              variant="dark"
              showLogo
            />
          </div>

          {/* Amount + Currency with token icon */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-2">
              <TokenIcon symbol={invoice.currency} size={24} />
              <span className="font-mono text-2xl font-bold text-white">
                {amount}
              </span>
              <span className="text-lg font-medium text-zinc-400">
                {invoice.currency}
              </span>
            </div>
            {magicDustAmount && (
              <MagicDustBadge label="Exact amount" amount={magicDustAmount} currency={invoice.currency} variant="dark" />
            )}
          </div>

          {/* Network badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">
            <NetworkIcon chainId={invoice.networkId} size={14} />
            <span className="text-xs font-medium capitalize text-zinc-300">
              {networkName}
            </span>
          </div>

          {/* Recipient address — full address */}
          <div className="flex w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-medium uppercase text-zinc-500">
                Recipient
              </span>
              <span className="block break-all font-mono text-[11px] leading-relaxed text-zinc-300">
                {recipientAddress}
              </span>
            </div>
            <CopyButton
              value={recipientAddress}
              size="sm"
              className="flex-shrink-0"
              aria-label="Copy recipient address"
            />
          </div>

          {/* Copy Payment URI */}
          <div className="flex w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-medium uppercase text-zinc-500">
                Payment URI
              </span>
              <span className="block truncate font-mono text-[11px] text-zinc-300">
                {paymentUri}
              </span>
            </div>
            <CopyButton
              value={paymentUri}
              size="sm"
              className="flex-shrink-0"
              aria-label="Copy payment URI"
            />
          </div>

          {/* Helper text */}
          <p className="text-center text-xs text-zinc-500">
            Scan with your mobile wallet to initiate the payment transaction
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
