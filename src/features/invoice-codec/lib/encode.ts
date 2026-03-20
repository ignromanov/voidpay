import type { Invoice } from '@/entities/invoice'
import type { TlvRecord } from '@/shared/lib/tlv-codec'
import {
  writeTlv,
  sortCanonical,
  encodeBase64url,
  writeVarInt,
  writeMantissa,
  writeQuantity,
  compressPayload,
} from '@/shared/lib/tlv-codec'
import { getAppBaseUrl } from '@/shared/config'
import { encodeOGPreview } from './og-preview'
import { TlvType, encodeCurrency, encodeTokenAddress } from './tlv-map'
import { generateSalt, computeDomainSeparator } from './security'
import { encodeChainId } from './chain-dict'
import { applyDict } from './app-dict'

/** Encode a UTF-8 string to Uint8Array */
function utf8(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/** Encode an Ethereum address (0x-prefixed hex) to 20 raw bytes */
function addressToBytes(address: string): Uint8Array {
  const hex = address.startsWith('0x') ? address.slice(2) : address
  if (hex.length !== 40 || !/^[0-9a-fA-F]{40}$/.test(hex)) {
    throw new Error(`Invalid address: ${address}`)
  }
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

/** Encode a BigInt as mantissa + trailing zeros into a Uint8Array */
function mantissaBytes(value: bigint): Uint8Array {
  const buf: number[] = []
  writeMantissa(buf, value)
  return new Uint8Array(buf)
}

/** Pack line items into binary format for Type 14 (ITEMS) */
function packItems(items: Invoice['items']): Uint8Array {
  const buf: number[] = []
  writeVarInt(buf, items.length)
  for (const item of items) {
    // description: [len: varint] [utf8 bytes] (app-dict applied for better compression)
    const descBytes = applyDict(utf8(item.description))
    writeVarInt(buf, descBytes.length)
    for (let i = 0; i < descBytes.length; i++) buf.push(descBytes[i]!)
    // quantity: scale + varint (replaces float32)
    writeQuantity(buf, item.quantity)
    // rate: mantissa + trailing_zeros (replaces length-prefixed BigInt varint)
    writeMantissa(buf, BigInt(item.rate || '0'))
  }
  return new Uint8Array(buf)
}

/**
 * Encodes an invoice into a TLV v1 compressed string.
 * Uses binary TLV format with salt, compression, and domain separator.
 *
 * @param invoice The invoice data to encode
 * @returns The Base64url-encoded binary string (no prefix — magic byte is inside)
 */
export function encodeInvoice(invoice: Invoice): string {
  const records: TlvRecord[] = []

  // --- Required fields (even types) ---

  // chainId (Type 2): dict code for known chains, raw varint for unknown
  const chainBuf: number[] = []
  encodeChainId(chainBuf, invoice.networkId)
  records.push({ type: TlvType.CHAIN_ID, value: new Uint8Array(chainBuf) })

  records.push({ type: TlvType.ISSUED_AT, value: uint32BE(invoice.issuedAt) })

  // dueAt (Type 6): delta from issuedAt (varint)
  const dueDelta = invoice.dueAt - invoice.issuedAt
  records.push({ type: TlvType.DUE_AT, value: varintBytes(dueDelta) })

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

  // --- Text fields (individual TLVs — whole-payload Brotli handles compression) ---
  records.push({ type: TlvType.FROM_NAME, value: applyDict(utf8(invoice.from.name)) })
  records.push({ type: TlvType.CLIENT_NAME, value: applyDict(utf8(invoice.client.name)) })

  if (invoice.notes) {
    records.push({ type: TlvType.NOTES, value: applyDict(utf8(invoice.notes)) })
  }
  if (invoice.from.email) {
    records.push({ type: TlvType.FROM_EMAIL, value: applyDict(utf8(invoice.from.email)) })
  }
  if (invoice.from.phone) {
    records.push({ type: TlvType.FROM_PHONE, value: applyDict(utf8(invoice.from.phone)) })
  }
  if (invoice.from.physicalAddress) {
    records.push({ type: TlvType.FROM_ADDRESS, value: applyDict(utf8(invoice.from.physicalAddress)) })
  }
  if (invoice.from.taxId) {
    records.push({ type: TlvType.FROM_TAX_ID, value: applyDict(utf8(invoice.from.taxId)) })
  }
  if (invoice.client.email) {
    records.push({ type: TlvType.CLIENT_EMAIL, value: applyDict(utf8(invoice.client.email)) })
  }
  if (invoice.client.phone) {
    records.push({ type: TlvType.CLIENT_PHONE, value: applyDict(utf8(invoice.client.phone)) })
  }
  if (invoice.client.physicalAddress) {
    records.push({ type: TlvType.CLIENT_ADDRESS, value: applyDict(utf8(invoice.client.physicalAddress)) })
  }
  if (invoice.client.taxId) {
    records.push({ type: TlvType.CLIENT_TAX_ID, value: applyDict(utf8(invoice.client.taxId)) })
  }

  // --- Optional non-text fields (odd types) ---
  if (invoice.tokenAddress) {
    const tokenEntry = encodeTokenAddress(invoice.tokenAddress, invoice.networkId)
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
  if (!invoice.total) {
    throw new Error('Invoice total is required for encoding')
  }

  // Compute subtotal (total WITHOUT magicDust) — magicDust is derived from salt on decode
  const subtotal = invoice.magicDust
    ? BigInt(invoice.total) - BigInt(invoice.magicDust)
    : BigInt(invoice.total)
  records.push({ type: TlvType.TOTAL, value: mantissaBytes(subtotal) })
  // NO MAGIC_DUST record — derived from salt on decode

  // --- Sort canonical ---
  const sorted = sortCanonical(records)

  // --- Domain separator (Type 31) ---
  const domainSep = computeDomainSeparator(sorted)
  sorted.push({ type: TlvType.DOMAIN_SEPARATOR, value: domainSep })

  // Re-sort after adding domain separator
  const finalRecords = sortCanonical(sorted)

  // --- Serialize → whole-payload Brotli → Base64url ---
  const bytes = writeTlv(finalRecords)
  const compressed = compressPayload(bytes)

  return encodeBase64url(compressed)
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
