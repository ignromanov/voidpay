/**
 * Build Full Invoice from Draft and Line Items
 *
 * Converts form data (PartialInvoice + LineItems) into a complete Invoice
 * suitable for URL encoding.
 */

import type { Invoice, PartialInvoice, LineItem, InvoiceItem } from '@/shared/lib/invoice-types'

/**
 * Convert LineItems (with id) to InvoiceItems (without id)
 *
 * Strips the id used for React key management, leaving only
 * the data fields needed for the invoice.
 */
function lineItemsToInvoiceItems(lineItems: LineItem[]): InvoiceItem[] {
  return lineItems.map(({ id: _id, ...item }) => item)
}

/**
 * Build a complete Invoice from draft data and line items
 *
 * Combines the partial invoice data from the form with the line items,
 * stripping form-specific fields (tempId) and creating a clean Invoice
 * object ready for URL encoding.
 *
 * @param draft - Partial invoice data from form state
 * @param lineItems - Line items with tempId for form tracking
 * @returns Complete Invoice object
 */
export function buildInvoiceFromDraft(draft: PartialInvoice, lineItems: LineItem[]): Invoice {
  return {
    ...draft,
    items: lineItemsToInvoiceItems(lineItems),
  } as Invoice
}
