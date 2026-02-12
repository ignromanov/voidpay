import { formatAmount } from '@/shared/lib/amount-utils'

import { CheckIcon, ShieldCheckIcon } from '@/shared/ui/icons'
import { motion } from '@/shared/ui/motion'
import type { ConfirmationProgress } from '../types'

interface PaidConfirmationProps {
  amount: string
  decimals: number
  currency: string
  confirmations?: ConfirmationProgress | undefined
}

export function PaidConfirmation({
  amount,
  decimals,
  currency,
  confirmations,
}: PaidConfirmationProps) {
  const formattedAmount = formatAmount(amount, decimals)
  const progressPercent = confirmations
    ? Math.min((confirmations.current / confirmations.required) * 100, 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] text-emerald-500"
        >
          <CheckIcon size={24} strokeWidth={3} />
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-emerald-400">
            Payment Successful
          </h3>
          <p className="text-xs text-zinc-500">
            Funds have been sent on-chain
          </p>
        </div>
      </div>

      {/* Amount accent */}
      <div className="py-2 pl-2 border-l-2 border-emerald-500/30 bg-emerald-500/5 rounded-r-lg">
        <div className="flex items-baseline gap-2 pl-2">
          <span className="text-4xl font-black font-mono tracking-tight text-white">
            {formattedAmount}
          </span>
          <span className="text-xl text-emerald-400/80">{currency}</span>
        </div>
      </div>

      {/* Confirmation progress */}
      {confirmations && (
        <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
          <span className="p-1.5 bg-blue-500/10 rounded-full shrink-0 animate-pulse">
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
    </div>
  )
}
