/**
 * Binary Codec V3 - Hybrid Strategy Decoder (Fixed)
 *
 * Decodes invoices encoded with V3 hybrid compression strategy.
 * Uses pako.inflate to decompress raw bytes (NO double decoding).
 */

import { InvoiceSchemaV1 } from '@/entities/invoice/model/schema';
import {
  bytesToUuid,
  bytesToAddress,
  readVarInt,
} from './utils';
import { decodeBase62 } from './base62';
import { CURRENCY_DICT_REVERSE, TOKEN_DICT_REVERSE } from './dictionary';
import pako from 'pako';

/**
 * Bit flags for optional fields (matches encoder)
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
  TEXT_COMPRESSED = 1 << 11,
}

/**
 * Decodes invoice from hybrid compressed format
 * Prefix: 'H' (Hybrid)
 */
export function decodeBinaryV3(encoded: string): InvoiceSchemaV1 {
  // 1. Check prefix
  if (!encoded.startsWith('H')) {
    throw new Error('Invalid V3 encoding: must start with H');
  }

  // 2. Remove prefix and decode from Base62
  const base62Data = encoded.slice(1);
  const bytes = decodeBase62(base62Data);

  let offset = 0;

  // 3. Version
  const version = bytes[offset++];
  if (version !== 3) {
    throw new Error(`Unsupported version: ${version}`);
  }

  // 4. Read flags (2 bytes)
  const flagsHigh = bytes[offset++] ?? 0;
  const flagsLow = bytes[offset++] ?? 0;
  const flags = (flagsHigh << 8) | flagsLow;

  // 5. UUID (16 bytes)
  const uuidBytes = bytes.slice(offset, offset + 16);
  const invoiceId = bytesToUuid(uuidBytes);
  offset += 16;

  // 6. Issue timestamp (4 bytes)
  const issuedAt =
    ((bytes[offset++] ?? 0) << 24) |
    ((bytes[offset++] ?? 0) << 16) |
    ((bytes[offset++] ?? 0) << 8) |
    (bytes[offset++] ?? 0);

  // 7. Delta for due date (varint)
  const deltaResult = readVarInt(bytes, offset);
  const delta = deltaResult.value;
  offset += deltaResult.bytesRead;
  const dueAt = issuedAt + delta;

  // 8. Network ID (varint)
  const netResult = readVarInt(bytes, offset);
  const networkId = netResult.value;
  offset += netResult.bytesRead;

  // 9. Decimals (varint)
  const decResult = readVarInt(bytes, offset);
  const decimals = decResult.value;
  offset += decResult.bytesRead;

  // 10. Token address (optional, with dictionary support)
  let tokenAddress: string | undefined;
  if (flags & OptionalFields.HAS_TOKEN) {
    const tokenFlag = bytes[offset++];
    if (tokenFlag === 0) {
      // Dictionary token
      const tokenCode = bytes[offset++];
      tokenAddress = TOKEN_DICT_REVERSE[tokenCode ?? 0];
    } else {
      // Custom token
      const tokenBytes = bytes.slice(offset, offset + 20);
      tokenAddress = bytesToAddress(tokenBytes);
      offset += 20;
    }
  }

  // 11. From wallet address (20 bytes)
  const fromAddressBytes = bytes.slice(offset, offset + 20);
  const fromWalletAddress = bytesToAddress(fromAddressBytes);
  offset += 20;

  // 12. Client wallet address (optional, 20 bytes)
  let clientWalletAddress: string | undefined;
  if (flags & OptionalFields.HAS_CLIENT_WALLET) {
    const clientAddressBytes = bytes.slice(offset, offset + 20);
    clientWalletAddress = bytesToAddress(clientAddressBytes);
    offset += 20;
  }

  // 13. Line items count (varint)
  const itemCountResult = readVarInt(bytes, offset);
  const itemCount = itemCountResult.value;
  offset += itemCountResult.bytesRead;

  // 14. Read text data length (varint)
  const textLengthResult = readVarInt(bytes, offset);
  const textLength = textLengthResult.value;
  offset += textLengthResult.bytesRead;

  // 15. Read text data bytes
  const textDataBytes = bytes.slice(offset, offset + textLength);
  offset += textLength;

  // 16. Decompress text if needed
  let rawTextBytes: Uint8Array;
  if (flags & OptionalFields.TEXT_COMPRESSED) {
    try {
      // Key improvement: pako.inflate expects raw Uint8Array and returns raw Uint8Array
      rawTextBytes = pako.inflate(textDataBytes);
    } catch (error) {
      throw new Error('Failed to decompress text data: ' + (error as Error).message);
    }
  } else {
    rawTextBytes = textDataBytes;
  }

  // 17. Decode text from bytes
  const textDecoder = new TextDecoder();
  const textData = textDecoder.decode(rawTextBytes);

  // 18. Parse text data (split by null separator)
  const textParts = textData.split('\x00');
  let textIdx = 0;

  // Currency (with dictionary support)
  const currencyMarker = textParts[textIdx++];
  let currency: string;
  if (currencyMarker === '\x01') {
    // Dictionary
    const currCode = textParts[textIdx++]?.charCodeAt(0);
    currency = CURRENCY_DICT_REVERSE[currCode ?? 0] ?? 'UNKNOWN';
  } else {
    // String
    currency = textParts[textIdx++] ?? 'UNKNOWN';
  }

  // Notes (optional)
  let notes: string | undefined;
  if (flags & OptionalFields.HAS_NOTES) {
    notes = textParts[textIdx++];
  }

  // From fields
  const fromName = textParts[textIdx++] ?? '';
  const fromEmail = (flags & OptionalFields.HAS_SENDER_EMAIL) ? textParts[textIdx++] : undefined;
  const fromPhysicalAddress = (flags & OptionalFields.HAS_SENDER_ADDRESS) ? textParts[textIdx++] : undefined;
  const fromPhone = (flags & OptionalFields.HAS_SENDER_PHONE) ? textParts[textIdx++] : undefined;

  // Client fields
  const clientName = textParts[textIdx++] ?? '';
  const clientEmail = (flags & OptionalFields.HAS_CLIENT_EMAIL) ? textParts[textIdx++] : undefined;
  const clientPhysicalAddress = (flags & OptionalFields.HAS_CLIENT_ADDRESS) ? textParts[textIdx++] : undefined;
  const clientPhone = (flags & OptionalFields.HAS_CLIENT_PHONE) ? textParts[textIdx++] : undefined;

  // Tax and Discount (optional)
  const tax = (flags & OptionalFields.HAS_TAX) ? textParts[textIdx++] : undefined;
  const discount = (flags & OptionalFields.HAS_DISCOUNT) ? textParts[textIdx++] : undefined;

  // Line items (all fields from text)
  const items = [];
  for (let i = 0; i < itemCount; i++) {
    const description = textParts[textIdx++] ?? '';
    const qtyStr = textParts[textIdx++] ?? '0';
    const rate = textParts[textIdx++] ?? '0';

    items.push({
      description,
      quantity: isNaN(Number(qtyStr)) ? qtyStr : Number(qtyStr),
      rate,
    });
  }

  // 19. Construct invoice
  const invoice: InvoiceSchemaV1 = {
    version: 1,
    invoiceId,
    issuedAt,
    dueAt,
    notes,
    networkId,
    currency,
    tokenAddress,
    decimals,
    from: {
      name: fromName,
      walletAddress: fromWalletAddress,
      email: fromEmail,
      physicalAddress: fromPhysicalAddress,
      phone: fromPhone,
    },
    client: {
      name: clientName,
      walletAddress: clientWalletAddress,
      email: clientEmail,
      physicalAddress: clientPhysicalAddress,
      phone: clientPhone,
    },
    items,
    tax,
    discount,
  };

  return invoice;
}
