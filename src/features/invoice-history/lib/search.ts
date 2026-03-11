/**
 * Search and Filter Utilities for Invoice History
 *
 * Client-side search functionality for tracked invoices with decoded data.
 */

import {
  formatInvoiceTotal,
  computeInvoiceStatus,
  type TrackedInvoice,
  type Invoice,
} from '@/entities/invoice'

/** Entry combining tracked invoice with decoded invoice data */
export interface DecodedHistoryEntry {
  tracked: TrackedInvoice
  invoice: Invoice | null
}

/**
 * Search history entries by query string
 *
 * Searches across: invoiceId, client name, total amount
 *
 * @param entries - Array of decoded history entries
 * @param query - Search query (case-insensitive)
 * @returns Filtered array of matching entries
 */
export function searchHistory(
  entries: DecodedHistoryEntry[],
  query: string
): DecodedHistoryEntry[] {
  if (!query.trim()) {
    return entries
  }

  const normalizedQuery = query.toLowerCase().trim()

  return entries.filter(({ tracked, invoice }) => {
    const searchableText = [
      tracked.invoiceId,
      invoice?.client?.name ?? '',
      invoice ? formatInvoiceTotal(invoice) : '',
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedQuery)
  })
}

/**
 * Filter history entries by date range
 *
 * @param entries - Array of decoded history entries
 * @param startDate - Start date (ISO 8601)
 * @param endDate - End date (ISO 8601)
 * @returns Filtered array of entries within date range
 */
export function filterHistoryByDateRange(
  entries: DecodedHistoryEntry[],
  startDate?: string,
  endDate?: string
): DecodedHistoryEntry[] {
  return entries.filter(({ tracked }) => {
    const entryDate = new Date(tracked.createdAt)

    if (startDate && entryDate < new Date(startDate)) {
      return false
    }

    if (endDate && entryDate > new Date(endDate)) {
      return false
    }

    return true
  })
}

/**
 * Filter history entries by payment status
 *
 * Uses computeInvoiceStatus for consistent status derivation.
 *
 * @param entries - Array of decoded history entries
 * @param status - 'paid' | 'unpaid' | 'all'
 * @returns Filtered array based on payment status
 */
export function filterHistoryByPaymentStatus(
  entries: DecodedHistoryEntry[],
  status: 'paid' | 'unpaid' | 'all'
): DecodedHistoryEntry[] {
  if (status === 'all') {
    return entries
  }

  return entries.filter(({ tracked, invoice }) => {
    const invoiceStatus = computeInvoiceStatus({
      tracked,
      dueAt: invoice?.dueAt,
    })
    const isPaid = invoiceStatus === 'paid'
    return status === 'paid' ? isPaid : !isPaid
  })
}

/**
 * Sort history entries
 *
 * @param entries - Array of decoded history entries
 * @param sortBy - Sort field
 * @param order - Sort order ('asc' | 'desc')
 * @returns Sorted array
 */
export function sortHistory(
  entries: DecodedHistoryEntry[],
  sortBy: 'date' | 'amount' | 'invoiceId',
  order: 'asc' | 'desc' = 'desc'
): DecodedHistoryEntry[] {
  const sorted = [...entries].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.tracked.createdAt).getTime() - new Date(b.tracked.createdAt).getTime()
        break
      case 'amount': {
        const amountA = a.invoice
          ? parseFloat(formatInvoiceTotal(a.invoice).split(' ')[0] || '0')
          : 0
        const amountB = b.invoice
          ? parseFloat(formatInvoiceTotal(b.invoice).split(' ')[0] || '0')
          : 0
        comparison = amountA - amountB
        break
      }
      case 'invoiceId':
        comparison = a.tracked.invoiceId.localeCompare(b.tracked.invoiceId)
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}
