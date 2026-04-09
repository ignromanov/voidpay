import type { Invoice } from '@/entities/invoice'

import { computeContentHash } from './content-hash'
import { decodeInvoice } from './decode'

/**
 * Result type for hash parsing operation.
 * Uses discriminated union for type-safe error handling.
 */
export type HashParseResult =
  | { success: true; data: Invoice; contentHash: string }
  | { success: false; error: Error }

/**
 * Parses URL hash fragment into Invoice data.
 *
 * This function wraps decodeInvoice with proper error handling,
 * providing a reusable utility for hash-based invoice decoding
 * across different components (/create, /pay, history restoration).
 *
 * @param hash - URL hash fragment (without leading '#')
 * @returns Discriminated union with success status and data or error
 *
 * @example
 * ```tsx
 * const result = parseInvoiceHash(hash)
 * if (result.success) {
 *   replaceDraft(result.data)
 * } else {
 *   toast.error(result.error.message)
 * }
 * ```
 */
export async function parseInvoiceHash(hash: string): Promise<HashParseResult> {
  if (!hash) {
    return {
      success: false,
      error: new Error('Empty hash fragment'),
    }
  }

  try {
    const [data, contentHash] = await Promise.all([
      decodeInvoice(hash),
      computeContentHash(hash),
    ])
    return { success: true, data, contentHash }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to decode invoice'),
    }
  }
}
