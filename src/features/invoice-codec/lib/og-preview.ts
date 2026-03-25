import type { Invoice } from '@/entities/invoice'
import { NETWORK_CODES, NETWORK_CODES_REVERSE, type NetworkId } from '@/entities/network'
import { calculateTotalsBigInt, formatAmount } from '@/shared/lib/amount-utils'

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
  /** Recipient name (optional, max 20 chars) */
  to?: string
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
  //    Spaces encoded as ~ (tilde) to preserve hyphens in names like "Smith-Johnson"
  if (invoice.from.name) {
    const safeName = sanitizeOGName(invoice.from.name)
    if (safeName) {
      parts.push(safeName)

      // 5b. Recipient name (optional, only if from was encoded)
      if (invoice.client.name) {
        const safeToName = sanitizeOGName(invoice.client.name)
        if (safeToName) {
          parts.push(safeToName)
        }
      }
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

  // Parse optional trailing parts: [from[_to]][_due]
  // Due is always 4 digits (MMDD), distinguishable from name fields.
  const extra = parts.slice(4)

  if (extra.length === 1) {
    // 5 parts: if 4 digits → due, else → from
    if (/^\d{4}$/.test(extra[0]!)) {
      result.due = extra[0]!
    } else {
      result.from = restoreOGName(extra[0]!)
    }
  } else if (extra.length === 2) {
    // 6 parts: if last is 4 digits → from + due, else → from + to
    if (/^\d{4}$/.test(extra[1]!)) {
      result.from = restoreOGName(extra[0]!)
      result.due = extra[1]!
    } else {
      result.from = restoreOGName(extra[0]!)
      result.to = restoreOGName(extra[1]!)
    }
  } else if (extra.length >= 3) {
    // 7+ parts: from + to + due (last 4 digits)
    result.from = restoreOGName(extra[0]!)
    result.to = restoreOGName(extra[1]!)
    const lastPart = extra[extra.length - 1]
    if (lastPart && /^\d{4}$/.test(lastPart)) {
      result.due = lastPart
    }
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
 * Sanitize a name for OG URL encoding.
 * Spaces → ~ (tilde, URL-safe, preserves hyphens in names like "Smith-Johnson").
 * Only alphanumeric, hyphens, and tildes allowed.
 */
function sanitizeOGName(name: string): string {
  return name
    .slice(0, 20)
    .replace(/[\s_]+/g, '~')          // Spaces and underscores → ~ (both are word separators)
    .replace(/[^a-zA-Z0-9~-]/g, '')   // Allowlist: alphanumeric, ~, -
    .replace(/~+/g, '~')              // Collapse multiple tildes
    .replace(/^[~-]+|[~-]+$/g, '')    // Trim leading/trailing separators
}

/** Restore ~ back to spaces in decoded OG name */
function restoreOGName(encoded: string): string {
  return encoded.replace(/~/g, ' ')
}

/**
 * Calculates total invoice amount from line items using BigInt precision.
 * Returns formatted string with 2 decimal places.
 *
 * Rates are stored as atomic units (e.g., "150000000" = $150.00 for 6 decimals).
 * Uses BigInt arithmetic to avoid floating-point precision issues.
 */
function calculateTotal(invoice: Invoice): string {
  const decimals = invoice.decimals ?? 6

  // OG preview URLs should NOT use thousand separators (avoid URL parsing issues)
  const formatOpts = { useGrouping: false }

  // Use pre-calculated total if available, but subtract MagicDust
  // OG preview should show the "clean" amount the user set, not the MagicDust-enhanced one
  if (invoice.total) {
    if (invoice.magicDust && invoice.magicDust !== '0') {
      const subtotal = (BigInt(invoice.total) - BigInt(invoice.magicDust)).toString()
      return formatAmount(subtotal, decimals, formatOpts)
    }
    return formatAmount(invoice.total, decimals, formatOpts)
  }

  // Calculate using BigInt arithmetic
  const items = invoice.items.map((item) => ({
    quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0,
    rate: item.rate || '0',
  }))

  // Extract tax/discount percentages (strip % suffix if present)
  const tax = invoice.tax?.endsWith('%') ? invoice.tax.slice(0, -1) : invoice.tax
  const discount = invoice.discount?.endsWith('%') ? invoice.discount.slice(0, -1) : invoice.discount

  const result = calculateTotalsBigInt(items, { tax, discount, decimals })

  return formatAmount(result.total, decimals, formatOpts)
}
