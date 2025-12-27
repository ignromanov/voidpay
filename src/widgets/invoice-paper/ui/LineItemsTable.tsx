import React from 'react'
import { InvoiceSchemaV1 } from '@/entities/invoice'

interface LineItemsTableProps {
  items: InvoiceSchemaV1['it']
  currency: string
}

export const LineItemsTable = React.memo<LineItemsTableProps>(({ items, currency }) => {
  const formatAmount = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return isNaN(num)
      ? '0.00'
      : num.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
  }

  return (
    <section className="flex-1">
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[500px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-zinc-900">
              <th className="w-1/2 py-3 text-xs font-bold tracking-widest text-black uppercase">
                Description
              </th>
              <th className="py-3 text-center text-xs font-bold tracking-widest text-black uppercase">
                Qty
              </th>
              <th className="py-3 text-right text-xs font-bold tracking-widest text-black uppercase">
                Rate
              </th>
              <th className="py-3 text-right text-xs font-bold tracking-widest text-black uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((item, idx) => {
              const qty = typeof item.q === 'string' ? parseFloat(item.q) : item.q
              const rate = parseFloat(item.r)
              const amount = isNaN(qty) || isNaN(rate) ? 0 : qty * rate

              return (
                <tr
                  key={idx}
                  className="group border-b border-zinc-200 transition-colors last:border-0 hover:bg-zinc-50/50"
                >
                  <td className="py-4 font-medium text-zinc-900">{item.d}</td>
                  <td className="py-4 text-center font-mono text-zinc-700">{item.q}</td>
                  <td className="py-4 text-right font-mono text-zinc-700">
                    {formatAmount(item.r)}
                  </td>
                  <td className="py-4 text-right font-mono font-bold text-black">
                    {formatAmount(amount)} {currency}
                  </td>
                </tr>
              )
            })}
            {items.length === 0 && (
              <tr className="border-b border-zinc-100">
                <td colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl text-zinc-200 select-none">📝</div>
                    <span className="text-sm text-zinc-400 italic">No items added yet.</span>
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
