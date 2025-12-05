/**
 * Invoice validation constants
 *
 * Separated from validation.ts to avoid pulling in zod for simple regex checks.
 * This improves bundle splitting - zod is only loaded when validation is needed.
 */

/** Regex for Ethereum address (0x + 40 hex chars) */
export const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

/** Regex for numeric string (positive, optional decimal) */
export const NUMERIC_STRING_REGEX = /^\d+(\.\d+)?$/
