import type { InvoiceSchemaV1 } from '@/entities/invoice'
import { compress } from '@/shared/lib/compression'

/**
 * Encodes an invoice into a compressed string.
 *
 * @param invoice The invoice data to encode
 * @returns The compressed string
 */
export const encodeInvoice = (invoice: InvoiceSchemaV1): string => {
  const json = JSON.stringify(invoice)
  return compress(json)
}

/**
 * Generates a shareable URL for the invoice.
 * Validates that the final URL does not exceed 2000 bytes.
 *
 * @param invoice The invoice data to encode
 * @param baseUrl The base URL of the application (default: from NEXT_PUBLIC_APP_URL env or https://voidpay.com)
 * @returns The full URL with the compressed invoice data
 * @throws Error if the URL exceeds 2000 bytes
 */
export const generateInvoiceUrl = (invoice: InvoiceSchemaV1, baseUrl?: string): string => {
  const compressed = encodeInvoice(invoice)

  // Use provided baseUrl, or env variable, or fallback to default
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://voidpay.com'
  const url = new URL(`${appUrl}/pay`)
  url.searchParams.set('d', compressed)

  const finalUrl = url.toString()
  const byteSize = new TextEncoder().encode(finalUrl).length

  if (byteSize > 2000) {
    throw new Error(`URL size (${byteSize} bytes) exceeds 2000 byte limit`)
  }

  return finalUrl
}
