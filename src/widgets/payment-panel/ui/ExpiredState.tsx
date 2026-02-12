import { formatAmount } from '@/shared/lib/amount-utils'
import { XCircleIcon } from '@/shared/ui/icons'

interface ExpiredStateProps {
  amount: string
  decimals: number
  currency: string
}

export function ExpiredState({ amount, decimals, currency }: ExpiredStateProps) {
  const formattedAmount = formatAmount(amount, decimals)

  return (
    <div className="space-y-4">
      {/* Expired icon + message */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
          <XCircleIcon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-red-400">
            This invoice has expired
          </p>
          <p className="text-xs text-zinc-500">
            Payment actions are disabled
          </p>
        </div>
      </div>

      {/* Muted amount */}
      <div className="opacity-50">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-mono font-bold text-violet-400">
            {formattedAmount}
          </span>
          <span className="text-lg text-zinc-500">{currency}</span>
        </div>
      </div>
    </div>
  )
}
