/**
 * Binary Invoice Decoder V2
 *
 * Decodes V2 enhanced binary format with:
 * - Bit-packed flags
 * - Dictionary decompression
 * - Delta-encoded dates
 * - Optional LZ decompression pass
 */

import { InvoiceSchemaV1 } from '@/entities/invoice/model/schema';
import { decodeBase62 } from './base62';
import { decompress } from '@/shared/lib/compression';
import {
  bytesToUuid,
  bytesToAddress,
  readUInt32,
  readVarInt,
  readString,
} from './utils';
import {
  CURRENCY_DICT_REVERSE,
  TOKEN_DICT_REVERSE,
  decodeDictString,
} from './dictionary';

/**
 * Bit flags enum (must match encoder-v2.ts)
 */
enum OptionalFields {
  HAS_NOTES = 1 << 0,
  HAS_TOKEN = 1 << 1,
  HAS_SENDER_EMAIL = 1 << 2,
  HAS_SENDER_ADDRESS = 1 << 3,
  HAS_SENDER_PHONE = 1 << 4,
  HAS_CLIENT_WALLET = 1 << 5,
  HAS_CLIENT_EMAIL = 1 << 6,
  HAS_CLIENT_ADDRESS = 1 << 7,
  HAS_CLIENT_PHONE = 1 << 8,
  HAS_TAX = 1 << 9,
  HAS_DISCOUNT = 1 << 10,
  USE_LZ_COMPRESSION = 1 << 11,
}

/**
 * Reads a string with dictionary support
 */
function readStringWithDict(
  bytes: Uint8Array,
  offset: number,
  dict: Record<number, string>
): { value: string; bytesRead: number } {
  const mode = bytes[offset] ?? 0;

  if (mode === 0) {
    // Dictionary mode
    const code = bytes[offset + 1] ?? 0;
    const value = decodeDictString(code, dict);
    if (value === null) {
      throw new Error(`Invalid dictionary code: ${code}`);
    }
    return { value, bytesRead: 2 };
  } else {
    // Raw string mode
    const result = readString(bytes, offset + 1);
    return { value: result.value, bytesRead: result.bytesRead + 1 };
  }
}

/**
 * Reads an optional address with dictionary support
 */
function readOptionalAddressWithDict(
  bytes: Uint8Array,
  offset: number
): { value: string; bytesRead: number } {
  const mode = bytes[offset] ?? 0;

  if (mode === 0) {
    // Dictionary mode
    const code = bytes[offset + 1] ?? 0;
    const value = TOKEN_DICT_REVERSE[code];
    if (!value) {
      throw new Error(`Invalid token dictionary code: ${code}`);
    }
    return { value, bytesRead: 2 };
  } else {
    // Raw address mode
    const addressBytes = bytes.slice(offset + 1, offset + 21);
    const value = bytesToAddress(addressBytes);
    return { value, bytesRead: 21 };
  }
}

/**
 * Decodes a V2 binary-encoded invoice
 */
