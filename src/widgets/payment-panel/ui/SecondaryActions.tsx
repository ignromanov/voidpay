import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
  RefreshCwIcon,
} from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'
import { track, AnalyticsEvent } from '@/features/analytics'

/** Shared base classes for secondary action buttons */
const footerActionBase =
  'cursor-pointer select-none inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950'

interface SecondaryActionsProps {
  onIvePaid?: (() => void) | undefined
  onCheckPayment?: (() => void) | undefined
  onStopPolling?: (() => void) | undefined
  isSearching: boolean
  isChecking: boolean
  cooldownSeconds: number
  hasMoreOptions: boolean
  moreOpen: boolean
  onToggleMore: () => void
}

export function SecondaryActions({
  onIvePaid,
  onCheckPayment,
  onStopPolling,
  isSearching,
  isChecking,
  cooldownSeconds,
  hasMoreOptions,
  moreOpen,
  onToggleMore,
}: SecondaryActionsProps) {
  if (!onIvePaid && !onCheckPayment && !hasMoreOptions) return null

  return (
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
          onClick={isSearching ? onStopPolling : () => {
            track(AnalyticsEvent.PAY_VERIFY, { method: 'ive-paid' })
            onIvePaid?.()
          }}
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
          onClick={isChecking ? onStopPolling : () => {
            track(AnalyticsEvent.PAY_VERIFY, { method: 'check' })
            onCheckPayment?.()
          }}
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
          onClick={onToggleMore}
          data-testid="more-options-toggle"
          aria-expanded={moreOpen}
        >
          {moreOpen ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
          More
        </button>
      )}
    </div>
  )
}
