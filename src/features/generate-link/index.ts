/**
 * Generate Link Feature - Public API
 *
 * Provides invoice URL generation and history tracking functionality.
 * Orchestrates between entities/invoice (data) and entities/creator (storage).
 */

export {
  calculateTotalAmount,
  addToHistory,
  generateAndTrackInvoice,
} from './lib/generate-invoice'
