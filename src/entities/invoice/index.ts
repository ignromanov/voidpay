/**
 * Invoice Entity - Public API
 *
 * Exposes invoice-related types, schemas, and validation for use
 * across the application following FSD public API conventions.
 */

// Types (from model layer)
export type {
  InvoiceSchemaV1,
} from './model/schema'

export type {
  InvoiceDraft,
  InvoiceTemplate,
  LineItem,
  PaymentReceipt,
  CreationHistoryEntry,
} from './model/types'

// Validation (from lib layer)
export { invoiceSchema } from './lib/validation'

// Constants - re-export for backwards compatibility
// Note: ETH_ADDRESS_REGEX now lives in shared/lib/validation
export { ETH_ADDRESS_REGEX, NUMERIC_STRING_REGEX } from './lib/constants'
