/**
 * Binary Invoice Encoder
 *
 * Packs InvoiceSchemaV1 into a compact binary format:
 * - UUID -> 16 bytes
 * - Ethereum addresses -> 20 bytes
 * - Timestamps -> 4 bytes (UInt32)
 * - Small numbers -> Varint
 * - Strings -> Length-prefixed UTF-8
 * - Optional fields -> 1 byte flag
 *
 * Final encoding: Uint8Array -> Base62 string
 */

import { InvoiceSchemaV1 } from '@/entities/invoice/model/schema';
import { encodeBase62 } from './base62';
import {
  uuidToBytes,
  addressToBytes,
  writeUInt32,
  writeVarInt,
  writeString,
  writeOptionalString,
  writeOptionalAddress,
} from './utils';

/**
 * Encodes an invoice into a compact binary format and returns Base62 string
 */
export function encodeBinary(invoice: InvoiceSchemaV1): string {
  const buffer: number[] = [];

  // 1. Version (1 byte)
  buffer.push(invoice.v);

  // 2. Invoice ID (UUID -> 16 bytes)
  const idBytes = uuidToBytes(invoice.id);
  buffer.push(...Array.from(idBytes));

  // 3. Issue Date (4 bytes, Unix timestamp)
  writeUInt32(buffer, invoice.iss);

  // 4. Due Date (4 bytes, Unix timestamp)
  writeUInt32(buffer, invoice.due);

  // 5. Notes (optional string)
  writeOptionalString(buffer, invoice.nt);

  // 6. Network Chain ID (varint - typically small like 1, 137)
  writeVarInt(buffer, invoice.net);

  // 7. Currency Symbol (length-prefixed string)
  writeString(buffer, invoice.cur);

  // 8. Token Address (optional 20 bytes)
  writeOptionalAddress(buffer, invoice.t);

  // 9. Decimals (varint)
  writeVarInt(buffer, invoice.dec);

  // 10. Sender Info
  writeString(buffer, invoice.f.n);
  const senderAddressBytes = addressToBytes(invoice.f.a);
  buffer.push(...Array.from(senderAddressBytes));
  writeOptionalString(buffer, invoice.f.e);
  writeOptionalString(buffer, invoice.f.ads);
  writeOptionalString(buffer, invoice.f.ph);

  // 11. Client Info
  writeString(buffer, invoice.c.n);
  writeOptionalAddress(buffer, invoice.c.a);
  writeOptionalString(buffer, invoice.c.e);
  writeOptionalString(buffer, invoice.c.ads);
  writeOptionalString(buffer, invoice.c.ph);

  // 12. Line Items (count + items)
  writeVarInt(buffer, invoice.it.length);
  for (const item of invoice.it) {
    writeString(buffer, item.d);

    // Quantity (as string or number, store as string)
    const qtyStr = typeof item.q === 'number' ? item.q.toString() : item.q;
    writeString(buffer, qtyStr);

    // Rate (string)
    writeString(buffer, item.r);
  }

  // 13. Tax (optional string)
  writeOptionalString(buffer, invoice.tax);

  // 14. Discount (optional string)
  writeOptionalString(buffer, invoice.dsc);

  // 15. Meta (skip for now - reserved for future)
  // 16. _future (skip for now - reserved for future)

  // Convert to Uint8Array and encode to Base62
  const bytes = new Uint8Array(buffer);
  return encodeBase62(bytes);
}

/**
 * Get encoded size in bytes (for debugging/stats)
 */
export function getBinarySize(invoice: InvoiceSchemaV1): number {
  const encoded = encodeBinary(invoice);
  const decoded = decodeBase62ToBytes(encoded);
  return decoded.length;
}

/**
 * Helper to decode Base62 back to bytes (for size calculation)
 */
function decodeBase62ToBytes(str: string): Uint8Array {
  const { decodeBase62 } = require('./base62');
  return decodeBase62(str);
}
