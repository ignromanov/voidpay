import { formatAmount } from '@/shared/lib/amount-utils'
import { InfoIcon } from '@/shared/ui/icons'

interface AmountDisplayProps {
  subtotal: string
  magicDust: string
  exactTotal: string
  decimals: number
  currency: string
}

export function AmountDisplay({
  subtotal,
  magicDust,
  exactTotal,
  decimals,
  currency,
}: AmountDisplayProps) {
  const hasMagicDust = magicDust !== '0'
  const formattedSubtotal = formatAmount(subtotal, decimals)
  const formattedExact = hasMagicDust
    ? formatAmount(exactTotal, decimals, { displayDecimals: decimals, useGrouping: true })
    : null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Total Due
      </p>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-mono font-bold text-violet-400">
          {formattedSubtotal}
        </span>
        <span className="text-lg text-zinc-500">{currency}</span>
      </div>

      {hasMagicDust ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-zinc-500">Exact:</span>
          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
            {formattedExact} {currency}
          </span>
          <span className="relative cursor-help group">
            <InfoIcon size={12} className="text-zinc-600" />
            <span
              role="tooltip"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-900 text-zinc-300 text-[10px] font-sans rounded shadow-xl border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-center"
            >
              Magic Dust is a tiny unique amount added for payment matching without a backend.
            </span>
          </span>
        </div>
      ) : (
        <p className="text-[9px] font-mono text-amber-500/80">
          Manual verification required
        </p>
      )}
    </div>
  )
}
