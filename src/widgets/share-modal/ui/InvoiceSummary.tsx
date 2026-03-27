import type { Invoice } from '@/shared/lib/invoice-types'
import { formatAmount } from '@/shared/lib/amount-utils'
import { computeAmounts } from '@/entities/invoice'
import { getNetworkName } from '@/entities/network'

interface InvoiceSummaryProps {
  invoice: Invoice
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const { subtotal } = computeAmounts(invoice)
  const formattedAmount = formatAmount(subtotal, invoice.decimals)
  const networkName = getNetworkName(invoice.networkId)

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-base sm:text-lg font-mono font-extrabold tabular-nums tracking-tight text-zinc-100"
        >
          {formattedAmount} {invoice.currency}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-400 font-semibold">
            {networkName}
          </span>
          <span>·</span>
          <span className="truncate">{invoice.invoiceId}</span>
        </div>
      </div>
    </div>
  )
}
