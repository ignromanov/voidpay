/**
 * Duplicate Invoice from URL
 *
 * Decodes invoice from URL, converts items to line items,
 * resets dates, and sets as active draft in CreatorStore.
 */

import { v4 as uuidv4 } from 'uuid'
import { useCreatorStore } from '@/entities/creator'
import { invoiceItemsToLineItems, type DraftState } from '@/entities/invoice'
import { parseInvoiceHash } from '@/features/invoice-codec'
import { nowUnix, daysFromNowUnix } from '@/shared/lib/date-time'

/**
 * Create default line item (fallback when invoice has no items)
 */
function createDefaultLineItem() {
  return {
    id: uuidv4(),
    description: '',
    quantity: 1,
    rate: '0',
  }
}

/**
 * Decode invoice from URL and set as new draft in CreatorStore.
 *
 * @param invoiceUrl - Full invoice URL with hash fragment
 * @returns Draft ID if successful, null if decode failed
 */
export async function duplicateFromUrl(invoiceUrl: string): Promise<string | null> {
  let hash: string
  try {
    hash = new URL(invoiceUrl).hash.slice(1)
  } catch {
    return null
  }

  const result = await parseInvoiceHash(hash)
  if (!result.success) {
    return null
  }

  const invoice = result.data
  const draftId = uuidv4()

  const newDraft: DraftState = {
    meta: {
      draftId,
      lastModified: new Date().toISOString(),
    },
    data: {
      ...invoice,
      // Reset dates for new invoice
      issuedAt: nowUnix(),
      dueAt: daysFromNowUnix(30),
    },
  }

  // Convert invoice items to line items with IDs
  const restoredLineItems = invoice.items?.length
    ? invoiceItemsToLineItems(invoice.items)
    : [createDefaultLineItem()]

  useCreatorStore.setState({
    activeDraft: newDraft,
    lineItems: restoredLineItems,
  })

  return draftId
}
