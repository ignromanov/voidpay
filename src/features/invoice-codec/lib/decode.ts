import { InvoiceSchemaV1 } from '@/entities/invoice/model/schema';
import { invoiceSchema } from '@/entities/invoice/lib/validation';
import { decompress } from '@/shared/lib/compression';

/**
 * Decodes a compressed string into an invoice object.
 * Supports version-specific parsing for backward compatibility.
 * 
 * @param compressed The compressed string from the URL
 * @returns The decoded invoice object
 * @throws Error if decompression, parsing, or unsupported version
 */
export const decodeInvoice = (compressed: string): InvoiceSchemaV1 => {
  const json = decompress(compressed);
  if (!json) {
    throw new Error('Failed to decompress invoice data');
  }
  
  try {
    const data = JSON.parse(json);
    
    // Version detection
    const version = data.v;
    if (typeof version !== 'number') {
      throw new Error('Missing or invalid version field');
    }
    
    // Version-specific parsing (immutable parsers per Constitution Principle IV)
    switch (version) {
      case 1:
        return parseV1(data);
      default:
        throw new Error(`Unsupported schema version: ${version}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse invoice JSON');
  }
};

/**
 * Immutable parser for InvoiceSchemaV1.
 * This function MUST NOT be modified once deployed (Constitution Principle IV).
 * 
 * @param data Raw parsed JSON data
 * @returns Validated InvoiceSchemaV1 object
 * @throws Error if validation fails
 */
function parseV1(data: unknown): InvoiceSchemaV1 {
  const result = invoiceSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Invalid invoice data: ${errors}`);
  }
  
  return result.data ;
}
