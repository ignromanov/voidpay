/**
 * Invoice Generation Helpers
 *
 * Utilities for generating invoice URLs and managing creation history.
 */

import type { InvoiceDraft } from '@/entities/invoice/model/types'
import { useCreatorStore } from '@/entities/creator/model/useCreatorStore'

/**
 * Calculate total amount from invoice draft
 *
 * @param draft - Invoice draft
 * @returns Total amount as decimal string with currency symbol
 */
export function calculateTotalAmount(draft: InvoiceDraft): string {
  // Calculate subtotal from line items
  const subtotal = draft.lineItems.reduce((sum, item) => {
    const itemTotal = parseFloat(item.rate) * item.quantity
    return sum + itemTotal
  }, 0)

  // Apply tax rate
  let total = subtotal
  if (draft.taxRate) {
    const taxValue = draft.taxRate.endsWith('%')
      ? (subtotal * parseFloat(draft.taxRate)) / 100
      : parseFloat(draft.taxRate)
    total += taxValue
  }

  // Apply discount
  if (draft.discountAmount) {
    const discountValue = draft.discountAmount.endsWith('%')
      ? (subtotal * parseFloat(draft.discountAmount)) / 100
      : parseFloat(draft.discountAmount)
    total -= discountValue
  }

  // Format with currency symbol
  return `${total.toFixed(2)} ${draft.currencySymbol}`
}

/**
 * Add invoice to creation history after URL generation
 *
 * This should be called after successfully generating an invoice URL.
 *
 * @param draft - Invoice draft that was converted to URL
 * @param invoiceUrl - Generated invoice URL
 *
 * @example
 * const url = await generateInvoiceUrl(draft)
 * addToHistory(draft, url)
 */
export function addToHistory(draft: InvoiceDraft, invoiceUrl: string): void {
  const { addHistoryEntry } = useCreatorStore.getState()

  const totalAmount = calculateTotalAmount(draft)

  addHistoryEntry({
    invoiceId: draft.invoiceId,
    recipientName: draft.recipient.name,
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
 * @param draft - Invoice draft
 * @returns Generated invoice URL
 *
 * @example
 * const url = await generateAndTrackInvoice(draft)
 * router.push(url)
 */
export async function generateAndTrackInvoice(draft: InvoiceDraft): Promise<string> {
  // TODO: Replace with actual URL generation logic from url-state-codec
  // For now, this is a placeholder
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const invoiceUrl = `${baseUrl}/invoice?draft=${draft.draftId}`

  // Add to history
  addToHistory(draft, invoiceUrl)

  return invoiceUrl
}
