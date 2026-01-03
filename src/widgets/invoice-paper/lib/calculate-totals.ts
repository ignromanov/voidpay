/**
 * Calculate invoice totals including subtotal, tax, discount, and Magic Dust.
 */
export interface Totals {
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  magicDust: number
}

interface Item {
  quantity?: string | number
  rate?: string
}

interface Options {
  tax?: string | undefined
  discount?: string | undefined
}

export const MAGIC_DUST = 0.000001

export function calculateTotals(items: Item[], options: Options = {}): Totals {
  const subtotal = items.reduce((acc, item) => {
    const rawQty = item.quantity ?? 0
    const qty = typeof rawQty === 'string' ? parseFloat(rawQty) : rawQty
    const rate = parseFloat(item.rate ?? '0')
    return acc + (isNaN(qty) || isNaN(rate) ? 0 : qty * rate)
  }, 0)

  if (subtotal === 0) {
    return {
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0,
      magicDust: 0,
    }
  }

  const taxAmount = calculateAdjustment(subtotal, options.tax)
  const discountAmount = calculateAdjustment(subtotal, options.discount)

  const totalBeforeDust = subtotal + taxAmount - discountAmount
  const total = totalBeforeDust + MAGIC_DUST

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total,
    magicDust: MAGIC_DUST,
  }
}

function calculateAdjustment(base: number, adjustment?: string): number {
  if (!adjustment) return 0

  if (adjustment.endsWith('%')) {
    const percentage = parseFloat(adjustment.slice(0, -1))
    return isNaN(percentage) ? 0 : (base * percentage) / 100
  }

  const amount = parseFloat(adjustment)
  return isNaN(amount) ? 0 : amount
}
