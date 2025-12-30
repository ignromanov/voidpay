/**
 * Invoice Generation Helpers
 *
 * Orchestrates invoice URL generation and history tracking.
 * This feature combines entities/invoice (data) with entities/creator (storage).
 */

import type { Invoice, DraftState, LineItem } from '@/entities/invoice'
import { useCreatorStore } from '@/entities/creator'

/**
 * Calculate total amount from invoice data
 *
 * @param invoice - Partial invoice data
 * @param lineItems - Line items with UI ids
 * @returns Total amount as decimal string with currency symbol
 */
export function calculateTotalAmount(invoice: Partial<Invoice>, lineItems: LineItem[]): string {
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
 * @param draft - Draft state with invoice data
 * @param lineItems - Line items for total calculation
 * @param invoiceUrl - Generated invoice URL
 *
 * @example
 * const url = await generateInvoiceUrl(draft)
 * addToHistory(draft, lineItems, url)
 */
export function addToHistory(draft: DraftState, lineItems: LineItem[], invoiceUrl: string): void {
  const { addHistoryEntry } = useCreatorStore.getState()

  const totalAmount = calculateTotalAmount(draft.data, lineItems)
  const invoiceId = draft.data.invoiceId ?? ''
  const recipientName = draft.data.client?.name ?? ''

  addHistoryEntry({
    invoiceId,
    recipientName,
    totalAmount,
    invoiceUrl,
  })
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

  // Add to history
  addToHistory(draft, lineItems, invoiceUrl)

  return invoiceUrl
}
