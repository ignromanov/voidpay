import { calculateTotalsBigInt, addMagicDust } from '@/shared/lib/amount-utils'
import type { Invoice } from '@/shared/lib/invoice-types'

export interface ComputedAmounts {
  /** Subtotal in atomic units (without Magic Dust) */
  subtotal: string
  /** Magic Dust in atomic units (or '0') */
  magicDust: string
  /** Exact total to send in atomic units (subtotal + magicDust) */
  exactTotal: string
}

/**
 * Compute display amounts from invoice data.
 *
 * Priority:
 * 1. If invoice.total + magicDust exist → derive subtotal by subtraction
 * 2. If invoice.total exists alone → subtotal = total, no dust
 * 3. Fallback → calculate from line items, optionally add magicDust
 */
export function computeAmounts(invoice: Invoice): ComputedAmounts {
  // Case 1: Pre-calculated total with Magic Dust
  if (invoice.total && invoice.magicDust) {
    try {
      const totalBigInt = BigInt(invoice.total)
      const dustBigInt = BigInt(invoice.magicDust)
      const subtotal = totalBigInt - dustBigInt
      if (subtotal < BigInt(0)) {
        console.error('[computeAmounts] Magic Dust exceeds total:', {
          total: invoice.total,
          magicDust: invoice.magicDust,
        })
      }
      return {
        subtotal: (subtotal < BigInt(0) ? BigInt(0) : subtotal).toString(),
        magicDust: invoice.magicDust,
        exactTotal: invoice.total,
      }
    } catch (error) {
      console.error('[computeAmounts] Corrupted total/magicDust:', {
        total: invoice.total,
        magicDust: invoice.magicDust,
        error: error instanceof Error ? error.message : String(error),
      })
      // Fall through to Case 2/3 (recalculate from line items)
    }
  }

  // Case 2: Pre-calculated total without Magic Dust
  if (invoice.total) {
    return {
      subtotal: invoice.total,
      magicDust: '0',
      exactTotal: invoice.total,
    }
  }

  // Case 3: Calculate from line items
  const totals = calculateTotalsBigInt(invoice.items, {
    decimals: invoice.decimals,
    tax: invoice.tax,
    discount: invoice.discount,
  })

  const magicDust = invoice.magicDust || '0'
  const exactTotal = invoice.magicDust
    ? addMagicDust(totals.total, Number(invoice.magicDust))
    : totals.total

  return {
    subtotal: totals.total,
    magicDust,
    exactTotal,
  }
}
