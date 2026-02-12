/**
 * Generate Link Feature - Public API
 *
 * Provides invoice URL generation, validation, and history tracking functionality.
 * Orchestrates between entities/invoice (data) and entities/creator (storage).
 */

// Generation and history
export {
  calculateTotalAmount,
  addToHistory,
  generateAndTrackInvoice,
  UrlSizeError,
} from './lib/generate-invoice'

// Validation
export { validateInvoiceForGeneration } from './lib/validate-invoice'
export { buildInvoiceFromDraft } from './lib/build-invoice'

// Types
export type { ValidationResult, ValidationError, GenerateOptions } from './lib/types'
