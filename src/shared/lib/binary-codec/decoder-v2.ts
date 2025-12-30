/**
 * Binary Invoice Decoder V2
 *
 * Decodes V2 enhanced binary format with:
 * - Bit-packed flags
 * - Dictionary decompression
 * - Delta-encoded dates
 * - Optional LZ decompression pass
 */

import { InvoiceSchemaV2 } from '@/entities/invoice/model/schema-v2'
import { decodeBase62 } from './base62'
import { decompress } from '@/shared/lib/compression'
import { bytesToUuid, bytesToAddress, readUInt32, readVarInt, readString } from './utils'
import { CURRENCY_DICT_REVERSE, TOKEN_DICT_REVERSE, decodeDictString } from './dictionary'

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
  const mode = bytes[offset] ?? 0

  if (mode === 0) {
    // Dictionary mode
    const code = bytes[offset + 1] ?? 0
    const value = decodeDictString(code, dict)
    if (value === null) {
      throw new Error(`Invalid dictionary code: ${code}`)
    }
    return { value, bytesRead: 2 }
  } else {
    // Raw string mode
    const result = readString(bytes, offset + 1)
    return { value: result.value, bytesRead: result.bytesRead + 1 }
  }
}

/**
 * Reads an optional address with dictionary support
 */
function readOptionalAddressWithDict(
  bytes: Uint8Array,
  offset: number
): { value: string; bytesRead: number } {
  const mode = bytes[offset] ?? 0

  if (mode === 0) {
    // Dictionary mode
    const code = bytes[offset + 1] ?? 0
    const value = TOKEN_DICT_REVERSE[code]
    if (!value) {
      throw new Error(`Invalid token dictionary code: ${code}`)
    }
    return { value, bytesRead: 2 }
  } else {
    // Raw address mode
    const addressBytes = bytes.slice(offset + 1, offset + 21)
    const value = bytesToAddress(addressBytes)
    return { value, bytesRead: 21 }
  }
}

/**
 * Decodes a V2 binary-encoded invoice
 */
export function decodeBinaryV2(encoded: string): InvoiceSchemaV2 {
  // Check prefix
  const prefix = encoded[0]
  const data = encoded.substring(1)

  let bytes: Uint8Array

  if (prefix === 'L') {
    // LZ-compressed
    const decompressed = decompress(data)
    if (!decompressed) {
      throw new Error('Failed to decompress V2 invoice data')
    }
    // Convert base64 back to bytes
    const binaryString = atob(decompressed)
    bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
  } else if (prefix === 'B') {
    // Binary only
    bytes = decodeBase62(data)
  } else {
    throw new Error(`Invalid V2 prefix: ${prefix}`)
  }

  let offset = 0

  // Helper to advance offset
  const read = <T extends { bytesRead: number; value: any }>(fn: () => T): T['value'] => {
    const result = fn()
    offset += result.bytesRead
    return result.value
  }

  // 1. Version (should be 2)
  const version = bytes[offset++] ?? 0
  if (version !== 2) {
    throw new Error(`Expected V2 schema, got version: ${version}`)
  }

  // 2. Bit flags (2 bytes)
  const flagsHigh = bytes[offset++] ?? 0
  const flagsLow = bytes[offset++] ?? 0
  const flags = (flagsHigh << 8) | flagsLow

  // 3. Invoice ID (16 bytes UUID)
  const idBytes = bytes.slice(offset, offset + 16)
  const invoiceId = bytesToUuid(idBytes)
  offset += 16

  // 4. Issue Date (4 bytes)
  const issuedAt = read(() => readUInt32(bytes, offset))

  // 5. Due Date as DELTA (varint)
  const dueDelta = read(() => readVarInt(bytes, offset))
  const dueAt = issuedAt + dueDelta

  // 6. Notes (if flag set)
  const notes = flags & OptionalFields.HAS_NOTES ? read(() => readString(bytes, offset)) : undefined

  // 7. Network Chain ID (varint)
  const networkId = read(() => readVarInt(bytes, offset))

  // 8. Currency Symbol (with dictionary)
  const currency = read(() => readStringWithDict(bytes, offset, CURRENCY_DICT_REVERSE))

  // 9. Token Address (if flag set, with dictionary)
  const tokenAddress =
    flags & OptionalFields.HAS_TOKEN
      ? read(() => readOptionalAddressWithDict(bytes, offset))
      : undefined

  // 10. Decimals (varint)
  const decimals = read(() => readVarInt(bytes, offset))

  // 11. Sender Info
  const from = {
    name: read(() => readString(bytes, offset)),
    walletAddress: bytesToAddress(bytes.slice(offset, offset + 20)),
    email: undefined as string | undefined,
    physicalAddress: undefined as string | undefined,
    phone: undefined as string | undefined,
  }
  offset += 20

  if (flags & OptionalFields.HAS_SENDER_EMAIL) {
    from.email = read(() => readString(bytes, offset))
  }
  if (flags & OptionalFields.HAS_SENDER_ADDRESS) {
    from.physicalAddress = read(() => readString(bytes, offset))
  }
  if (flags & OptionalFields.HAS_SENDER_PHONE) {
    from.phone = read(() => readString(bytes, offset))
  }

  // 12. Client Info
  const client = {
    name: read(() => readString(bytes, offset)),
    walletAddress: undefined as string | undefined,
    email: undefined as string | undefined,
    physicalAddress: undefined as string | undefined,
    phone: undefined as string | undefined,
  }

  if (flags & OptionalFields.HAS_CLIENT_WALLET) {
    client.walletAddress = bytesToAddress(bytes.slice(offset, offset + 20))
    offset += 20
  }

  if (flags & OptionalFields.HAS_CLIENT_EMAIL) {
    client.email = read(() => readString(bytes, offset))
  }
  if (flags & OptionalFields.HAS_CLIENT_ADDRESS) {
    client.physicalAddress = read(() => readString(bytes, offset))
  }
  if (flags & OptionalFields.HAS_CLIENT_PHONE) {
    client.phone = read(() => readString(bytes, offset))
  }

  // 13. Line Items (no dictionary for descriptions)
  const itemCount = read(() => readVarInt(bytes, offset))
  const items: Array<{ description: string; quantity: string | number; rate: string }> = []

  for (let i = 0; i < itemCount; i++) {
    const description = read(() => readString(bytes, offset))
    const qStr = read(() => readString(bytes, offset))
    const rate = read(() => readString(bytes, offset))

    // Try to parse quantity as number if possible
    const qNum = parseFloat(qStr)
    const quantity = !isNaN(qNum) && qNum.toString() === qStr ? qNum : qStr

    items.push({ description, quantity, rate })
  }

  // 14. Tax (if flag set)
  const tax = flags & OptionalFields.HAS_TAX ? read(() => readString(bytes, offset)) : undefined

  // 15. Discount (if flag set)
  const discount =
    flags & OptionalFields.HAS_DISCOUNT ? read(() => readString(bytes, offset)) : undefined

  // Construct the invoice object
  const invoice: InvoiceSchemaV2 = {
    version: 2,
    invoiceId,
    issuedAt,
    dueAt,
    notes,
    networkId,
    currency,
    tokenAddress,
    decimals,
    from,
    client,
    items,
    tax,
    discount,
  }

  return invoice
}
