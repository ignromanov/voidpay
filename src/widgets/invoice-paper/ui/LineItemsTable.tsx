import React, { useMemo } from 'react'
import { PartialItem } from '@/entities/invoice'
import { formatAmount } from '@/shared/lib/amount-utils'

interface LineItemsTableProps {
  items: PartialItem[]
  /** Token decimals for formatting atomic units (default: 6 for USDC) */
  decimals?: number
}

/**
 * Calculate line total using BigInt arithmetic
 */
function calculateLineTotal(quantity: number, rate: string, decimals: number): string {
  try {
    const ZERO = BigInt(0)
    const scale = BigInt(Math.pow(10, decimals))

    const rateBigInt = BigInt(rate || '0')
    if (rateBigInt === ZERO) return '0'

    // Handle invalid quantity (NaN from parseFloat)
    if (isNaN(quantity)) return '0'

    // Scale quantity to atomic units, multiply by rate, divide by scale
    const qtyScaled = BigInt(Math.round(quantity * Number(scale)))
    const total = (qtyScaled * rateBigInt) / scale

    return total.toString()
  } catch {
    // Return '0' for any BigInt conversion errors (invalid rate format)
    return '0'
  }
}

export const LineItemsTable = React.memo<LineItemsTableProps>(({ items, decimals = 6 }) => {
  // Pre-calculate all line totals
  const itemsWithTotals = useMemo(() => {
    return items.map((item) => {
      const quantity = item.quantity ?? 0
      const qty = typeof quantity === 'string' ? parseFloat(quantity) : quantity
      const lineTotal = calculateLineTotal(qty, item.rate ?? '0', decimals)

      return {
        ...item,
        qty,
        lineTotal,
        formattedRate: formatAmount(item.rate ?? '0', decimals),
        formattedTotal: formatAmount(lineTotal, decimals),
      }
    })
  }, [items, decimals])

  return (
    <section className="flex-1">
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[500px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-zinc-700">
              <th className="w-8 py-3 text-xs font-bold tracking-widest text-black uppercase">#</th>
              <th className="w-1/2 py-3 text-xs font-bold tracking-widest text-black uppercase">
                Description
              </th>
              <th className="py-3 text-center text-xs font-bold tracking-widest text-black uppercase">
                Qty
              </th>
              <th className="py-3 text-right text-xs font-bold tracking-widest text-black uppercase">
                Rate (per unit)
              </th>
              <th className="py-3 text-right text-xs font-bold tracking-widest text-black uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {itemsWithTotals.map((item, idx) => (
              <tr
                key={idx}
                className="group border-b border-zinc-200 transition-colors last:border-0 even:bg-zinc-50/50 hover:bg-zinc-100/50 print:even:bg-transparent print:hover:bg-transparent"
              >
                <td className="py-4 font-mono text-zinc-400">{idx + 1}</td>
                <td className="py-4 font-medium text-zinc-900">{item.description ?? ''}</td>
                <td className="py-4 text-center font-mono text-zinc-700">{item.qty}</td>
                <td className="py-4 text-right font-mono text-zinc-700">{item.formattedRate}</td>
                <td className="py-4 text-right font-mono font-bold text-black">
                  {item.formattedTotal}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12">
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-8">
                    <span className="text-sm text-zinc-400">No line items</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
})

LineItemsTable.displayName = 'LineItemsTable'
