/**
 * Invoice validation constants
 *
 * Separated from validation.ts to avoid pulling in zod for simple regex checks.
 * This improves bundle splitting - zod is only loaded when validation is needed.
 */

// Re-export from shared layer for backwards compatibility
// ETH_ADDRESS_REGEX moved to shared/lib/validation for FSD compliance
export { ETH_ADDRESS_REGEX } from '@/shared/lib/validation'

/** Regex for numeric string (positive, optional decimal) */
export const NUMERIC_STRING_REGEX = /^\d+(\.\d+)?$/
