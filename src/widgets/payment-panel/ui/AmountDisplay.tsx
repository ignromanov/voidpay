import { formatAmount } from '@/shared/lib/amount-utils'
import { MagicDustBadge } from '@/shared/ui/magic-dust-badge'
import { NetworkChip } from './NetworkChip'

interface AmountDisplayProps {
  subtotal: string
  magicDust: string
  exactTotal: string
  decimals: number
  currency: string
  networkId: number
}

export function AmountDisplay({
  subtotal,
  magicDust,
  exactTotal,
  decimals,
  currency,
  networkId,
}: AmountDisplayProps) {
  const hasMagicDust = magicDust !== '0'
  const formattedSubtotal = formatAmount(subtotal, decimals)
  const formattedExact = hasMagicDust
    ? formatAmount(exactTotal, decimals, { displayDecimals: decimals, useGrouping: true })
    : null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 pr-12">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Total Due
        </p>
        <NetworkChip networkId={networkId} />
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
