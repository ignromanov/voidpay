import { formatAmount, calculateTotalsBigInt } from '@/shared/lib/amount-utils'

import type { PartialInvoice } from '@/shared/lib/invoice-types'

export interface FormattedTotals {
  subtotal: string
  taxAmount: string
  discountAmount: string
  total: string
  magicDust: string | null
}

/** Total minus magic dust — the amount users see (not the exact payment amount) */
export function getDisplayTotal(total: string, magicDust?: string): string {
  return magicDust ? (BigInt(total) - BigInt(magicDust)).toString() : total
}

export function computeTotals(data: PartialInvoice, decimals: number): FormattedTotals {
  const items = (data.items ?? []) as Array<{ quantity?: number; rate?: string }>
  const mappedItems = items.map((item) => ({ quantity: item.quantity ?? 0, rate: item.rate ?? '0' }))
  const result = calculateTotalsBigInt(mappedItems, { tax: data.tax, discount: data.discount, decimals })

  const displayTotal = data.total
    ? getDisplayTotal(data.total, data.magicDust)
    : result.total

  return {
    subtotal: formatAmount(result.subtotal, decimals),
    taxAmount: formatAmount(result.taxAmount, decimals),
    discountAmount: formatAmount(result.discountAmount, decimals),
    total: formatAmount(displayTotal, decimals),
    magicDust: data.magicDust ? formatAmount(data.magicDust, decimals, { displayDecimals: 6 }) : null,
  }
}
