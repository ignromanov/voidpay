/**
 * Search and Filter Utilities for Invoice History
 *
 * Client-side search functionality for history entries.
 */

import { formatInvoiceTotal, type CreationHistoryEntry } from '@/entities/invoice'

/**
 * Search history entries by query string
 *
 * Searches across: invoiceId, client name, total amount
 *
 * @param history - Array of history entries
 * @param query - Search query (case-insensitive)
 * @returns Filtered array of matching entries
 */
export function searchHistory(
  history: CreationHistoryEntry[],
  query: string
): CreationHistoryEntry[] {
  if (!query.trim()) {
    return history
  }

  const normalizedQuery = query.toLowerCase().trim()

  return history.filter((entry) => {
    const searchableText = [
      entry.invoice.invoiceId,
      entry.invoice.client?.name ?? '',
      formatInvoiceTotal(entry.invoice),
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedQuery)
  })
}

/**
 * Filter history entries by date range
 *
 * @param history - Array of history entries
 * @param startDate - Start date (ISO 8601)
 * @param endDate - End date (ISO 8601)
 * @returns Filtered array of entries within date range
 */
export function filterHistoryByDateRange(
  history: CreationHistoryEntry[],
  startDate?: string,
  endDate?: string
): CreationHistoryEntry[] {
  return history.filter((entry) => {
    const entryDate = new Date(entry.createdAt)

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
 * @param history - Array of history entries
 * @param status - 'paid' | 'unpaid' | 'all'
 * @returns Filtered array based on payment status
 */
export function filterHistoryByPaymentStatus(
  history: CreationHistoryEntry[],
  status: 'paid' | 'unpaid' | 'all'
): CreationHistoryEntry[] {
  if (status === 'all') {
    return history
  }

  return history.filter((entry) => {
    const isPaid = !!entry.txHash
    return status === 'paid' ? isPaid : !isPaid
  })
}

/**
 * Sort history entries
 *
 * @param history - Array of history entries
 * @param sortBy - Sort field
 * @param order - Sort order ('asc' | 'desc')
 * @returns Sorted array
 */
export function sortHistory(
  history: CreationHistoryEntry[],
  sortBy: 'date' | 'amount' | 'invoiceId',
  order: 'asc' | 'desc' = 'desc'
): CreationHistoryEntry[] {
  const sorted = [...history].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'amount': {
        // Extract numeric value from formatted total
        const amountA = parseFloat(formatInvoiceTotal(a.invoice).split(' ')[0] || '0')
        const amountB = parseFloat(formatInvoiceTotal(b.invoice).split(' ')[0] || '0')
        comparison = amountA - amountB
        break
      }
      case 'invoiceId':
        comparison = a.invoice.invoiceId.localeCompare(b.invoice.invoiceId)
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}
