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
  /** Total in atomic units (bigint string, e.g., "315000000") for QR code URI */
  atomicTotal: string
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
    try {
      BigInt(preTotal) // validate: must be integer string
      if (preMagicDust) BigInt(preMagicDust)

      // Calculate breakdown for display (subtotal, tax, discount)
      const breakdown = calculateBreakdown(items, decimals, tax, discount)

      // Display total = composite minus dust (users see clean amount)
      const displayTotal = preMagicDust
        ? (BigInt(preTotal) - BigInt(preMagicDust)).toString()
        : preTotal

      return {
        subtotal: breakdown.subtotal,
        taxAmount: breakdown.taxAmount,
        discountAmount: breakdown.discountAmount,
        total: formatAmount(displayTotal, decimals),
        magicDust: preMagicDust ? formatAmount(preMagicDust, decimals, 6) : null,
        atomicTotal: preTotal,
      }
    } catch {
      // Invalid pre-calculated total — fall through to local calculation
    }
  }

  // Fallback: calculate totals locally (drafts + old links without pre-calculated total)
  const result = calculateTotalsBigInt(
    items.map((item) => ({
      quantity: parseQuantity(item.quantity),
      rate: item.rate || '0',
    })),
    { tax, discount, decimals }
  )

  // Draft with Magic Dust: dust exists in data but total was not pre-baked
  const atomicTotal = preMagicDust
    ? (BigInt(result.total) + BigInt(preMagicDust)).toString()
    : result.total

  return {
    subtotal: formatAmount(result.subtotal, decimals),
    taxAmount: formatAmount(result.taxAmount, decimals),
    discountAmount: formatAmount(result.discountAmount, decimals),
    total: formatAmount(result.total, decimals),
    magicDust: preMagicDust ? formatAmount(preMagicDust, decimals, 6) : null,
    atomicTotal,
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

// ---------------------------------------------------------------------------
// Display helpers (used by TotalsSection)
// ---------------------------------------------------------------------------

const COMMA_RE = /,/g

/**
 * Returns true if an amount string represents a non-zero value.
 * Handles formats like "0.00", "0", "0.000000".
 */
export function hasNonZeroAmount(amount: string | null | undefined): boolean {
  if (!amount) return false
  const num = parseFloat(amount.replace(COMMA_RE, ''))
  return !isNaN(num) && num > 0
}

/**
 * Split a formatted total and magicDust string into base and dust parts.
 * Example: total="250.00", magicDust="0.000042" → { base: "250.", dust: "000042" }
 * Returns null if magicDust is not present or not in expected "0.XXXXXX" format.
 */
export function splitMagicDustTotal(
  total: string,
  magicDust: string | null
): { base: string; dust: string } | null {
  if (!magicDust) return null
  const dustMatch = magicDust.match(/^0\.(\d+)$/)
  if (!dustMatch || !dustMatch[1]) return null
  const dustDigits: string = dustMatch[1]
  const intPart = total.split('.')[0] ?? total
  return { base: `${intPart}.`, dust: dustDigits }
}
