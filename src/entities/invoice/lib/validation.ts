/**
 * DEPRECATED: This file is kept for backward compatibility only.
 *
 * The invoiceSchema has been moved to @/shared/lib/invoice-types
 * to comply with FSD layer rules (shared layer cannot import from entities).
 *
 * All exports here are re-exported from the shared layer.
 * Please import from @/shared/lib/invoice-types or @/entities/invoice instead.
 */

// Re-export schema from shared layer
export { invoiceSchema } from '@/shared/lib/invoice-types'

// Re-export for backwards compatibility
export { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'
