import { useEffect, useRef } from 'react'

import { formatAmount } from '@/shared/lib/amount-utils'
import { formatRelativeTime } from '@/shared/lib/date-time'
import { cn } from '@/shared/lib/utils'
import { toast } from '@/shared/lib/toast'
import { MagicDustBadge } from '@/shared/ui/magic-dust-badge'
import { CheckIcon, CheckCheckIcon, ShieldCheckIcon } from '@/shared/ui/icons'
import { motion } from '@/shared/ui/motion'

import type { ConfirmationProgress } from '../types'
import { CreateYourOwnCta } from './CreateYourOwnCta'
import { NetworkChip } from './NetworkChip'

interface PaidConfirmationProps {
  subtotal: string
  magicDust: string
  exactTotal: string
  decimals: number
  currency: string
  networkId: number
  paidAt?: string | undefined
  confirmations?: ConfirmationProgress | undefined
  finalized?: boolean | undefined
  reorgDetected?: boolean | undefined
}

export function PaidConfirmation({
  subtotal,
  magicDust,
  exactTotal,
  decimals,
  currency,
  networkId,
  paidAt,
  confirmations,
  finalized = false,
  reorgDetected = false,
}: PaidConfirmationProps) {
  const formattedSubtotal = formatAmount(subtotal, decimals)
  const hasMagicDust = magicDust !== '0'
  const formattedExact = hasMagicDust
    ? formatAmount(exactTotal, decimals, { displayDecimals: decimals, useGrouping: true })
    : null
  const progressPercent = confirmations
    ? Math.min((confirmations.current / confirmations.required) * 100, 100)
    : 0

  const reorgToastFired = useRef(false)

  useEffect(() => {
    if (reorgDetected && !reorgToastFired.current) {
      reorgToastFired.current = true
      toast.info('Chain reorg detected — payment may need re-verification')
    }
  }, [reorgDetected])

  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="flex items-center gap-3 pr-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] text-emerald-500"
        >
          {finalized ? (
            <CheckCheckIcon size={24} strokeWidth={3} />
          ) : (
            <CheckIcon size={24} strokeWidth={3} />
          )}
        </motion.div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-emerald-400">
            Payment Successful
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <NetworkChip networkId={networkId} />
            <p className="text-xs text-zinc-500">
              {paidAt ? `Funds sent · ${formatRelativeTime(paidAt)}` : 'Funds have been sent on-chain'}
            </p>
          </div>
        </div>
      </div>

      {/* Amount accent */}
      <div className="py-2 pl-2 border-l-2 border-emerald-500/30 bg-emerald-500/5 rounded-r-lg">
        <div className="flex min-w-0 items-baseline gap-2 pl-2">
          <span className="min-w-0 truncate text-2xl font-black font-mono tracking-tight text-white sm:text-4xl">
            {formattedSubtotal}
          </span>
          <span className="text-xl text-emerald-400/80">{currency}</span>
        </div>
        {hasMagicDust && formattedExact && (
          <div className="pl-2 mt-1">
            <MagicDustBadge label="Sent" amount={formattedExact} currency={currency} variant="dark" />
          </div>
        )}
      </div>

      {/* Confirmation progress — hide once soft-confirmed */}
      {confirmations && confirmations.required >= 3 && confirmations.current < confirmations.required && (
        <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
          <span className={cn(
            'p-1.5 bg-blue-500/10 rounded-full shrink-0',
            progressPercent < 100 && 'motion-safe:animate-pulse'
          )}>
            <ShieldCheckIcon size={16} className="text-blue-400" />
          </span>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300">
                Protecting against chain reorgs
              </span>
              <span className="font-mono text-blue-400 text-xs">
                {confirmations.current} / {confirmations.required}
              </span>
            </div>
            <div className="w-full h-1 bg-blue-900/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Viral loop CTA */}
      <div className="flex justify-center pt-1">
        <CreateYourOwnCta />
      </div>
    </div>
  )
}