export function decodeBinaryV2(encoded: string): InvoiceSchemaV1 {
  // Check prefix
  const prefix = encoded[0];
  const data = encoded.substring(1);

  let bytes: Uint8Array;

  if (prefix === 'L') {
    // LZ-compressed
    const decompressed = decompress(data);
    if (!decompressed) {
      throw new Error('Failed to decompress V2 invoice data');
    }
    // Convert base64 back to bytes
    const binaryString = atob(decompressed);
    bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  } else if (prefix === 'B') {
    // Binary only
    bytes = decodeBase62(data);
  } else {
    throw new Error(`Invalid V2 prefix: ${prefix}`);
  }

  let offset = 0;

  // Helper to advance offset
  const read = <T extends { bytesRead: number; value: any }>(fn: () => T): T['value'] => {
    const result = fn();
    offset += result.bytesRead;
    return result.value;
  };

  // 1. Version (should be 2)
  const v = bytes[offset++] ?? 0;
  if (v !== 2) {
    throw new Error(`Expected V2 schema, got version: ${v}`);
  }

  // 2. Bit flags (2 bytes)
  const flagsHigh = bytes[offset++] ?? 0;
  const flagsLow = bytes[offset++] ?? 0;
  const flags = (flagsHigh << 8) | flagsLow;

  // 3. Invoice ID (16 bytes UUID)
  const idBytes = bytes.slice(offset, offset + 16);
  const id = bytesToUuid(idBytes);
  offset += 16;

  // 4. Issue Date (4 bytes)
  const iss = read(() => readUInt32(bytes, offset));

  // 5. Due Date as DELTA (varint)
  const dueDelta = read(() => readVarInt(bytes, offset));
  const due = iss + dueDelta;

  // 6. Notes (if flag set)
  const nt = (flags & OptionalFields.HAS_NOTES)
    ? read(() => readString(bytes, offset))
    : undefined;

  // 7. Network Chain ID (varint)
  const net = read(() => readVarInt(bytes, offset));

  // 8. Currency Symbol (with dictionary)
  const cur = read(() => readStringWithDict(bytes, offset, CURRENCY_DICT_REVERSE));

  // 9. Token Address (if flag set, with dictionary)
  const t = (flags & OptionalFields.HAS_TOKEN)
    ? read(() => readOptionalAddressWithDict(bytes, offset))
    : undefined;

  // 10. Decimals (varint)
  const dec = read(() => readVarInt(bytes, offset));

  // 11. Sender Info
  const f = {
    n: read(() => readString(bytes, offset)),
    a: bytesToAddress(bytes.slice(offset, offset + 20)),
    e: undefined as string | undefined,
    ads: undefined as string | undefined,
    ph: undefined as string | undefined,
  };
  offset += 20;

  if (flags & OptionalFields.HAS_SENDER_EMAIL) {
    f.e = read(() => readString(bytes, offset));
  }
  if (flags & OptionalFields.HAS_SENDER_ADDRESS) {
    f.ads = read(() => readString(bytes, offset));
  }
  if (flags & OptionalFields.HAS_SENDER_PHONE) {
    f.ph = read(() => readString(bytes, offset));
  }

  // 12. Client Info
  const c = {
    n: read(() => readString(bytes, offset)),
    a: undefined as string | undefined,
    e: undefined as string | undefined,
    ads: undefined as string | undefined,
    ph: undefined as string | undefined,
  };

  if (flags & OptionalFields.HAS_CLIENT_WALLET) {
    c.a = bytesToAddress(bytes.slice(offset, offset + 20));
    offset += 20;
  }

  if (flags & OptionalFields.HAS_CLIENT_EMAIL) {
    c.e = read(() => readString(bytes, offset));
  }
  if (flags & OptionalFields.HAS_CLIENT_ADDRESS) {
    c.ads = read(() => readString(bytes, offset));
  }
  if (flags & OptionalFields.HAS_CLIENT_PHONE) {
    c.ph = read(() => readString(bytes, offset));
  }

  // 13. Line Items (no dictionary for descriptions)
  const itemCount = read(() => readVarInt(bytes, offset));
  const it: Array<{ d: string; q: string | number; r: string }> = [];

  for (let i = 0; i < itemCount; i++) {
    const d = read(() => readString(bytes, offset));
    const qStr = read(() => readString(bytes, offset));
    const r = read(() => readString(bytes, offset));

    // Try to parse quantity as number if possible
    const qNum = parseFloat(qStr);
    const q = !isNaN(qNum) && qNum.toString() === qStr ? qNum : qStr;

    it.push({ d, q, r });
  }

  // 14. Tax (if flag set)
  const tax = (flags & OptionalFields.HAS_TAX)
    ? read(() => readString(bytes, offset))
    : undefined;

  // 15. Discount (if flag set)
  const dsc = (flags & OptionalFields.HAS_DISCOUNT)
    ? read(() => readString(bytes, offset))
    : undefined;

  // Construct the invoice object (V1 compatible)
  const invoice: InvoiceSchemaV1 = {
    v: 1, // Return as V1 for compatibility
    id,
    iss,
    due,
    nt,
    net,
    cur,
    t,
    dec,
    f,
    c,
    it,
    tax,
    dsc,
  };

  return invoice;
}
