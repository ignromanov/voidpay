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

/**
 * Calculate total amount from invoice data
 *
 * @param invoice - Partial invoice data
 * @param lineItems - Line items with UI ids
 * @returns Total amount as decimal string with currency symbol
 */
export function calculateTotalAmount(invoice: PartialInvoice, lineItems: LineItem[]): string {
  const currency = invoice.currency ?? 'USDC'

  // Calculate subtotal from line items
  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = parseFloat(item.rate) * item.quantity
    return sum + itemTotal
  }, 0)

  // Apply tax
  let total = subtotal
  if (invoice.tax) {
    const taxValue = invoice.tax.endsWith('%')
      ? (subtotal * parseFloat(invoice.tax)) / 100
      : parseFloat(invoice.tax)
    total += taxValue
  }

  // Apply discount
  if (invoice.discount) {
    const discountValue = invoice.discount.endsWith('%')
      ? (subtotal * parseFloat(invoice.discount)) / 100
      : parseFloat(invoice.discount)
    total -= discountValue
  }

  // Format with currency symbol
  return `${total.toFixed(2)} ${currency}`
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
 * This is a convenience function that combines URL generation and history tracking.
 * Replace the URL generation logic with actual implementation.
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
  // TODO: Replace with actual URL generation logic from url-state-codec
  // For now, this is a placeholder
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const invoiceUrl = `${baseUrl}/invoice?draft=${draft.meta.draftId}`

  // Build full invoice and add to history
  const invoice = buildInvoice(draft, lineItems)
  addToHistory(invoice, invoiceUrl)

  return invoiceUrl
}
