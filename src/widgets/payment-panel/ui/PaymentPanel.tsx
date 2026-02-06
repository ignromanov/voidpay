import { computeAmounts } from '../lib/compute-amounts'
import { STATUS_CONFIG } from './status-config'
import { AmountDisplay } from './AmountDisplay'
import { PaidConfirmation } from './PaidConfirmation'
import { ExpiredState } from './ExpiredState'
import { ActionSlot } from './ActionSlot'
import { ErrorBanner } from './ErrorBanner'
import { DownloadIcon, ExternalLinkIcon, FlagIcon } from '@/shared/ui/icons'
import { getExplorerUrl } from '@/entities/network'
import type { PaymentPanelProps } from '../types'

export function PaymentPanel({
  invoice,
  status,
  txHash,
  txHashValidated,
  confirmations,
  error,
  onDismissError,
  children,
}: PaymentPanelProps) {
  const config = STATUS_CONFIG[status]
  const amounts = computeAmounts(invoice)
  const isPending = status === 'pending'
  const isPaid = status === 'paid'
  const isExpired = status === 'expired'
  const showPulse = isPaid && !txHashValidated

  return (
    <div
      data-testid="payment-panel"
      data-status={status}
      className={`w-full rounded-xl bg-zinc-950/90 overflow-hidden relative shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.8)] transition-all duration-500 ${
        isPaid ? 'border border-emerald-500/30' : ''
      }`}
    >
      {/* Top gradient bar */}
      <div
        data-testid="gradient-bar"
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} ${
          showPulse ? 'animate-pulse' : ''
        }`}
      />

      {/* Content */}
      <div className="p-3 md:p-4 space-y-3 pt-6 md:pt-4">
        {/* Pending state: Amount + ActionSlot */}
        {isPending && (
          <>
            <AmountDisplay
              subtotal={amounts.subtotal}
              magicDust={amounts.magicDust}
              exactTotal={amounts.exactTotal}
              decimals={invoice.decimals}
              currency={invoice.currency}
            />
            <ActionSlot>{children}</ActionSlot>
          </>
        )}

        {/* Paid state: PaidConfirmation */}
        {isPaid && txHash && (
          <PaidConfirmation
            amount={amounts.exactTotal}
            decimals={invoice.decimals}
            currency={invoice.currency}
            networkId={invoice.networkId}
            txHash={txHash}
            txHashValidated={txHashValidated ?? false}
            confirmations={confirmations}
          />
        )}

        {/* Expired state: ExpiredState */}
        {isExpired && (
          <ExpiredState
            amount={amounts.exactTotal}
            decimals={invoice.decimals}
            currency={invoice.currency}
          />
        )}

        {/* Error banner (visible in any non-paid state) */}
        {!isPaid && error && onDismissError && (
          <ErrorBanner error={error} onDismiss={onDismissError} />
        )}
      </div>

      {/* Footer */}
      <div className="px-3 md:px-4 pb-3">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <div className="flex items-center justify-between w-full pt-2">
          <button
            disabled
            className="text-[10px] text-zinc-500 inline-flex items-center gap-1 opacity-50 cursor-not-allowed"
            aria-label="Download PDF"
          >
            <DownloadIcon size={12} />
            Download PDF
          </button>

          <div className="flex items-center gap-1">
            {isPaid && txHash && (
              <a
                href={getExplorerUrl(invoice.networkId, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border border-zinc-700/50"
              >
                View Tx
                <ExternalLinkIcon size={12} />
              </a>
            )}
            <button
              className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors font-medium group px-2 py-1 rounded hover:bg-red-500/5"
              aria-label="Report abuse"
            >
              <span className="inline-flex items-center gap-1">
                <FlagIcon size={12} className="group-hover:fill-current" />
                Report
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
