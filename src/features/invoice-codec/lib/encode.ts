import type { Invoice } from '@/entities/invoice'
import { getAppBaseUrl } from '@/shared/config'
import { encodeBinaryV3 } from '@/shared/lib/binary-codec'
import { encodeOGPreview } from './og-preview'

/**
 * URL generation options.
 */
export interface GenerateUrlOptions {
  /** Base URL override (default: from NEXT_PUBLIC_APP_URL env) */
  baseUrl?: string
  /** Include OG preview data for social sharing (default: false) */
  includeOG?: boolean
}

/**
 * Encodes an invoice into a Binary V3 compressed string.
 * Uses hybrid compression: binary packing + selective Deflate for text.
 *
 * @param invoice The invoice data to encode
 * @returns The Base62-encoded binary string (prefixed with 'H')
 */
export const encodeInvoice = (invoice: Invoice): string => {
  return encodeBinaryV3(invoice)
}

/**
 * Generates a shareable URL for the invoice using hash fragment.
 * Hash fragments are never sent to the server (Privacy-First principle).
 * Validates that the final URL does not exceed 2000 bytes.
 *
 * @param invoice The invoice data to encode
 * @param options URL generation options
 * @returns The full URL with the compressed invoice data in hash fragment
 * @throws Error if the URL exceeds 2000 bytes
 *
 * @example
 * ```ts
 * // Simple URL (privacy-first)
 * generateInvoiceUrl(invoice)
 * // => "https://voidpay.xyz/pay#H4sI..."
 *
 * // With OG preview for social sharing
 * generateInvoiceUrl(invoice, { includeOG: true })
 * // => "https://voidpay.xyz/pay?og=a1b2c3d4_1250.00_USDC_arb_Acme#H4sI..."
 * ```
 */
export const generateInvoiceUrl = (
  invoice: Invoice,
  options: GenerateUrlOptions | string = {}
): string => {
  // Support legacy signature: generateInvoiceUrl(invoice, baseUrl)
  const opts: GenerateUrlOptions = typeof options === 'string' ? { baseUrl: options } : options

  const compressed = encodeInvoice(invoice)
  const appUrl = opts.baseUrl || getAppBaseUrl()

  let finalUrl: string

  if (opts.includeOG) {
    // Hybrid format: ?og=preview#compressed
    const ogData = encodeOGPreview(invoice)
    finalUrl = `${appUrl}/pay?og=${ogData}#${compressed}`
  } else {
    // Pure hash fragment (maximum privacy)
    finalUrl = `${appUrl}/pay#${compressed}`
  }

  const byteSize = new TextEncoder().encode(finalUrl).length

  if (byteSize > 2000) {
    throw new Error(`URL size (${byteSize} bytes) exceeds 2000 byte limit`)
  }

  return finalUrl
}
