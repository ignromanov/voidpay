import React from 'react'
import { cn } from '@/shared/lib/utils'
import { MagicDustBadge } from '@/shared/ui/magic-dust-badge'
import { Totals } from '../lib/calculate-totals'

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
  /**
   * When true and magicDust is present, renders the merged total (e.g. "250.000042 USDC")
   * with the magic dust fractional digits highlighted in violet (#a78bfa).
   * Hides the separate MagicDustBadge footer line.
   * @default false
   */
  magicDustEmphasis?: boolean
}

const COMMA_RE = /,/g

/**
 * Check if an amount string represents a non-zero value
 * Handles formats like "0.00", "0", "0.000000"
 */
function isNonZero(amount: string | null | undefined): boolean {
  if (!amount) return false
  const num = parseFloat(amount.replace(COMMA_RE, ''))
  return !isNaN(num) && num > 0
}

/**
 * Split a formatted total and magicDust string into base and dust parts.
 * Example: total="250.00", magicDust="0.000042" → { base: "250.", dust: "000042" }
 * Returns null if magicDust is not in expected format.
 */
function splitMagicDustTotal(
  total: string,
  magicDust: string | null
): { base: string; dust: string } | null {
  if (!magicDust) return null
  // magicDust format: "0.000042" — extract digits after "0."
  const dustMatch = magicDust.match(/^0\.(\d+)$/)
  if (!dustMatch || !dustMatch[1]) return null
  const dustDigits: string = dustMatch[1]
  // total format: "250.00" — use integer part only
  const intPart = total.split('.')[0] ?? total
  return { base: `${intPart}.`, dust: dustDigits }
}

export const TotalsSection = React.memo<TotalsSectionProps>(
  ({ totals, currency, taxPercent, discountPercent, showMagicDust = true, magicDustEmphasis = false }) => {
    const currencyDisplay = currency || 'TOKEN'
    const currencyClass = currency ? '' : 'text-zinc-300 italic'

    const splitDust = magicDustEmphasis ? splitMagicDustTotal(totals.total, totals.magicDust) : null

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

          {isNonZero(totals.taxAmount) && (
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

          {isNonZero(totals.discountAmount) && (
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
            {splitDust ? (
              <span
                className="font-mono text-2xl font-black tracking-tighter text-violet-600 tabular-nums truncate"
                title={`${splitDust.base}${splitDust.dust}`}
              >
                {splitDust.base}
                <span className="paper-total-dust">{splitDust.dust}</span>
              </span>
            ) : (
              <span
                className="font-mono text-2xl font-black tracking-tighter text-violet-600 tabular-nums truncate"
                title={totals.total}
              >
                {totals.total}
              </span>
            )}
            <span className={cn('text-sm font-bold text-zinc-600 flex-shrink-0', currencyClass)}>
              {currencyDisplay}
            </span>
          </div>
        </div>

        {showMagicDust && totals.magicDust && !splitDust && (
          <div className="-mt-0.5 flex justify-end">
            <MagicDustBadge label="Unique ID" amount={totals.magicDust} currency={currencyDisplay} variant="light" />
          </div>
        )}
      </div>
    )
  }
)

TotalsSection.displayName = 'TotalsSection'
