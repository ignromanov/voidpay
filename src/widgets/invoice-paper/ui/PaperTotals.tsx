import React from 'react'
import { Totals } from '../lib/calculate-totals'

interface PaperTotalsProps {
  totals: Totals
  currency: string
  taxPercent?: string | undefined
  discountPercent?: string | undefined
  showMagicDust?: boolean
}

export const PaperTotals = React.memo<PaperTotalsProps>(
  ({ totals, currency, taxPercent, discountPercent, showMagicDust = true }) => {
    const formatAmount = (val: number) => {
      return val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }

    return (
      <section className="mt-auto border-t border-zinc-200 pt-8">
        <div className="flex justify-end">
          <div className="w-1/2 space-y-2 md:w-1/3">
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Subtotal</span>
              <span className="font-mono">
                {formatAmount(totals.subtotal)} {currency}
              </span>
            </div>

            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Tax{taxPercent ? ` (${taxPercent})` : ''}</span>
                <span className="font-mono text-red-800">
                  +{formatAmount(totals.taxAmount)} {currency}
                </span>
              </div>
            )}

            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Discount{discountPercent ? ` (${discountPercent})` : ''}</span>
                <span className="font-mono text-emerald-600">
                  -{formatAmount(totals.discountAmount)} {currency}
                </span>
              </div>
            )}

            <div className="my-2 h-px bg-black"></div>

            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold tracking-tight text-black">Total</span>
              <div className="text-right">
                <span className="block font-mono text-2xl font-black tracking-tighter text-violet-600">
                  {formatAmount(totals.total)} {currency}
                </span>
                {showMagicDust && totals.magicDust > 0 && (
                  <div className="mt-1 flex items-center justify-end gap-1.5">
                    <span className="font-mono text-[10px] text-zinc-400">
                      Exact: {totals.total.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
)

PaperTotals.displayName = 'PaperTotals'
