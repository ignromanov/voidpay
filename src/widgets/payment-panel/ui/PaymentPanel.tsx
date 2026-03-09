import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { computeAmounts } from '../lib/compute-amounts'
import { STATUS_CONFIG } from './status-config'
import { AmountDisplay } from './AmountDisplay'
import { PaidConfirmation } from './PaidConfirmation'
import { ExpiredState } from './ExpiredState'
import { ActionSlot } from './ActionSlot'
import { ErrorBanner } from './ErrorBanner'
import { PollingStatus } from './PollingStatus'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FlagIcon,
  QrCodeIcon,
} from '@/shared/ui/icons'
import { getExplorerUrl } from '@/entities/network'
import { formatAmount } from '@/shared/lib/amount-utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'
import type { PaymentPanelProps } from '../types'

const QRModal = dynamic(
  () => import('@/features/payment-qr').then(mod => ({ default: mod.QRModal })),
  { ssr: false }
)

const footerDivider = (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
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
  onCheckPayment,
  cooldownUntil,
  onStartWatching,
  onStopWatching,
  onVerifyTxHash,
  finalized,
  reorgDetected,
}: PaymentPanelProps) {
  const [qrOpen, setQrOpen] = useState(false)
  const [txHashInput, setTxHashInput] = useState('')
  const [txHashOpen, setTxHashOpen] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownSeconds(0)
      return
    }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
      setCooldownSeconds(remaining)
      if (remaining === 0 && cooldownRef.current) {
        clearInterval(cooldownRef.current)
        cooldownRef.current = null
      }
    }
    update()
    cooldownRef.current = setInterval(update, 500)
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [cooldownUntil])

  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const amounts = useMemo(() => computeAmounts(invoice), [invoice])
  const isPaid = status === 'paid' || status === 'confirming'
  const isExpired = status === 'overdue'
  const isPending = !isPaid && !isExpired
  const showPulse = status === 'confirming'

  const isWatching = pollingMode === 'watching'
  const txHashValid = /^0x[0-9a-fA-F]{64}$/.test(txHashInput)

  return (
    <div
      data-testid="payment-panel"
      data-status={status}
      className={cn(
        'w-full rounded-xl bg-zinc-950/90 overflow-hidden relative shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.8)] transition-all duration-500',
        isPaid && 'border border-emerald-500/30'
      )}
    >
      {/* Top gradient bar */}
      <div
        data-testid="gradient-bar"
        className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          config.gradient,
          showPulse && 'animate-pulse'
        )}
      />

      {/* Content */}
      <div className="p-3 md:p-4 space-y-3 pt-6 md:pt-4">
        {/* Creator badge */}
        {source === 'created' && isPending && (
          <p className="text-center text-xs text-violet-400">
            Your invoice · Awaiting payment
          </p>
        )}

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

            {/* US4: "I've paid" button + polling status */}
            {onIvePaid && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-zinc-300 border-zinc-700 hover:border-violet-500/50 hover:text-white"
                  onClick={onIvePaid}
                  data-testid="ive-paid-button"
                >
                  I&apos;ve paid
                </Button>
              </div>
            )}

            {/* US6: "Check payment" button with cooldown */}
            {onCheckPayment && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-zinc-400 hover:text-white"
                onClick={onCheckPayment}
                disabled={cooldownSeconds > 0}
                data-testid="check-payment-button"
              >
                {cooldownSeconds > 0
                  ? `Check payment (${cooldownSeconds}s)`
                  : 'Check payment'}
              </Button>
            )}

            {/* US8: "Watch for payment" toggle (creator side) */}
            {(onStartWatching || onStopWatching) && (
              <div className="space-y-2">
                {isWatching ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-violet-400 hover:text-white"
                    onClick={onStopWatching}
                    data-testid="stop-watching-button"
                  >
                    Stop watching
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-zinc-400 hover:text-violet-300"
                    onClick={onStartWatching}
                    data-testid="start-watching-button"
                  >
                    Watch for payment
                  </Button>
                )}
              </div>
            )}

            {/* US9: "Verify by txHash" expandable section */}
            {onVerifyTxHash && (
              <div className="space-y-2">
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded"
                  onClick={() => setTxHashOpen(v => !v)}
                  data-testid="verify-txhash-toggle"
                  aria-expanded={txHashOpen}
                >
                  {txHashOpen ? (
                    <ChevronUpIcon size={12} />
                  ) : (
                    <ChevronDownIcon size={12} />
                  )}
                  Verify by transaction hash
                </button>
                {txHashOpen && (
                  <div className="space-y-2" data-testid="verify-txhash-section">
                    <Input
                      placeholder="0x..."
                      value={txHashInput}
                      onChange={e => setTxHashInput(e.target.value)}
                      className="font-mono text-xs bg-zinc-900 border-zinc-700 text-zinc-200"
                      data-testid="txhash-input"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-zinc-700 text-zinc-300 hover:text-white disabled:opacity-40"
                      disabled={!txHashValid}
                      onClick={() => onVerifyTxHash({ txHash: txHashInput })}
                      data-testid="verify-txhash-button"
                    >
                      Verify
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Unified polling status — single render point */}
            {pollingMode && pollingMode !== 'idle' && (
              <PollingStatus mode={pollingMode} />
            )}
          </>
        )}

        {/* Paid state: PaidConfirmation */}
        {isPaid && txHash && (
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
        )}

        {/* Paid without txHash: fallback (corrupted store data) */}
        {isPaid && !txHash && (
          <div className="text-center py-6" data-testid="paid-fallback">
            <CheckCircleIcon className="text-emerald-400 mx-auto mb-2" size={32} />
            <p className="text-sm text-zinc-200">Payment detected</p>
            <p className="text-xs text-zinc-400">Verifying transaction...</p>
          </div>
        )}

        {/* Expired state: ExpiredState */}
        {isExpired && (
          <ExpiredState
            subtotal={amounts.subtotal}
            magicDust={amounts.magicDust}
            exactTotal={amounts.exactTotal}
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
        {footerDivider}
        <div className="flex items-center justify-between w-full pt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-[10px] text-zinc-500 inline-flex items-center gap-1 opacity-50 cursor-not-allowed"
              aria-label="Download PDF"
            >
              <DownloadIcon size={12} />
              Download PDF
            </Button>
            {isPending && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQrOpen(true)}
                className={cn('hidden md:inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white')}
                aria-label="Show QR code for mobile payment"
              >
                <QrCodeIcon size={12} />
                Show QR
              </Button>
            )}
          </div>

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
            <Button
              variant="ghost"
              size="sm"
              className={cn('text-[10px] text-zinc-500 hover:text-red-400 font-medium group hover:bg-red-500/5')}
              aria-label="Report abuse"
            >
              <span className="inline-flex items-center gap-1">
                <FlagIcon size={12} className="group-hover:fill-current" />
                Report
              </span>
            </Button>
          </div>
        </div>
      </div>

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
