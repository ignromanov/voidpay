import type { Invoice } from '@/shared/lib/invoice-types'
import { formatAmount } from '@/shared/lib/amount-utils'
import { getNetworkName } from '@/entities/network'

interface InvoiceSummaryProps {
  invoice: Invoice
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  // Show subtotal (without MagicDust) — the "clean" amount the user set
  let subtotalAtomic: string
  try {
    subtotalAtomic = invoice.total && invoice.magicDust && invoice.magicDust !== '0'
      ? (BigInt(invoice.total) - BigInt(invoice.magicDust)).toString()
      : invoice.total || '0'
  } catch {
    subtotalAtomic = invoice.total || '0'
  }
  const formattedAmount = formatAmount(subtotalAtomic, invoice.decimals)
  const networkName = getNetworkName(invoice.networkId)

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div>
        <div
          className="text-lg font-mono font-extrabold tabular-nums tracking-tight text-zinc-100"
        >
          {formattedAmount} {invoice.currency}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-400 font-semibold">
            {networkName}
          </span>
          <span>·</span>
          <span>{invoice.invoiceId}</span>
        </div>
      </div>
    </div>
  )
}
