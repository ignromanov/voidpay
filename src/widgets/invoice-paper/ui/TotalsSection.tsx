import React from 'react'
import { Totals } from '../lib/calculate-totals'
import { formatAmount } from '../lib/format'

interface TotalsSectionProps {
  /** Calculated totals object */
  totals: Totals
  /** Currency symbol (e.g., USDC, ETH) */
  currency: string
  /** Tax percentage label (e.g., "10%") */
  taxPercent?: string | undefined
  /** Discount percentage label (e.g., "5%") */
  discountPercent?: string | undefined
  /** Whether to show the unique amount (magic dust) */
  showMagicDust?: boolean
}

export const TotalsSection = React.memo<TotalsSectionProps>(
  ({ totals, currency, taxPercent, discountPercent, showMagicDust = true }) => {
    return (
      <div className="ml-auto flex-shrink-0">
        {/* Grid for consistent alignment: label | amount | currency */}
        <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="text-zinc-600">Subtotal</span>
          <span className="text-right font-mono text-zinc-600 tabular-nums">
            {formatAmount(totals.subtotal)}
          </span>
          <span className="font-mono text-zinc-600">{currency}</span>

          {totals.taxAmount > 0 && (
            <>
              <span className="text-zinc-600">Tax{taxPercent ? ` (${taxPercent})` : ''}</span>
              <span
                className="text-right font-mono text-red-800 tabular-nums"
                aria-label={`Plus ${formatAmount(totals.taxAmount)} ${currency} tax`}
              >
                +{formatAmount(totals.taxAmount)}
              </span>
              <span className="font-mono text-red-800">{currency}</span>
            </>
          )}

          {totals.discountAmount > 0 && (
            <>
              <span className="text-zinc-600">
                Discount{discountPercent ? ` (${discountPercent})` : ''}
              </span>
              <span
                className="text-right font-mono text-emerald-600 tabular-nums"
                aria-label={`Minus ${formatAmount(totals.discountAmount)} ${currency} discount`}
              >
                -{formatAmount(totals.discountAmount)}
              </span>
              <span className="font-mono text-emerald-600">{currency}</span>
            </>
          )}
        </div>

        <div className="my-2 border-t border-zinc-200" />

        <div className="flex items-baseline justify-between gap-4">
          <span className="text-lg font-bold tracking-tight text-black">Total</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black tracking-tighter text-violet-600 tabular-nums">
              {formatAmount(totals.total)}
            </span>
            <span className="text-base font-bold text-violet-500">{currency}</span>
          </div>
        </div>

        {showMagicDust && totals.magicDust > 0 && (
          <div
            className="-mt-0.5 text-right"
            title="Unique micro-amount for payment identification"
          >
            <span className="text-[9px] text-zinc-400">Unique Amount: </span>
            <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
              {totals.total.toFixed(6)}
            </span>
          </div>
        )}
      </div>
    )
  }
)

TotalsSection.displayName = 'TotalsSection'
