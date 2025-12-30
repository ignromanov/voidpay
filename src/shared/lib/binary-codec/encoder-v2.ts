/**
 * Binary Invoice Encoder V2 (Enhanced)
 *
 * Additional optimizations over V1:
 * 1. Bit-packing for optional fields (all flags in 2 bytes)
 * 2. Dictionary compression for common strings
 * 3. Delta encoding for due date (offset from issue date)
 * 4. Optional LZ compression pass over binary data
 * 5. Optimized line item encoding
 */

import { InvoiceSchemaV1 } from '@/entities/invoice/model/schema'
import { encodeBase62 } from './base62'
import { compress } from '@/shared/lib/compression'
import { uuidToBytes, addressToBytes, writeUInt32, writeVarInt, writeString } from './utils'
import { CURRENCY_DICT, TOKEN_DICT, encodeDictString } from './dictionary'

/**
 * Bit flags for optional fields (2 bytes = 16 flags)
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
  USE_LZ_COMPRESSION = 1 << 11, // If set, binary data is LZ-compressed
  // Bits 12-15 reserved for future use
}

/**
 * Writes a string with dictionary support
 * Format: 1 byte flag (0 = dict, 1 = raw) + data
 */
function writeStringWithDict(buffer: number[], str: string, dict: Record<string, number>): void {
  const dictCode = encodeDictString(str, dict)
  if (dictCode !== null) {
    buffer.push(0) // Dictionary mode
    buffer.push(dictCode)
  } else {
    buffer.push(1) // Raw string mode
    writeString(buffer, str)
  }
}

/**
 * Writes an optional address with dictionary support
 */
function writeOptionalAddressWithDict(buffer: number[], address: string | undefined): void {
  if (address === undefined) return

  const lower = address.toLowerCase()
  const dictCode = TOKEN_DICT[lower]

  if (dictCode !== undefined) {
    buffer.push(0) // Dictionary mode
    buffer.push(dictCode)
  } else {
    buffer.push(1) // Raw address mode
    const bytes = addressToBytes(address)
    buffer.push(...Array.from(bytes))
  }
}

/**
 * Encodes an invoice into V2 binary format
 * @param invoice Invoice to encode
 * @param useLzCompression Apply LZ compression pass (default: true)
 */
