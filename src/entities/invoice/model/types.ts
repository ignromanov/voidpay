/**
 * DEPRECATED: This file is kept for backward compatibility only.
 *
 * All invoice types and helpers have been moved to @/shared/lib/invoice-types
 * to comply with FSD layer rules (shared layer cannot import from entities).
 *
 * All exports here are re-exported from the shared layer.
 * Please import from @/shared/lib/invoice-types or @/entities/invoice instead.
 */

// Re-export all types and helpers from shared layer
export type {
  Invoice,
  DeepPartial,
  PartialInvoice,
  PartialParty,
  PartialClient,
  PartialItem,
  InvoiceItem,
  LineItem,
  DraftMetadata,
  DraftState,
  InvoiceTemplate,
  CreationHistoryEntry,
  PaymentReceipt,
} from '@/shared/lib/invoice-types'

export {
  lineItemsToInvoiceItems,
  invoiceItemsToLineItems,
  formatInvoiceTotal,
} from '@/shared/lib/invoice-types'
