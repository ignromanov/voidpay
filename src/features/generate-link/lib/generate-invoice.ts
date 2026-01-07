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
import { useCreatorStore } from '@/entities/creator'
import { calculateTotalsBigInt, formatAmount } from '@/shared/lib/amount-utils'

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
export function addToHistory(invoice: Invoice, invoiceUrl: string): void {
  const { addHistoryEntry } = useCreatorStore.getState()

  addHistoryEntry({
    invoice,
    invoiceUrl,
  })
}

/**
 * Build full Invoice from draft and line items
 */
export function buildInvoice(draft: DraftState, lineItems: LineItem[]): Invoice {
  return {
    ...draft.data,
    items: lineItemsToInvoiceItems(lineItems),
  } as Invoice
}

/**
 * Generate invoice URL and add to history
 *
 * Combines URL generation and history tracking.
 *
 * @param draft - Draft state with invoice data
 * @param lineItems - Line items for the invoice
 * @returns Generated invoice URL
 *
 * @example
 * const url = await generateAndTrackInvoice(draft, lineItems)
 * router.push(url)
 */
export async function generateAndTrackInvoice(
  draft: DraftState,
  lineItems: LineItem[]
): Promise<string> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const invoiceUrl = `${baseUrl}/invoice?draft=${draft.meta.draftId}`

  // Build full invoice and add to history
  const invoice = buildInvoice(draft, lineItems)
  addToHistory(invoice, invoiceUrl)

  return invoiceUrl
}
