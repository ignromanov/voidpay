/**
 * Binary Invoice Encoder
 *
 * Packs InvoiceSchemaV2 into a compact binary format:
 * - UUID -> 16 bytes
 * - Ethereum addresses -> 20 bytes
 * - Timestamps -> 4 bytes (UInt32)
 * - Small numbers -> Varint
 * - Strings -> Length-prefixed UTF-8
 * - Optional fields -> 1 byte flag
 *
 * Final encoding: Uint8Array -> Base62 string
 */

import { InvoiceSchemaV2 } from '@/entities/invoice/model/schema-v2'
import { encodeBase62 } from './base62'
import {
  uuidToBytes,
  addressToBytes,
  writeUInt32,
  writeVarInt,
  writeString,
  writeOptionalString,
  writeOptionalAddress,
} from './utils'

/**
 * Encodes an invoice into a compact binary format and returns Base62 string
 */
export function encodeBinary(invoice: InvoiceSchemaV2): string {
  const buffer: number[] = []

  // 1. Version (1 byte)
  buffer.push(invoice.version)

  // 2. Invoice ID (UUID -> 16 bytes)
  const idBytes = uuidToBytes(invoice.invoiceId)
  buffer.push(...Array.from(idBytes))

  // 3. Issue Date (4 bytes, Unix timestamp)
  writeUInt32(buffer, invoice.issuedAt)

  // 4. Due Date (4 bytes, Unix timestamp)
  writeUInt32(buffer, invoice.dueAt)

  // 5. Notes (optional string)
  writeOptionalString(buffer, invoice.notes)

  // 6. Network Chain ID (varint - typically small like 1, 137)
  writeVarInt(buffer, invoice.networkId)

  // 7. Currency Symbol (length-prefixed string)
  writeString(buffer, invoice.currency)

  // 8. Token Address (optional 20 bytes)
  writeOptionalAddress(buffer, invoice.tokenAddress)

  // 9. Decimals (varint)
  writeVarInt(buffer, invoice.decimals)

  // 10. Sender Info
  writeString(buffer, invoice.from.name)
  const senderAddressBytes = addressToBytes(invoice.from.walletAddress)
  buffer.push(...Array.from(senderAddressBytes))
  writeOptionalString(buffer, invoice.from.email)
  writeOptionalString(buffer, invoice.from.physicalAddress)
  writeOptionalString(buffer, invoice.from.phone)

  // 11. Client Info
  writeString(buffer, invoice.client.name)
  writeOptionalAddress(buffer, invoice.client.walletAddress)
  writeOptionalString(buffer, invoice.client.email)
  writeOptionalString(buffer, invoice.client.physicalAddress)
  writeOptionalString(buffer, invoice.client.phone)

  // 12. Line Items (count + items)
  writeVarInt(buffer, invoice.items.length)
  for (const item of invoice.items) {
    writeString(buffer, item.description)

    // Quantity (as string or number, store as string)
    const qtyStr = typeof item.quantity === 'number' ? item.quantity.toString() : item.quantity
    writeString(buffer, qtyStr)

    // Rate (string)
    writeString(buffer, item.rate)
  }

  // 13. Tax (optional string)
  writeOptionalString(buffer, invoice.tax)

  // 14. Discount (optional string)
  writeOptionalString(buffer, invoice.discount)

  // 15. Meta (skip for now - reserved for future)
  // 16. _future (skip for now - reserved for future)

  // Convert to Uint8Array and encode to Base62
  const bytes = new Uint8Array(buffer)
  return encodeBase62(bytes)
}

/**
 * Get encoded size in bytes (for debugging/stats)
 */
export function getBinarySize(invoice: InvoiceSchemaV2): number {
  const encoded = encodeBinary(invoice)
  const decoded = decodeBase62ToBytes(encoded)
  return decoded.length
}

/**
 * Helper to decode Base62 back to bytes (for size calculation)
 */
function decodeBase62ToBytes(str: string): Uint8Array {
  const { decodeBase62 } = require('./base62')
  return decodeBase62(str)
}
