import { formatAmount } from '@/shared/lib/amount-utils'
import { MagicDustBadge } from '@/shared/ui/magic-dust-badge'
import { XCircleIcon } from '@/shared/ui/icons'

interface ExpiredStateProps {
  subtotal: string
  magicDust: string
  decimals: number
  currency: string
}

export function ExpiredState({ subtotal, magicDust, decimals, currency }: ExpiredStateProps) {
  const formattedSubtotal = formatAmount(subtotal, decimals)
  const hasMagicDust = magicDust !== '0'
  const formattedExact = hasMagicDust
    ? formatAmount((BigInt(subtotal) + BigInt(magicDust)).toString(), decimals, { displayDecimals: decimals, useGrouping: true })
    : null

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
            {formattedSubtotal}
          </span>
          <span className="text-lg text-zinc-500">{currency}</span>
        </div>
        {hasMagicDust && formattedExact && (
          <div className="mt-1">
            <MagicDustBadge label="Was due" amount={formattedExact} currency={currency} variant="dark" />
          </div>
        )}
      </div>
    </div>
  )
}
