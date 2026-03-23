import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from '@/shared/ui/motion'
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
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  FlagIcon,
  Loader2Icon,
  QrCodeIcon,
  RefreshCwIcon,
  SearchIcon,
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

/** Shared base classes for footer action buttons */
const footerActionBase =
  'cursor-pointer select-none inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950'

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
}: PaymentPanelProps) {
  const [qrOpen, setQrOpen] = useState(false)
  const [txHashInput, setTxHashInput] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
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
  const isSearching = pollingMode === 'aggressive'
  const isChecking = pollingMode === 'manual'
  const txHashValid = /^0x[0-9a-fA-F]{64}$/.test(txHashInput)

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

      {/* Content — clean: Amount + CTA only */}
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

              {/* Secondary actions — tight below CTA */}
              {(onIvePaid || onCheckPayment || hasMoreOptions) && (
                <div className="flex items-center gap-1 -mt-2 -mb-1">
                  {onIvePaid && (
                    <button
                      type="button"
                      className={cn(
                        footerActionBase,
                        isSearching
                          ? 'text-violet-400 bg-violet-500/10 shadow-[0_0_12px_-3px_rgba(139,92,246,0.3)]'
                          : 'text-zinc-400 hover:bg-violet-500/10 hover:text-violet-300 hover:shadow-[0_0_12px_-3px_rgba(139,92,246,0.2)]',
                      )}
                      onClick={isSearching ? onStopPolling : onIvePaid}
                      data-testid="ive-paid-button"
                      aria-label={isSearching ? 'Stop searching for payment' : "I've already paid this invoice"}
                    >
                      {isSearching ? (
                        <>
                          <Loader2Icon size={12} className="motion-safe:animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <CheckIcon size={12} className="text-violet-400" />
                          I&apos;ve paid
                        </>
                      )}
                    </button>
                  )}
                  {onCheckPayment && (
                    <button
                      type="button"
                      className={cn(
                        footerActionBase,
                        isChecking
                          ? 'text-violet-400 bg-violet-500/10 shadow-[0_0_12px_-3px_rgba(139,92,246,0.3)]'
                          : cooldownSeconds > 0
                            ? 'text-zinc-600 cursor-not-allowed active:scale-100'
                            : 'text-zinc-400 hover:bg-violet-500/10 hover:text-violet-300 hover:shadow-[0_0_12px_-3px_rgba(139,92,246,0.2)]',
                      )}
                      onClick={isChecking ? onStopPolling : onCheckPayment}
                      disabled={cooldownSeconds > 0}
                      data-testid="check-payment-button"
                      aria-label={
                        isChecking
                          ? 'Stop checking for payment'
                          : cooldownSeconds > 0
                            ? `Check payment available in ${cooldownSeconds} seconds`
                            : 'Check if payment has been received'
                      }
                    >
                      {isChecking ? (
                        <>
                          <Loader2Icon size={12} className="motion-safe:animate-spin" />
                          Checking...
                        </>
                      ) : cooldownSeconds > 0 ? (
                        <>
                          <RefreshCwIcon size={12} />
                          {cooldownSeconds}s
                        </>
                      ) : (
                        <>
                          <RefreshCwIcon size={12} className="text-violet-400" />
                          Check
                        </>
                      )}
                    </button>
                  )}
                  {hasMoreOptions && (
                    <button
                      type="button"
                      className={cn(
                        footerActionBase,
                        moreOpen
                          ? 'text-violet-400 bg-violet-500/10'
                          : 'text-zinc-500 hover:bg-violet-500/10 hover:text-violet-300 hover:shadow-[0_0_12px_-3px_rgba(139,92,246,0.2)]',
                      )}
                      onClick={() => setMoreOpen(v => !v)}
                      data-testid="more-options-toggle"
                      aria-expanded={moreOpen}
                    >
                      {moreOpen ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
                      More
                    </button>
                  )}
                </div>
              )}

              {/* Expanded "More" panel */}
              {moreOpen && hasMoreOptions && (
                <div className="space-y-2 rounded-lg border border-zinc-800/60 bg-zinc-900/50 p-3">
                  {(onStartWatching || onStopWatching) && (
                    <button
                      type="button"
                      className={cn(
                        'cursor-pointer w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
                        isWatching
                          ? 'text-violet-400 bg-violet-500/10'
                          : 'text-zinc-400 hover:bg-violet-500/10 hover:text-violet-300',
                      )}
                      onClick={isWatching ? onStopWatching : onStartWatching}
                      data-testid={isWatching ? 'stop-watching-button' : 'start-watching-button'}
                      aria-label={isWatching ? 'Stop watching for incoming payment' : 'Automatically watch for incoming payment'}
                    >
                      {isWatching ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-violet-400 motion-safe:animate-pulse" />
                          Watching...
                        </>
                      ) : (
                        <>
                          <EyeIcon size={12} className="text-violet-400" />
                          Watch for payment
                        </>
                      )}
                    </button>
                  )}
                  {onVerifyTxHash && (
                    <div className="space-y-2">
                      <label htmlFor="txhash-input" className="block text-xs text-zinc-500">
                        Verify by transaction hash
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="txhash-input"
                          placeholder="0x..."
                          value={txHashInput}
                          onChange={e => setTxHashInput(e.target.value)}
                          className="flex-1 font-mono text-xs bg-zinc-900 border-zinc-700 text-zinc-200"
                          data-testid="txhash-input"
                          aria-describedby="txhash-hint"
                          aria-invalid={txHashInput.length > 0 && !txHashValid}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 h-[42px] w-[42px] border-zinc-700 text-violet-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 disabled:opacity-40 disabled:text-zinc-600"
                          disabled={!txHashValid}
                          onClick={() => onVerifyTxHash({ txHash: txHashInput })}
                          data-testid="verify-txhash-button"
                          aria-label="Verify transaction hash"
                        >
                          <SearchIcon size={16} />
                        </Button>
                      </div>
                      <p id="txhash-hint" className="text-[10px] text-zinc-600">
                        {txHashInput.length > 0 && !txHashValid
                          ? 'Enter a valid 66-character transaction hash (0x...)'
                          : 'Paste a transaction hash to verify payment manually'}
                      </p>
                    </div>
                  )}
                </div>
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

      {/* Footer — utility actions only */}
      <div className="px-4 pb-3">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        {/* Utility actions */}
        <div className="flex items-center justify-between w-full py-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-xs text-zinc-500 inline-flex items-center gap-1 opacity-50 cursor-not-allowed"
              aria-label="Download PDF (coming soon)"
            >
              <DownloadIcon size={12} />
              PDF
            </Button>
            {isPending && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQrOpen(true)}
                className="hidden md:inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white"
                aria-label="Show QR code for mobile payment"
              >
                <QrCodeIcon size={12} />
                QR
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isPaid && txHash && (
              <a
                href={getExplorerUrl(invoice.networkId, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-800/50 px-2.5 py-1.5 text-xs font-bold text-zinc-400 transition-colors border border-zinc-700/50 hover:text-white hover:bg-zinc-800"
              >
                View Tx
                <ExternalLinkIcon size={12} />
              </a>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-500 hover:text-red-400 font-medium group hover:bg-red-500/5"
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