export function encodeBinaryV2(invoice: InvoiceSchemaV1, useLzCompression = true): string {
  const buffer: number[] = []

  // 1. Version (1 byte) - Version 2
  buffer.push(2)

  // 2. Compute bit flags
  let flags = 0
  if (invoice.notes) flags |= OptionalFields.HAS_NOTES
  if (invoice.tokenAddress) flags |= OptionalFields.HAS_TOKEN
  if (invoice.from.email) flags |= OptionalFields.HAS_SENDER_EMAIL
  if (invoice.from.physicalAddress) flags |= OptionalFields.HAS_SENDER_ADDRESS
  if (invoice.from.phone) flags |= OptionalFields.HAS_SENDER_PHONE
  if (invoice.client.walletAddress) flags |= OptionalFields.HAS_CLIENT_WALLET
  if (invoice.client.email) flags |= OptionalFields.HAS_CLIENT_EMAIL
  if (invoice.client.physicalAddress) flags |= OptionalFields.HAS_CLIENT_ADDRESS
  if (invoice.client.phone) flags |= OptionalFields.HAS_CLIENT_PHONE
  if (invoice.tax) flags |= OptionalFields.HAS_TAX
  if (invoice.discount) flags |= OptionalFields.HAS_DISCOUNT
  if (useLzCompression) flags |= OptionalFields.USE_LZ_COMPRESSION

  // Write flags (2 bytes)
  buffer.push((flags >> 8) & 0xff)
  buffer.push(flags & 0xff)

  // 3. Invoice ID (UUID -> 16 bytes)
  const idBytes = uuidToBytes(invoice.invoiceId)
  buffer.push(...Array.from(idBytes))

  // 4. Issue Date (4 bytes, Unix timestamp)
  writeUInt32(buffer, invoice.issuedAt)

  // 5. Due Date as DELTA (varint - typically 1-3 bytes)
  const dueDelta = invoice.dueAt - invoice.issuedAt
  writeVarInt(buffer, dueDelta)

  // 6. Notes (if flag set)
  if (flags & OptionalFields.HAS_NOTES) {
    writeString(buffer, invoice.notes!)
  }

  // 7. Network Chain ID (varint)
  writeVarInt(buffer, invoice.networkId)

  // 8. Currency Symbol (with dictionary)
  writeStringWithDict(buffer, invoice.currency, CURRENCY_DICT)

  // 9. Token Address (if flag set, with dictionary)
  if (flags & OptionalFields.HAS_TOKEN) {
    writeOptionalAddressWithDict(buffer, invoice.tokenAddress)
  }

  // 10. Decimals (varint)
  writeVarInt(buffer, invoice.decimals)

  // 11. Sender Info
  writeString(buffer, invoice.from.name)
  const senderAddressBytes = addressToBytes(invoice.from.walletAddress)
  buffer.push(...Array.from(senderAddressBytes))

  if (flags & OptionalFields.HAS_SENDER_EMAIL) writeString(buffer, invoice.from.email!)
  if (flags & OptionalFields.HAS_SENDER_ADDRESS) writeString(buffer, invoice.from.physicalAddress!)
  if (flags & OptionalFields.HAS_SENDER_PHONE) writeString(buffer, invoice.from.phone!)

  // 12. Client Info
  writeString(buffer, invoice.client.name)

  if (flags & OptionalFields.HAS_CLIENT_WALLET) {
    const clientAddressBytes = addressToBytes(invoice.client.walletAddress!)
    buffer.push(...Array.from(clientAddressBytes))
  }

  if (flags & OptionalFields.HAS_CLIENT_EMAIL) writeString(buffer, invoice.client.email!)
  if (flags & OptionalFields.HAS_CLIENT_ADDRESS) writeString(buffer, invoice.client.physicalAddress!)
  if (flags & OptionalFields.HAS_CLIENT_PHONE) writeString(buffer, invoice.client.phone!)

  // 13. Line Items (count + items)
  writeVarInt(buffer, invoice.items.length)
  for (const item of invoice.items) {
    // Description (no dictionary - descriptions are too varied)
    writeString(buffer, item.description)

    // Quantity (as string or number, store as string)
    const qtyStr = typeof item.quantity === 'number' ? item.quantity.toString() : item.quantity
    writeString(buffer, qtyStr)

    // Rate (string)
    writeString(buffer, item.rate)
  }

  // 14. Tax (if flag set)
  if (flags & OptionalFields.HAS_TAX) {
    writeString(buffer, invoice.tax!)
  }

  // 15. Discount (if flag set)
  if (flags & OptionalFields.HAS_DISCOUNT) {
    writeString(buffer, invoice.discount!)
  }

  // Convert to Uint8Array
  let bytes = new Uint8Array(buffer)

  // // 16. Apply LZ compression pass if enabled
  // if (useLzCompression) {
  //   // Convert bytes to Base64, compress, then to base62
  //   const base64 = btoa(String.fromCharCode(...Array.from(bytes)));
  //   const compressed = compress(base64);
  //   // Mark as compressed in the result
  //   return 'L' + compressed; // 'L' prefix = LZ-compressed
  // }

  // 17. Encode to Base62
  return 'B' + encodeBase62(bytes) // 'B' prefix = Binary only
}

/**
 * Get encoded size in bytes (for debugging/stats)
 */
export function getBinarySizeV2(invoice: InvoiceSchemaV1, useLzCompression = true): number {
  const encoded = encodeBinaryV2(invoice, useLzCompression)
  // Remove prefix and decode
  const withoutPrefix = encoded.substring(1)

  if (encoded[0] === 'L') {
    // LZ compressed - estimate from compressed length
    return new TextEncoder().encode(withoutPrefix).length
  }

  // Binary only
  const { decodeBase62 } = require('./base62')
  const decoded = decodeBase62(withoutPrefix)
  return decoded.length
}
