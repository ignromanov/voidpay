import type { Invoice } from '@/entities/invoice'
import { NETWORK_CODES, NETWORK_CODES_REVERSE, type NetworkId } from '@/entities/network'

/**
 * OG Preview data structure for social sharing.
 * Contains minimal, non-sensitive invoice metadata.
 */
export interface OGPreviewData {
  /** Shortened invoice ID (first 8 chars of UUID) */
  id: string
  /** Total amount (formatted with 2 decimal places) */
  amount: string
  /** Currency symbol */
  currency: string
  /** Network short code (eth, arb, op, poly) */
  network: string
  /** Sender name (optional, max 20 chars) */
  from?: string
  /** Due date in MMDD format (optional) */
  due?: string
}

/**
 * Encodes minimal invoice metadata for OG preview.
 * Format: id_amount_currency_network[_from][_due]
 *
 * @param invoice The full invoice data
 * @returns URL-safe string for og query parameter
 *
 * @example
 * ```ts
 * encodeOGPreview(invoice)
 * // => "a1b2c3d4_1250.00_USDC_arb_Acme_1231"
 * ```
 */
export function encodeOGPreview(invoice: Invoice): string {
  const parts: string[] = []

  // 1. Shortened invoice ID (first 8 chars, remove dashes)
  const shortId = invoice.invoiceId.replace(/-/g, '').slice(0, 8)
  parts.push(shortId)

  // 2. Calculate total amount from line items
  const total = calculateTotal(invoice)
  parts.push(total)

  // 3. Currency symbol
  parts.push(invoice.currency)

  // 4. Network short code
  const networkCode = NETWORK_CODES[invoice.networkId as NetworkId] ?? String(invoice.networkId)
  parts.push(networkCode)

  // 5. Sender name (optional, truncate to 20 chars, URL-safe)
  if (invoice.from.name) {
    const safeName = invoice.from.name
      .slice(0, 20)
      .replace(/[_#?&=%]/g, '') // Remove URL-unsafe chars and delimiter
      .trim()
    if (safeName) {
      parts.push(safeName)
    }
  }

  // 6. Due date in MMDD format (optional)
  if (invoice.dueAt) {
    const date = new Date(invoice.dueAt * 1000)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    parts.push(`${mm}${dd}`)
  }

  return parts.join('_')
}

/**
 * Decodes OG preview string back to preview data.
 *
 * @param ogString The og query parameter value
 * @returns Parsed preview data
 */
export function decodeOGPreview(ogString: string): OGPreviewData {
  const parts = ogString.split('_')

  if (parts.length < 4) {
    throw new Error('Invalid OG preview format: minimum 4 parts required')
  }

  const result: OGPreviewData = {
    id: parts[0] ?? '',
    amount: parts[1] ?? '0',
    currency: parts[2] ?? '',
    network: parts[3] ?? '',
  }

  // Optional: sender name (5th part)
  if (parts.length >= 5 && parts[4] && !/^\d{4}$/.test(parts[4])) {
    result.from = parts[4]
  }

  // Optional: due date (5th or 6th part, always 4 digits MMDD)
  const lastPart = parts[parts.length - 1]
  if (lastPart && /^\d{4}$/.test(lastPart)) {
    result.due = lastPart
  }

  return result
}

/**
 * Gets network chain ID from short code.
 */
export function getNetworkIdFromCode(code: string): number | undefined {
  return NETWORK_CODES_REVERSE[code.toLowerCase()]
}

/**
 * Calculates total invoice amount from line items.
 * Returns formatted string with 2 decimal places.
 */
function calculateTotal(invoice: Invoice): string {
  let total = 0

  for (const item of invoice.items) {
    const qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity)
    const rate = parseFloat(item.rate)

    if (!isNaN(qty) && !isNaN(rate)) {
      total += qty * rate
    }
  }

  // Apply tax if present
  if (invoice.tax) {
    const taxValue = parseTaxOrDiscount(invoice.tax, total)
    total += taxValue
  }

  // Apply discount if present
  if (invoice.discount) {
    const discountValue = parseTaxOrDiscount(invoice.discount, total)
    total -= discountValue
  }

  return total.toFixed(2)
}

/**
 * Parses tax/discount string (percentage or fixed amount).
 */
function parseTaxOrDiscount(value: string, base: number): number {
  if (value.endsWith('%')) {
    const percent = parseFloat(value.slice(0, -1))
    return isNaN(percent) ? 0 : (base * percent) / 100
  }
  const fixed = parseFloat(value)
  return isNaN(fixed) ? 0 : fixed
}
