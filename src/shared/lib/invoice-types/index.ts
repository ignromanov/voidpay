/**
 * Invoice Types - Shared Layer Public API
 *
 * Exports invoice types, schemas, and utilities for use across the application.
 *
 * This module is in the shared layer (not entities/) to comply with FSD layer rules:
 * shared → entities → features → widgets → app
 *
 * The shared layer can be imported by any higher layer without violating FSD.
 */

// Schema and base type
export { invoiceSchema, type Invoice } from './schema'

// Helper types
export type {
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
} from './types'

// Helper functions
export { lineItemsToInvoiceItems, invoiceItemsToLineItems, formatInvoiceTotal } from './types'
