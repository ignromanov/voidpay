import React from 'react'
import { PartialItem } from '@/entities/invoice'
import { formatAmount, formatRate } from '../lib/format'

interface LineItemsTableProps {
  items: PartialItem[]
}

export const LineItemsTable = React.memo<LineItemsTableProps>(({ items }) => {
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
            {items.map((item, idx) => {
              const quantity = item.quantity ?? 0
              const qty = typeof quantity === 'string' ? parseFloat(quantity) : quantity
              const rate = parseFloat(item.rate ?? '0')
              const amount = isNaN(qty) || isNaN(rate) ? 0 : qty * rate

              return (
                <tr
                  key={idx}
                  className="group border-b border-zinc-200 transition-colors last:border-0 even:bg-zinc-50/50 hover:bg-zinc-100/50"
                >
                  <td className="py-4 font-mono text-zinc-400">{idx + 1}</td>
                  <td className="py-4 font-medium text-zinc-900">{item.description ?? ''}</td>
                  <td className="py-4 text-center font-mono text-zinc-700">{quantity}</td>
                  <td className="py-4 text-right font-mono text-zinc-700">
                    {formatRate(item.rate ?? '0')}
                  </td>
                  <td className="py-4 text-right font-mono font-bold text-black">
                    {formatAmount(amount)}
                  </td>
                </tr>
              )
            })}
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
