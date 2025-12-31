/**
 * Binary Codec V3 - Hybrid Strategy (Fixed)
 *
 * Combines V2 optimizations (bit-packing, delta encoding, dictionary)
 * with selective Deflate compression for text fields only when beneficial.
 *
 * V2 optimizations:
 * - Bit-packing for optional fields (2 bytes for all flags)
 * - Dictionary compression for currencies and token addresses
 * - Delta encoding for due date
 *
 * V3 addition:
 * - Selective Deflate compression: only compress text fields if beneficial
 * - Uses pako.deflate() which returns raw bytes (Uint8Array) - NO double encoding
 * - Threshold: 100 bytes (deflate adds ~10 byte header)
 */

import type { Invoice } from '@/shared/lib/invoice-types'
import { addressToBytes, writeVarInt } from './utils'
import { encodeBase62 } from './base62'
import { CURRENCY_DICT, TOKEN_DICT } from './dictionary'
import pako from 'pako'

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
  TEXT_COMPRESSED = 1 << 11, // If set, text fields are Deflate-compressed
  // Bits 12-15 reserved for future use
}

/**
 * Encodes invoice using hybrid compression strategy
 * Prefix: 'H' (Hybrid)
 */
export function encodeBinaryV3(invoice: Invoice): string {
  const buffer: number[] = []

  // 1. Version (1 byte) - Version 3
  buffer.push(3)

  // 2. Compute bit flags for optional fields
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

  // We'll set TEXT_COMPRESSED bit later after collecting text
  const flagsOffset = buffer.length
  buffer.push(0, 0) // Placeholder for flags (2 bytes)

  // 3. Invoice ID moved to text fields (user-defined string, not UUID)

  // 4. Issue timestamp -> 4 bytes (UInt32)
  const iss = invoice.issuedAt
  buffer.push((iss >>> 24) & 0xff)
  buffer.push((iss >>> 16) & 0xff)
  buffer.push((iss >>> 8) & 0xff)
  buffer.push(iss & 0xff)

  // 5. Delta encoding for due date (saves 2-3 bytes typically)
  const delta = invoice.dueAt - invoice.issuedAt
  writeVarInt(buffer, delta)

  // 6. Network ID -> varint
  writeVarInt(buffer, invoice.networkId)

  // 7. Decimals -> varint
  writeVarInt(buffer, invoice.decimals)

  // 8. Token address (optional) with dictionary support
  if (invoice.tokenAddress) {
    const tokenCode = TOKEN_DICT[invoice.tokenAddress.toLowerCase()]
    if (tokenCode !== undefined) {
      buffer.push(0) // Dictionary token
      buffer.push(tokenCode)
    } else {
      buffer.push(1) // Custom token
      const tokenBytes = addressToBytes(invoice.tokenAddress)
      buffer.push(...Array.from(tokenBytes))
    }
  }

  // 9. From wallet address -> 20 bytes
  const fromAddressBytes = addressToBytes(invoice.from.walletAddress)
  buffer.push(...Array.from(fromAddressBytes))

  // 10. Client wallet address (optional) -> 20 bytes
  if (invoice.client.walletAddress) {
    const clientAddressBytes = addressToBytes(invoice.client.walletAddress)
    buffer.push(...Array.from(clientAddressBytes))
  }

  // 11. Line items count -> varint
  writeVarInt(buffer, invoice.items.length)

  // Now collect all text fields to decide if compression is beneficial
  const textParts: string[] = []

  // Invoice ID (user-defined string, first in text fields)
  textParts.push(invoice.invoiceId)

  // Currency (with dictionary support)
  const currencyCode = CURRENCY_DICT[invoice.currency]
  if (currencyCode !== undefined) {
    textParts.push('\x01') // Dict marker
    textParts.push(String.fromCharCode(currencyCode))
  } else {
    textParts.push('\x02') // String marker
    textParts.push(invoice.currency)
  }

  // Notes (optional)
  if (invoice.notes) {
    textParts.push(invoice.notes)
  }

  // From fields
  textParts.push(invoice.from.name)
  if (invoice.from.email) textParts.push(invoice.from.email)
  if (invoice.from.physicalAddress) textParts.push(invoice.from.physicalAddress)
  if (invoice.from.phone) textParts.push(invoice.from.phone)

  // Client fields
  textParts.push(invoice.client.name)
  if (invoice.client.email) textParts.push(invoice.client.email)
  if (invoice.client.physicalAddress) textParts.push(invoice.client.physicalAddress)
  if (invoice.client.phone) textParts.push(invoice.client.phone)

  // Tax and Discount (optional)
  if (invoice.tax) textParts.push(invoice.tax)
  if (invoice.discount) textParts.push(invoice.discount)

  // Line items (all fields)
  for (const item of invoice.items) {
    textParts.push(item.description)
    const qtyStr = typeof item.quantity === 'number' ? item.quantity.toString() : item.quantity
    textParts.push(qtyStr)
    textParts.push(item.rate)
  }

  // Join all text with null separator
  const textData = textParts.join('\x00')

  // Convert to bytes
  const textEncoder = new TextEncoder()
  const rawTextBytes = textEncoder.encode(textData)

  // Decide if we should compress text
  // Deflate adds ~10 byte header, so only compress if > 100 bytes
  let finalTextBytes: Uint8Array
  let isCompressed = false

  if (rawTextBytes.length > 100) {
    try {
      // Key improvement: pako.deflate returns raw Uint8Array, NO string encoding
      const compressedBytes = pako.deflate(rawTextBytes)

      // Only use compression if it actually reduces size
      if (compressedBytes.length < rawTextBytes.length) {
        finalTextBytes = compressedBytes
        isCompressed = true
      } else {
        // Compression didn't help
        finalTextBytes = rawTextBytes
      }
    } catch (error) {
      // Fallback to raw if compression fails (log for debugging)
      console.warn('[encoder-v3] Compression failed, using uncompressed text:', error)
      finalTextBytes = rawTextBytes
    }
  } else {
    // Text too short for compression overhead
    finalTextBytes = rawTextBytes
  }

  // Update flags with compression decision
  if (isCompressed) {
    flags |= OptionalFields.TEXT_COMPRESSED
  }

  // Write flags back to buffer
  buffer[flagsOffset] = (flags >> 8) & 0xff
  buffer[flagsOffset + 1] = flags & 0xff

  // Write text data length + raw bytes (NO additional encoding)
  writeVarInt(buffer, finalTextBytes.length)
  buffer.push(...Array.from(finalTextBytes))

  // Convert to Uint8Array and encode to Base62
  const bytes = new Uint8Array(buffer)
  const encoded = encodeBase62(bytes)

  // Add prefix
  return 'H' + encoded
}
