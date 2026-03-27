import { useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from '@/shared/ui/motion'
import { computeAmounts } from '../lib/compute-amounts'
import { STATUS_CONFIG } from './status-config'
import { useCooldown } from '../model/use-cooldown'
import { AmountDisplay } from './AmountDisplay'
import { PaidConfirmation } from './PaidConfirmation'
import { ExpiredState } from './ExpiredState'
import { ActionSlot } from './ActionSlot'
import { ErrorBanner } from './ErrorBanner'
import { PollingStatus } from './PollingStatus'
import { SecondaryActions } from './SecondaryActions'
import { MoreOptionsPanel } from './MoreOptionsPanel'
import { PanelFooter } from './PanelFooter'
import { CheckCircleIcon } from '@/shared/ui/icons'
import { formatAmount } from '@/shared/lib/amount-utils'
import { cn } from '@/shared/lib/utils'
import type { PaymentPanelProps } from '../types'
import { exportInvoicePdf } from '@/features/pdf-export'
import { track, AnalyticsEvent } from '@/features/analytics'

const QRModal = dynamic(
  () => import('@/features/payment-qr').then(mod => ({ default: mod.QRModal })),
  { ssr: false }
)

export function PaymentPanel({
  invoice,
  status,
  txHash,
  confirmations,
  error,
  onDismissError,
  source,
  children,
  onIvePaid,
  pollingMode,
  onStopPolling,
  onCheckPayment,
  cooldownUntil,
  onStartWatching,
  onStopWatching,
  onVerifyTxHash,
  finalized,
  reorgDetected,
  onShareOpen,
}: PaymentPanelProps) {
  const [qrOpen, setQrOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const handlePdfExport = useCallback(() => {
    track(AnalyticsEvent.PDF_EXPORT, { source: 'button' })
    const invoiceUrl = typeof window !== 'undefined' ? window.location.href : undefined
    const pdfStatus = status === 'confirming' ? undefined : status as 'draft' | 'pending' | 'paid' | 'overdue'
    void exportInvoicePdf(invoice, {
      status: pdfStatus,
      txHash,
      invoiceUrl,
    })
  }, [invoice, status, txHash])

  const cooldownSeconds = useCooldown(cooldownUntil)

  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const amounts = useMemo(() => computeAmounts(invoice), [invoice])
  const isPaid = status === 'paid' || status === 'confirming'
  const isExpired = status === 'overdue'
  const isPending = !isPaid && !isExpired
  const showPulse = status === 'confirming'

  const isWatching = pollingMode === 'watching'
  const isSearching = pollingMode === 'aggressive'
  const isChecking = pollingMode === 'manual'

  const hasMoreOptions = !!(onStartWatching || onStopWatching || onVerifyTxHash)

  return (
    <div
      data-testid="payment-panel"
      data-status={status}
      className={cn(
        'w-full rounded-xl bg-zinc-950/95 overflow-hidden relative shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-all duration-500',
        isPaid && 'border border-emerald-500/30'
      )}
    >
      {/* Top gradient bar */}
      <div
        data-testid="gradient-bar"
        className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-700',
          config.gradient,
          showPulse && 'motion-safe:animate-pulse'
        )}
      />

      {/* Content */}
      <div className="p-4 space-y-4 pt-5">
        {/* Creator badge */}
        {source === 'created' && isPending && (
          <p className="text-center text-xs text-violet-400">
            Your invoice · Awaiting payment
          </p>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {/* Pending state */}
          {isPending && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <AmountDisplay
                subtotal={amounts.subtotal}
                magicDust={amounts.magicDust}
                exactTotal={amounts.exactTotal}
                decimals={invoice.decimals}
                currency={invoice.currency}
              />
              <ActionSlot>{children}</ActionSlot>

              <SecondaryActions
                onIvePaid={onIvePaid}
                onCheckPayment={onCheckPayment}
                onStopPolling={onStopPolling}
                isSearching={isSearching}
                isChecking={isChecking}
                cooldownSeconds={cooldownSeconds}
                hasMoreOptions={hasMoreOptions}
                moreOpen={moreOpen}
                onToggleMore={() => setMoreOpen(v => !v)}
              />

              {moreOpen && hasMoreOptions && (
                <MoreOptionsPanel
                  isWatching={isWatching}
                  onStartWatching={onStartWatching}
                  onStopWatching={onStopWatching}
                  onVerifyTxHash={onVerifyTxHash}
                />
              )}

              {/* Watching status — only for watching mode */}
              {isWatching && (
                <PollingStatus mode="watching" />
              )}
            </motion.div>
          )}

          {/* Paid state: PaidConfirmation */}
          {isPaid && txHash && (
            <motion.div
              key="paid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaidConfirmation
                subtotal={amounts.subtotal}
                magicDust={amounts.magicDust}
                exactTotal={amounts.exactTotal}
                decimals={invoice.decimals}
                currency={invoice.currency}
                confirmations={confirmations}
                finalized={finalized}
                reorgDetected={reorgDetected}
              />
            </motion.div>
          )}

          {/* Paid without txHash: fallback */}
          {isPaid && !txHash && (
            <motion.div
              key="paid-fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center py-6" data-testid="paid-fallback">
                <CheckCircleIcon className="text-emerald-400 mx-auto mb-2" size={32} />
                <p className="text-sm text-zinc-200">Payment detected</p>
                <p className="text-xs text-zinc-400">Verifying transaction...</p>
              </div>
            </motion.div>
          )}

          {/* Expired state */}
          {isExpired && (
            <motion.div
              key="expired"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ExpiredState
                subtotal={amounts.subtotal}
                magicDust={amounts.magicDust}
                exactTotal={amounts.exactTotal}
                decimals={invoice.decimals}
                currency={invoice.currency}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner — outside AnimatePresence */}
        {!isPaid && error && onDismissError && (
          <ErrorBanner error={error} onDismiss={onDismissError} />
        )}
      </div>

      <PanelFooter
        isPending={isPending}
        isPaid={isPaid}
        txHash={txHash}
        networkId={invoice.networkId}
        onQrOpen={() => setQrOpen(true)}
        onShareOpen={onShareOpen}
        onPdfExport={handlePdfExport}
      />

      {/* QR Modal — desktop users scan with mobile wallet */}
      {isPending && (
        <QRModal
          open={qrOpen}
          onOpenChange={setQrOpen}
          invoice={invoice}
          amount={formatAmount(amounts.subtotal, invoice.decimals)}
          exactTotal={amounts.exactTotal}
          magicDustAmount={
            amounts.magicDust !== '0'
              ? formatAmount(amounts.exactTotal, invoice.decimals, { displayDecimals: invoice.decimals, useGrouping: true })
              : undefined
          }
        />
      )}
    </div>
  )
}
