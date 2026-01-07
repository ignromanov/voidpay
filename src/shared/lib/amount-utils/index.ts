/**
 * Amount Utilities - BigInt-based calculations for crypto amounts
 *
 * All monetary values are stored as atomic units (strings) to avoid
 * floating-point precision issues. This module provides conversion
 * utilities between human-readable amounts and atomic units.
 *
 * Example (USDC with 6 decimals):
 * - Human: "150.50"
 * - Atomic: "150500000"
 */

import { parseUnits, formatUnits } from 'viem'

/**
 * Converts human-readable amount to atomic units string
 *
 * @param humanAmount - Human readable amount (e.g., "150.50")
 * @param decimals - Token decimals (e.g., 6 for USDC, 18 for ETH)
 * @returns Atomic units as string (e.g., "150500000")
 *
 * @example
 * parseAmount("150.50", 6)  // "150500000"
 * parseAmount("1.5", 18)    // "1500000000000000000"
 * parseAmount("", 6)        // "0"
 */
export function parseAmount(humanAmount: string, decimals: number): string {
  if (!humanAmount || humanAmount === '') {
    return '0'
  }

  // Remove leading/trailing whitespace
  const trimmed = humanAmount.trim()
  if (trimmed === '' || trimmed === '.') {
    return '0'
  }

  try {
    const atomic = parseUnits(trimmed, decimals)
    return atomic.toString()
  } catch {
    // Invalid input - return '0'
    return '0'
  }
}

/**
 * Options for formatAmount
 */
export interface FormatAmountOptions {
  /** Display precision (default: 2) */
  displayDecimals?: number
  /** Use thousand separators for UI (default: true) */
  useGrouping?: boolean
}

/**
 * Converts atomic units to human-readable amount
 *
 * @param atomicAmount - Atomic units as string (e.g., "150500000")
 * @param tokenDecimals - Token decimals (e.g., 6 for USDC)
 * @param options - Formatting options (displayDecimals, useGrouping)
 * @returns Formatted human-readable string (e.g., "150.50")
 *
 * @example
 * formatAmount("150500000", 6)                          // "150.50"
 * formatAmount("150500000", 6, { displayDecimals: 6 })  // "150.500000"
 * formatAmount("1000000000", 6, { useGrouping: false }) // "1000.00" (for URLs)
 * formatAmount("1000000000", 6)                         // "1,000.00" (for UI)
 */
export function formatAmount(
  atomicAmount: string,
  tokenDecimals: number,
  options: FormatAmountOptions | number = {}
): string {
  // Support legacy signature: formatAmount(amount, decimals, displayDecimals)
  const opts: FormatAmountOptions =
    typeof options === 'number' ? { displayDecimals: options } : options

  const displayDecimals = opts.displayDecimals ?? 2
  const useGrouping = opts.useGrouping ?? true

  if (!atomicAmount || atomicAmount === '' || atomicAmount === '0') {
    return '0.00'
  }

  try {
    const human = formatUnits(BigInt(atomicAmount), tokenDecimals)
    const num = parseFloat(human)

    // For very small amounts (like Magic Dust), show more precision
    const effectiveDecimals = Math.max(displayDecimals, countSignificantDecimals(human))

    return num.toLocaleString('en-US', {
      minimumFractionDigits: displayDecimals,
      maximumFractionDigits: Math.min(effectiveDecimals, tokenDecimals),
      useGrouping,
    })
  } catch {
    return '0.00'
  }
}

/**
 * Counts significant decimal places in a string
 * Used to preserve precision for small amounts like Magic Dust
 */
function countSignificantDecimals(value: string): number {
  const parts = value.split('.')
  if (parts.length < 2 || !parts[1]) return 0

  // Count non-zero decimal places
  const decimalPart = parts[1]
  let lastNonZero = 0
  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] !== '0') {
      lastNonZero = i + 1
    }
  }
  return lastNonZero
}

/**
 * Result of BigInt total calculation
 */
export interface BigIntTotals {
  /** Subtotal before tax/discount (atomic units) */
  subtotal: string
  /** Tax amount (atomic units) */
  taxAmount: string
  /** Discount amount (atomic units) */
  discountAmount: string
  /** Final total (atomic units) */
  total: string
  /** Raw BigInt values for further calculations */
  raw: {
    subtotal: bigint
    taxAmount: bigint
    discountAmount: bigint
    total: bigint
  }
}

