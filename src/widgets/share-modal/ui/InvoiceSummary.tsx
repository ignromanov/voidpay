import type { Invoice } from '@/shared/lib/invoice-types'

const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum',
  42161: 'Arbitrum',
  10: 'Optimism',
  137: 'Polygon',
}

interface InvoiceSummaryProps {
  invoice: Invoice
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const amount = invoice.total
    ? Number(invoice.total) / 10 ** invoice.decimals
    : 0
  const formattedAmount = amount.toLocaleString('en-US')
  const networkName = NETWORK_NAMES[invoice.networkId] ?? `Chain ${invoice.networkId}`

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div>
        <div
          className="text-lg font-extrabold tracking-tight text-zinc-100"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formattedAmount} {invoice.currency}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-400 font-semibold">
            {networkName}
          </span>
          <span>·</span>
          <span>{invoice.invoiceId}</span>
        </div>
      </div>
    </div>
  )
}
