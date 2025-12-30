import type { InvoiceSchemaV2 } from '@/entities/invoice'
import { invoiceSchema } from '@/entities/invoice'
import { decodeBinaryV3 } from '@/shared/lib/binary-codec'

/**
 * Decodes a Binary V3 compressed string into an invoice object.
 * Supports version-specific parsing for backward compatibility.
 *
 * @param compressed The compressed string from the URL hash fragment
 * @returns The decoded invoice object
 * @throws Error if decoding fails or version is unsupported
 */
export const decodeInvoice = (compressed: string): InvoiceSchemaV2 => {
  // Binary V3 format starts with 'H' prefix
  if (!compressed.startsWith('H')) {
    throw new Error('Invalid invoice format: expected Binary V3 (H prefix)')
  }

  try {
    const invoice = decodeBinaryV3(compressed)

    // Validate against schema
    return validateInvoice(invoice)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to decode invoice data')
  }
}

/**
 * Validates decoded invoice against schema.
 * Ensures data integrity after binary decoding.
 *
 * @param data Decoded invoice data
 * @returns Validated InvoiceSchemaV2 object
 * @throws Error if validation fails
 */
function validateInvoice(data: unknown): InvoiceSchemaV2 {
  const result = invoiceSchema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    throw new Error(`Invalid invoice data: ${errors}`)
  }

  return result.data
}
