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

// Schemas and base types
export { invoiceSchema, invoiceFormSchema, type Invoice, type InvoiceFormValues } from './schema'

// Field limits (single source of truth for form and schema validation)
export { FIELD_LIMITS, type FieldLimits } from './limits'

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
