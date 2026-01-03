/**
 * DEPRECATED: This file is kept for backward compatibility only.
 *
 * The Invoice type and schema have been moved to @/shared/lib/invoice-types
 * to comply with FSD layer rules (shared layer cannot import from entities).
 *
 * All exports here are re-exported from the shared layer.
 * Please import from @/shared/lib/invoice-types or @/entities/invoice instead.
 */

// Re-export Invoice type from shared layer
export type { Invoice } from '@/shared/lib/invoice-types'
