import React, { useMemo } from 'react'
import { cn } from '@/shared/lib/utils'
import { MagicDustBadge } from '@/shared/ui/magic-dust-badge'
import { Totals, hasNonZeroAmount } from '../lib/calculate-totals'

interface TotalsSectionProps {
  /** Calculated totals object (all values are pre-formatted strings) */
  totals: Totals
  /** Currency symbol (e.g., USDC, ETH) */
  currency?: string | undefined
  /** Tax percentage label (e.g., "10%") */
  taxPercent?: string | undefined
  /** Discount percentage label (e.g., "5%") */
  discountPercent?: string | undefined
  /** Whether to show the unique amount (magic dust) */
  showMagicDust?: boolean
}

export const TotalsSection = React.memo<TotalsSectionProps>(
  ({ totals, currency, taxPercent, discountPercent, showMagicDust = true }) => {
    const currencyDisplay = currency || 'TOKEN'
    const currencyClass = currency ? '' : 'text-zinc-300 italic'

    const showTax = useMemo(() => hasNonZeroAmount(totals.taxAmount), [totals.taxAmount])
    const showDiscount = useMemo(() => hasNonZeroAmount(totals.discountAmount), [totals.discountAmount])

    return (
      <div className="ml-auto min-w-0 flex-1 overflow-hidden">
        {/* Grid for consistent alignment: label | amount | currency */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="text-zinc-600">Subtotal</span>
          <span
            className="text-right font-mono text-zinc-600 tabular-nums truncate"
            title={totals.subtotal}
          >
            {totals.subtotal}
          </span>
          <span className={cn('font-mono text-zinc-600 flex-shrink-0', currencyClass)}>{currencyDisplay}</span>

          {showTax && (
            <>
              <span className="text-zinc-600">Tax{taxPercent ? ` (${taxPercent})` : ''}</span>
              <span
                className="text-right font-mono text-red-800 tabular-nums truncate"
                title={`+${totals.taxAmount}`}
                aria-label={`Plus ${totals.taxAmount} ${currencyDisplay} tax`}
              >
                +{totals.taxAmount}
              </span>
              <span className={cn('font-mono text-zinc-600 flex-shrink-0', currencyClass)}>{currencyDisplay}</span>
            </>
          )}

          {showDiscount && (
            <>
              <span className="text-zinc-600">
                Discount{discountPercent ? ` (${discountPercent})` : ''}
              </span>
              <span
                className="text-right font-mono text-emerald-600 tabular-nums truncate"
                title={`-${totals.discountAmount}`}
                aria-label={`Minus ${totals.discountAmount} ${currencyDisplay} discount`}
              >
                -{totals.discountAmount}
              </span>
              <span className={cn('font-mono text-zinc-600 flex-shrink-0', currencyClass)}>{currencyDisplay}</span>
            </>
          )}
        </div>

        <div className="my-2 border-t border-zinc-200" />

        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold tracking-tight text-black flex-shrink-0">Total</span>
          <div className="flex items-baseline gap-1 min-w-0 overflow-hidden">
            <span
              className="font-mono text-2xl font-black tracking-tighter text-violet-600 tabular-nums truncate"
              title={totals.total}
            >
              {totals.total}
            </span>
            <span className={cn('text-sm font-bold text-zinc-600 flex-shrink-0', currencyClass)}>
              {currencyDisplay}
            </span>
          </div>
        </div>

        {showMagicDust && totals.magicDust && (
          <div className="-mt-0.5 flex justify-end">
            <MagicDustBadge label="Unique ID" amount={totals.magicDust} currency={currencyDisplay} variant="light" />
          </div>
        )}
      </div>
    )
  }
)

TotalsSection.displayName = 'TotalsSection'
