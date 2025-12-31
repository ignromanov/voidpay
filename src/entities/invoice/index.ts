/**
 * Invoice Entity - Public API
 *
 * Exposes invoice-related types, schemas, and validation for use
 * across the application following FSD public API conventions.
 */

// Core Invoice type (from schema)
export type { Invoice } from './model/schema'

// Types (from model layer)
export type {
  LineItem,
  DraftMetadata,
  DraftState,
  InvoiceTemplate,
  PaymentReceipt,
  CreationHistoryEntry,
  // Generic utilities
  DeepPartial,
  PartialInvoice,
  PartialParty,
  PartialClient,
  PartialItem,
} from './model/types'

// Helper functions for LineItem conversion and formatting
export { lineItemsToInvoiceItems, invoiceItemsToLineItems, formatInvoiceTotal } from './model/types'

// Validation (from lib layer)
export { invoiceSchema } from './lib/validation'

// Constants - re-export for backwards compatibility
// Note: ETH_ADDRESS_REGEX now lives in shared/lib/validation
export { ETH_ADDRESS_REGEX, NUMERIC_STRING_REGEX } from './lib/constants'

// Invoice view store (from model layer)
export { useInvoiceViewStore } from './model/viewed-invoice-store'
export type { ViewedInvoice, ViewedInvoiceStatus } from './model/viewed-invoice-store'
