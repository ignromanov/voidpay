import { formatAmount } from '@/shared/lib/amount-utils'
import { formatDateCompact } from '@/shared/lib/date-time'
import { MagicDustBadge } from '@/shared/ui/magic-dust-badge'
import { NetworkChip } from './NetworkChip'

interface AmountDisplayProps {
  subtotal: string
  magicDust: string
  exactTotal: string
  decimals: number
  currency: string
  networkId: number
  dueAt: number
}

export function AmountDisplay({
  subtotal,
  magicDust,
  exactTotal,
  decimals,
  currency,
  networkId,
  dueAt,
}: AmountDisplayProps) {
  const hasMagicDust = magicDust !== '0'
  const formattedSubtotal = formatAmount(subtotal, decimals)
  const formattedExact = hasMagicDust
    ? formatAmount(exactTotal, decimals, { displayDecimals: decimals, useGrouping: true })
    : null

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pr-12">
        <NetworkChip networkId={networkId} />
        <span className="text-xs text-zinc-500">
          Due {formatDateCompact(dueAt)}
        </span>
      </div>

      <div className="flex min-w-0 items-baseline gap-2">
        <span className="min-w-0 truncate text-2xl font-mono font-bold text-violet-400 sm:text-3xl">
          {formattedSubtotal}
        </span>
        <span className="text-lg text-zinc-500">{currency}</span>
      </div>

      {hasMagicDust ? (
        <MagicDustBadge label="Exact amount" amount={formattedExact!} currency={currency} variant="dark" />
      ) : (
        <p className="text-[9px] font-mono text-amber-500/80">
          Manual verification required
        </p>
      )}
    </div>
  )
}
