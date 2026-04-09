/**
 * Invoice Generation Helpers
 *
 * Orchestrates invoice URL generation and history tracking.
 * This feature combines entities/invoice (data) with entities/creator (storage).
 */

import {
  lineItemsToInvoiceItems,
  type Invoice,
  type PartialInvoice,
  type DraftState,
  type LineItem,
} from '@/entities/invoice'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { useCreatorStore } from '@/entities/creator'
import { nowISO } from '@/shared/lib/date-time'
import { generateInvoiceUrl, generateSalt, deriveMagicDust, computeContentHash } from '@/features/invoice-codec'
import {
  calculateTotalsBigInt,
  formatAmount,
  addMagicDust,
} from '@/shared/lib/amount-utils'
import type { GenerateOptions } from './types'

// NOTE: History is tracked via TrackedInvoiceStore only (historySlice removed).
// Invoice data is decoded from URL when needed (same as ReceivedInvoiceList pattern).

/**
 * Calculate total amount from invoice data using BigInt precision.
 *
 * Rates are stored as atomic units (e.g., "150000000" = $150.00 for 6 decimals).
 * Uses BigInt arithmetic to avoid floating-point precision issues.
 *
 * @param invoice - Partial invoice data
 * @param lineItems - Line items with UI ids (rates in atomic units)
 * @returns Total amount as formatted string with currency symbol (e.g., "1250.50 USDC")
 */
export function calculateTotalAmount(invoice: PartialInvoice, lineItems: LineItem[]): string {
  const currency = invoice.currency ?? 'USDC'
  const decimals = invoice.decimals ?? 6

  // Map line items for BigInt calculation
  const items = lineItems.map((item) => ({
    quantity: item.quantity,
    rate: item.rate || '0',
  }))

  // Extract tax/discount percentages (strip % suffix if present)
  const tax = invoice.tax?.endsWith('%') ? invoice.tax.slice(0, -1) : invoice.tax
  const discount = invoice.discount?.endsWith('%') ? invoice.discount.slice(0, -1) : invoice.discount

  // Calculate using BigInt arithmetic
  const result = calculateTotalsBigInt(items, { tax, discount, decimals })

  // Format with currency symbol
  return `${formatAmount(result.total, decimals)} ${currency}`
}

/**
 * Add invoice to creation history after URL generation
 *
 * This should be called after successfully generating an invoice URL.
 *
 * @param invoice - Full invoice data
 * @param invoiceUrl - Generated invoice URL
 *
 * @example
 * const url = await generateInvoiceUrl(invoice)
 * addToHistory(invoice, url)
 */
export async function addToHistory(invoice: Invoice, invoiceUrl: string): Promise<void> {
  const hashIndex = invoiceUrl.indexOf('#')
  const fragment = hashIndex === -1 ? '' : invoiceUrl.slice(hashIndex + 1)
  if (!fragment) return
  const contentHash = await computeContentHash(fragment)

  const { addInvoice } = useTrackedInvoiceStore.getState()
  addInvoice({
    contentHash,
    invoiceId: invoice.invoiceId,
    invoiceUrl,
    source: 'created',
    viewedAt: nowISO(),
  })
}

/**
 * Build full Invoice from draft and line items.
 *
 * Calculates total (+ Magic Dust if enabled) and bakes into the invoice.
 * This is the single source of truth — the total is encoded into the URL
 * and available as `invoice.total` after decoding on /pay.
 */
export function buildInvoice(draft: DraftState, lineItems: LineItem[]): { invoice: Invoice; salt?: Uint8Array } {
  const data = draft.data
  const items = lineItemsToInvoiceItems(lineItems)
  const decimals = data.decimals ?? 6

  // Calculate total from items + tax + discount
  const result = calculateTotalsBigInt(
    items.map((item) => ({
      quantity: item.quantity,
      rate: item.rate || '0',
    })),
    { tax: data.tax, discount: data.discount, decimals }
  )

  // Add Magic Dust if enabled in preferences
  const { magicDustEnabled } = useCreatorStore.getState().preferences
  let total = result.total
  let magicDust: string | undefined
  let salt: Uint8Array | undefined

  if (magicDustEnabled) {
    salt = generateSalt()
    const dust = deriveMagicDust(salt)
    magicDust = dust.toString()
    total = addMagicDust(total, dust)
  }

  return {
    invoice: {
      ...data,
      items,
      total,
      magicDust,
    } as Invoice,
    ...(salt !== undefined ? { salt } : {}),
  }
}

/** URL size limit in bytes */
const URL_SIZE_LIMIT = 2000

/**
 * Error thrown when URL exceeds size limit
 */
export class UrlSizeError extends Error {
  constructor(
    public readonly size: number,
    public readonly limit: number = URL_SIZE_LIMIT
  ) {
    super(`Invoice URL is too large (${size} bytes). Maximum allowed is ${limit} bytes. Try reducing notes or line items.`)
    this.name = 'UrlSizeError'
  }
}

/**
 * Generate invoice URL and add to history
 *
 * Combines URL generation and history tracking.
 * Uses TLV v1 encoding for compact, privacy-preserving URLs.
 *
 * @param draft - Draft state with invoice data
 * @param lineItems - Line items for the invoice
 * @param options - Generation options (OG preview, etc.)
 * @returns Object with generated URL and the baked invoice (with total/magicDust)
 * @throws UrlSizeError if URL exceeds 2000 bytes
 *
 * @example
 * const { url, invoice } = await generateAndTrackInvoice(draft, lineItems, { includeOG: true })
 */
export async function generateAndTrackInvoice(
  draft: DraftState,
  lineItems: LineItem[],
  options: GenerateOptions = {}
): Promise<{ url: string; invoice: Invoice }> {
  // Build full invoice from draft and line items (calculates total + magicDust)
  const { invoice, salt } = buildInvoice(draft, lineItems)

  // Generate URL with TLV v1 encoding
  // generateInvoiceUrl throws if URL > 2000 bytes
  let invoiceUrl: string
  try {
    invoiceUrl = await generateInvoiceUrl(invoice, {
      includeOG: options.includeOG ?? false,
      ...(salt !== undefined ? { salt } : {}),
    })
  } catch (error) {
    // Re-throw with user-friendly message
    if (error instanceof Error && error.message.includes('URL size')) {
      const sizeMatch = error.message.match(/\((\d+) bytes\)/)
      const size = sizeMatch?.[1] ? parseInt(sizeMatch[1], 10) : 0
      throw new UrlSizeError(size)
    }
    throw error
  }

  // Add to history for later retrieval
  await addToHistory(invoice, invoiceUrl)

  return { url: invoiceUrl, invoice }
}
