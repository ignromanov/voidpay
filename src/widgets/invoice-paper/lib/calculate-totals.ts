/**
 * Calculate invoice totals using BigInt arithmetic for precision.
 *
 * All monetary values are handled as atomic units (strings) internally,
 * and returned as formatted human-readable strings.
 */

import { formatAmount, calculateTotalsBigInt } from '@/shared/lib/amount-utils'

/**
 * Totals returned for display (all formatted strings)
 */
export interface Totals {
  /** Formatted subtotal (e.g., "300.00") */
  subtotal: string
  /** Formatted tax amount (e.g., "30.00") */
  taxAmount: string
  /** Formatted discount amount (e.g., "15.00") */
  discountAmount: string
  /** Formatted total (e.g., "315.00") */
  total: string
  /** Formatted Magic Dust amount (e.g., "0.000042") or null if not present */
  magicDust: string | null
}

/**
 * Raw totals in atomic units for internal calculations
 */
export interface RawTotals {
  subtotal: string
  taxAmount: string
  discountAmount: string
  total: string
  magicDust: string | null
}

interface Item {
  quantity?: string | number
  rate?: string // Atomic units
}

interface InvoiceData {
  items: Item[]
  tax?: string | undefined // Percentage (e.g., "10")
  discount?: string | undefined // Percentage (e.g., "5")
  decimals: number
  /** Pre-calculated total from URL (atomic units) */
  total?: string | undefined
  /** Pre-calculated Magic Dust from URL (atomic units) */
  magicDust?: string | undefined
}

/**
 * Calculate invoice totals with BigInt precision
 *
 * If invoice has pre-calculated total/magicDust (from URL), use those
 * for consistency. Otherwise, calculate locally (fallback for old links).
 *
 * @param data - Invoice data with items, tax, discount, and decimals
 * @returns Formatted totals for display
 */
export function calculateTotals(data: InvoiceData): Totals {
  const { items, tax, discount, decimals, total: preTotal, magicDust: preMagicDust } = data

  // If total is pre-calculated in URL, use it for consistency
  if (preTotal) {
    // Calculate breakdown for display (subtotal, tax, discount)
    const breakdown = calculateBreakdown(items, decimals, tax, discount)

    return {
      subtotal: breakdown.subtotal,
      taxAmount: breakdown.taxAmount,
      discountAmount: breakdown.discountAmount,
      total: formatAmount(preTotal, decimals),
      magicDust: preMagicDust ? formatAmount(preMagicDust, decimals, 6) : null,
    }
  }

  // Fallback: calculate totals locally (for old links without pre-calculated total)
  const result = calculateTotalsBigInt(
    items.map((item) => ({
      quantity: parseQuantity(item.quantity),
      rate: item.rate || '0',
    })),
    { tax, discount, decimals }
  )

  // No Magic Dust for old links (they didn't have this feature)
  return {
    subtotal: formatAmount(result.subtotal, decimals),
    taxAmount: formatAmount(result.taxAmount, decimals),
    discountAmount: formatAmount(result.discountAmount, decimals),
    total: formatAmount(result.total, decimals),
    magicDust: null,
  }
}

/**
 * Calculate raw totals in atomic units
 *
 * Use this when you need atomic units for further calculations,
 * e.g., when generating invoice URL.
 */
export function calculateRawTotals(data: InvoiceData): RawTotals {
  const { items, tax, discount, decimals, total: preTotal, magicDust: preMagicDust } = data

  // If total is pre-calculated, return it
  if (preTotal) {
    const result = calculateTotalsBigInt(
      items.map((item) => ({
        quantity: parseQuantity(item.quantity),
        rate: item.rate || '0',
      })),
      { tax, discount, decimals }
    )

    return {
      subtotal: result.subtotal,
      taxAmount: result.taxAmount,
      discountAmount: result.discountAmount,
      total: preTotal,
      magicDust: preMagicDust || null,
    }
  }

  // Calculate fresh
  const result = calculateTotalsBigInt(
    items.map((item) => ({
      quantity: parseQuantity(item.quantity),
      rate: item.rate || '0',
    })),
    { tax, discount, decimals }
  )

  return {
    subtotal: result.subtotal,
    taxAmount: result.taxAmount,
    discountAmount: result.discountAmount,
    total: result.total,
    magicDust: null,
  }
}

/**
 * Calculate breakdown (subtotal, tax, discount) for display
 */
function calculateBreakdown(
  items: Item[],
  decimals: number,
  tax?: string,
  discount?: string
): { subtotal: string; taxAmount: string; discountAmount: string } {
  const result = calculateTotalsBigInt(
    items.map((item) => ({
      quantity: parseQuantity(item.quantity),
      rate: item.rate || '0',
    })),
    { tax, discount, decimals }
  )

  return {
    subtotal: formatAmount(result.subtotal, decimals),
    taxAmount: formatAmount(result.taxAmount, decimals),
    discountAmount: formatAmount(result.discountAmount, decimals),
  }
}

/**
 * Parse quantity from string or number
 */
function parseQuantity(qty: string | number | undefined): number {
  if (qty === undefined) return 0
  if (typeof qty === 'number') return qty
  const parsed = parseFloat(qty)
  return isNaN(parsed) ? 0 : parsed
}