/**
 * Line item for calculation (rate in atomic units)
 */
export interface LineItemForCalc {
  quantity: number
  rate: string // Atomic units
}

/**
 * Options for total calculation
 */
export interface CalcOptions {
  /** Tax percentage as string (e.g., "10" for 10%) */
  tax?: string | undefined
  /** Discount percentage as string (e.g., "5" for 5%) */
  discount?: string | undefined
  /** Token decimals for quantity scaling */
  decimals: number
}

/**
 * Calculates invoice totals using BigInt arithmetic
 *
 * Uses precise BigInt math to avoid floating-point errors.
 * Quantity is scaled to atomic units before multiplication.
 *
 * @param items - Line items with rate in atomic units
 * @param options - Tax, discount, and decimals configuration
 * @returns Calculated totals in atomic units
 *
 * @example
 * const totals = calculateTotalsBigInt(
 *   [{ quantity: 2, rate: "150000000" }],  // 2 × $150.00
 *   { tax: "10", discount: "5", decimals: 6 }
 * )
 * // subtotal: "300000000" ($300.00)
 * // taxAmount: "30000000" ($30.00)
 * // discountAmount: "15000000" ($15.00)
 * // total: "315000000" ($315.00)
 */
export function calculateTotalsBigInt(
  items: LineItemForCalc[],
  options: CalcOptions
): BigIntTotals {
  const { decimals, tax, discount } = options
  const scale = BigInt(Math.pow(10, decimals))
  const ZERO = BigInt(0)
  const HUNDRED_SQUARED = BigInt(10000)

  // Calculate subtotal: sum of (quantity * rate)
  let subtotal = ZERO
  for (const item of items) {
    const rate = BigInt(item.rate || '0')
    // Scale quantity to atomic units, then multiply by rate, then divide by scale
    // This handles fractional quantities correctly
    const qtyScaled = BigInt(Math.round(item.quantity * Number(scale)))
    const lineTotal = (qtyScaled * rate) / scale
    subtotal = subtotal + lineTotal
  }

  // Calculate tax amount (percentage of subtotal)
  let taxAmount = ZERO
  if (tax && tax !== '0') {
    const taxPercent = parseFloat(tax)
    if (!isNaN(taxPercent) && taxPercent > 0) {
      // Tax = subtotal * (taxPercent / 100)
      // Use integer math: subtotal * taxPercent / 100
      taxAmount = (subtotal * BigInt(Math.round(taxPercent * 100))) / HUNDRED_SQUARED
    }
  }

  // Calculate discount amount (percentage of subtotal)
  let discountAmount = ZERO
  if (discount && discount !== '0') {
    const discountPercent = parseFloat(discount)
    if (!isNaN(discountPercent) && discountPercent > 0) {
      // Discount = subtotal * (discountPercent / 100)
      discountAmount = (subtotal * BigInt(Math.round(discountPercent * 100))) / HUNDRED_SQUARED
    }
  }

  // Final total
  const total = subtotal + taxAmount - discountAmount

  return {
    subtotal: subtotal.toString(),
    taxAmount: taxAmount.toString(),
    discountAmount: discountAmount.toString(),
    total: total.toString(),
    raw: {
      subtotal,
      taxAmount,
      discountAmount,
      total,
    },
  }
}

/**
 * Generates a random Magic Dust amount (1-999 atomic units)
 *
 * Magic Dust is a small random amount added to invoices for
 * unique payment identification without backend.
 *
 * @returns Random number between 1 and 999
 */
export function generateMagicDust(): number {
  return Math.floor(Math.random() * 999) + 1
}

/**
 * Adds Magic Dust to a total
 *
 * @param total - Current total in atomic units
 * @param magicDust - Magic Dust amount (1-999)
 * @returns New total with Magic Dust added
 */
export function addMagicDust(total: string, magicDust: number): string {
  const totalBigInt = BigInt(total || '0')
  const dustBigInt = BigInt(magicDust)
  return (totalBigInt + dustBigInt).toString()
}
