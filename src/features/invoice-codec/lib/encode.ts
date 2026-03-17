import type { Invoice } from '@/entities/invoice'
import type { TlvRecord, CompressedField } from '@/shared/lib/tlv-codec'
import {
  writeTlv,
  sortCanonical,
  encodeBase62,
  writeVarInt,
  writeBigIntVarInt,
  groupedDeflate,
} from '@/shared/lib/tlv-codec'
import { getAppBaseUrl } from '@/shared/config'
import { encodeOGPreview } from './og-preview'
import { TlvType, encodeCurrency, encodeTokenAddress, COMPRESSED_TEXT_WHITELIST } from './tlv-map'
import { generateSalt, computeDomainSeparator } from './security'

/** Encode a UTF-8 string to Uint8Array */
function utf8(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/** Encode an Ethereum address (0x-prefixed hex) to 20 raw bytes */
function addressToBytes(address: string): Uint8Array {
  const hex = address.startsWith('0x') ? address.slice(2) : address
  const bytes = new Uint8Array(20)
  for (let i = 0; i < 20; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/** Encode a uint32 as 4 bytes big-endian */
function uint32BE(value: number): Uint8Array {
  const bytes = new Uint8Array(4)
  bytes[0] = (value >>> 24) & 0xff
  bytes[1] = (value >>> 16) & 0xff
  bytes[2] = (value >>> 8) & 0xff
  bytes[3] = value & 0xff
  return bytes
}

/** Encode a varint into a Uint8Array */
function varintBytes(value: number): Uint8Array {
  const buf: number[] = []
  writeVarInt(buf, value)
  return new Uint8Array(buf)
}

/** Encode a BigInt varint into a Uint8Array */
function bigintVarintBytes(value: bigint): Uint8Array {
  const buf: number[] = []
  writeBigIntVarInt(buf, value)
  return new Uint8Array(buf)
}

/** Pack line items into binary format for Type 14 (ITEMS) */
function packItems(items: Invoice['items']): Uint8Array {
  const buf: number[] = []
  writeVarInt(buf, items.length)
  for (const item of items) {
    // description: [len: varint] [utf8 bytes]
    const descBytes = utf8(item.description)
    writeVarInt(buf, descBytes.length)
    for (const b of descBytes) buf.push(b)
    // quantity: 4 bytes float32 BE
    const qtyView = new DataView(new ArrayBuffer(4))
    qtyView.setFloat32(0, item.quantity, false)
    for (let i = 0; i < 4; i++) buf.push(qtyView.getUint8(i))
    // rate: [len: varint] [BigInt varint bytes]
    const rateBytes = bigintVarintBytes(BigInt(item.rate || '0'))
    writeVarInt(buf, rateBytes.length)
    for (const b of rateBytes) buf.push(b)
  }
  return new Uint8Array(buf)
}

/**
 * Encodes an invoice into a TLV v1 compressed string.
 * Uses binary TLV format with salt, compression, and domain separator.
 *
 * @param invoice The invoice data to encode
 * @returns The Base62-encoded binary string (no prefix — magic byte is inside)
 */
export function encodeInvoice(invoice: Invoice): string {
  const records: TlvRecord[] = []

  // --- Required fields (even types) ---
  records.push({ type: TlvType.CHAIN_ID, value: varintBytes(invoice.networkId) })
  records.push({ type: TlvType.ISSUED_AT, value: uint32BE(invoice.issuedAt) })
  records.push({ type: TlvType.DUE_AT, value: uint32BE(invoice.dueAt) })
  records.push({ type: TlvType.DECIMALS, value: new Uint8Array([invoice.decimals]) })
  records.push({ type: TlvType.FROM_WALLET, value: addressToBytes(invoice.from.walletAddress) })

  // Currency (Type 12): prefix 0x00=dict, 0x01=raw UTF-8
  const currCode = encodeCurrency(invoice.currency)
  if (currCode !== null) {
    records.push({ type: TlvType.CURRENCY, value: new Uint8Array([0x00, currCode]) })
  } else {
    const rawCurr = utf8(invoice.currency)
    const val = new Uint8Array(1 + rawCurr.length)
    val[0] = 0x01
    val.set(rawCurr, 1)
    records.push({ type: TlvType.CURRENCY, value: val })
  }

  // Items (Type 14): packed binary
  records.push({ type: TlvType.ITEMS, value: packItems(invoice.items) })

  // InvoiceId (Type 22): UTF-8 — individual TLV, NOT compressed
  records.push({ type: TlvType.INVOICE_ID, value: utf8(invoice.invoiceId) })

  // Salt (Type 20): 16 random bytes
  const salt = generateSalt()
  records.push({ type: TlvType.SALT, value: salt })

  // --- Compressible text fields ---
  const textFields: CompressedField[] = []

  // FROM_NAME (Type 16) — required, always present
  textFields.push({ typeId: TlvType.FROM_NAME, value: utf8(invoice.from.name) })

  // CLIENT_NAME (Type 18) — required, always present
  textFields.push({ typeId: TlvType.CLIENT_NAME, value: utf8(invoice.client.name) })

  // Optional text fields
  if (invoice.notes) {
    textFields.push({ typeId: TlvType.NOTES, value: utf8(invoice.notes) })
  }
  if (invoice.from.email) {
    textFields.push({ typeId: TlvType.FROM_EMAIL, value: utf8(invoice.from.email) })
  }
  if (invoice.from.phone) {
    textFields.push({ typeId: TlvType.FROM_PHONE, value: utf8(invoice.from.phone) })
  }
  if (invoice.from.physicalAddress) {
    textFields.push({ typeId: TlvType.FROM_ADDRESS, value: utf8(invoice.from.physicalAddress) })
  }
  if (invoice.from.taxId) {
    textFields.push({ typeId: TlvType.FROM_TAX_ID, value: utf8(invoice.from.taxId) })
  }
  if (invoice.client.email) {
    textFields.push({ typeId: TlvType.CLIENT_EMAIL, value: utf8(invoice.client.email) })
  }
  if (invoice.client.phone) {
    textFields.push({ typeId: TlvType.CLIENT_PHONE, value: utf8(invoice.client.phone) })
  }
  if (invoice.client.physicalAddress) {
    textFields.push({ typeId: TlvType.CLIENT_ADDRESS, value: utf8(invoice.client.physicalAddress) })
  }
  if (invoice.client.taxId) {
    textFields.push({ typeId: TlvType.CLIENT_TAX_ID, value: utf8(invoice.client.taxId) })
  }

  // Try grouped compression — only whitelisted types
  const compressibleFields = textFields.filter((f) => COMPRESSED_TEXT_WHITELIST.has(f.typeId))
  const nonCompressibleFields = textFields.filter((f) => !COMPRESSED_TEXT_WHITELIST.has(f.typeId))

  // Non-compressible text fields (FROM_NAME=16, CLIENT_NAME=18 are even/required) go as individual TLVs
  for (const field of nonCompressibleFields) {
    records.push({ type: field.typeId, value: field.value })
  }

  const compressed = compressibleFields.length > 0 ? groupedDeflate(compressibleFields) : null
  if (compressed) {
    records.push({ type: TlvType.COMPRESSED_TEXT, value: compressed })
  } else {
    // Compression not beneficial — add individual TLVs
    for (const field of compressibleFields) {
      records.push({ type: field.typeId, value: field.value })
    }
  }

  // --- Optional non-text fields (odd types) ---
  if (invoice.tokenAddress) {
    const tokenEntry = encodeTokenAddress(invoice.tokenAddress)
    if (tokenEntry) {
      records.push({ type: TlvType.TOKEN_ADDRESS, value: new Uint8Array([0x00, tokenEntry.code]) })
    } else {
      const rawAddr = addressToBytes(invoice.tokenAddress)
      const val = new Uint8Array(1 + 20)
      val[0] = 0x01
      val.set(rawAddr, 1)
      records.push({ type: TlvType.TOKEN_ADDRESS, value: val })
    }
  }

  if (invoice.client.walletAddress) {
    records.push({ type: TlvType.CLIENT_WALLET, value: addressToBytes(invoice.client.walletAddress) })
  }

  if (invoice.tax) {
    records.push({ type: TlvType.TAX, value: utf8(invoice.tax) })
  }
  if (invoice.discount) {
    records.push({ type: TlvType.DISCOUNT, value: utf8(invoice.discount) })
  }
  if (invoice.total) {
    records.push({ type: TlvType.TOTAL, value: bigintVarintBytes(BigInt(invoice.total)) })
  }
  if (invoice.magicDust) {
    records.push({ type: TlvType.MAGIC_DUST, value: bigintVarintBytes(BigInt(invoice.magicDust)) })
  }

  // --- Sort canonical ---
  const sorted = sortCanonical(records)

  // --- Domain separator (Type 31) ---
  const domainSep = computeDomainSeparator(sorted)
  sorted.push({ type: TlvType.DOMAIN_SEPARATOR, value: domainSep })

  // Re-sort after adding domain separator
  const finalRecords = sortCanonical(sorted)

  // --- Serialize ---
  const bytes = writeTlv(finalRecords)
  return encodeBase62(bytes)
}

/**
 * URL generation options.
 */
export interface GenerateUrlOptions {
  /** Base URL override (default: from NEXT_PUBLIC_APP_URL env) */
  baseUrl?: string
  /** Include OG preview data for social sharing (default: false) */
  includeOG?: boolean
}

/**
 * Generates a shareable URL for the invoice using hash fragment.
 * Hash fragments are never sent to the server (Privacy-First principle).
 * Validates that the final URL does not exceed 2000 bytes.
 */
export function generateInvoiceUrl(
  invoice: Invoice,
  options: GenerateUrlOptions | string = {}
): string {
  const opts: GenerateUrlOptions = typeof options === 'string' ? { baseUrl: options } : options

  const compressed = encodeInvoice(invoice)
  const appUrl = opts.baseUrl ?? getAppBaseUrl()

  let finalUrl: string

  if (opts.includeOG) {
    const ogData = encodeOGPreview(invoice)
    finalUrl = `${appUrl}/pay?og=${ogData}#${compressed}`
  } else {
    finalUrl = `${appUrl}/pay#${compressed}`
  }

  const byteSize = new TextEncoder().encode(finalUrl).length

  if (byteSize > 2000) {
    throw new Error(`URL size (${byteSize} bytes) exceeds 2000 byte limit`)
  }

  return finalUrl
}
