import React from 'react'
import { InvoiceSchemaV1 } from '@/entities/invoice'

interface LineItemsTableProps {
  items: InvoiceSchemaV1['it']
  currency: string
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({ items, currency }) => {
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
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-black">
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
              <tr key={idx} className="group border-b border-zinc-200 last:border-0">
                <td className="py-4 font-medium text-zinc-800">{item.d}</td>
                <td className="py-4 text-center font-mono text-zinc-600">{item.q}</td>
                <td className="py-4 text-right font-mono text-zinc-600">{formatAmount(item.r)}</td>
                <td className="py-4 text-right font-mono font-bold text-black">
                  {formatAmount(amount)} {currency}
                </td>
              </tr>
            )
          })}
          {items.length === 0 && (
            <tr className="border-b border-zinc-100">
              <td colSpan={4} className="py-8 text-center text-zinc-400 italic">
                No items added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}
