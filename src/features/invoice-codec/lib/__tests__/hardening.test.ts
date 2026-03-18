/**
 * Hardening tests — encoder/decoder rejects malicious or malformed inputs.
 */
import { describe, it, expect } from 'vitest'
import { encodeInvoice } from '../encode'
import { decodeInvoice } from '../decode'
import type { Invoice } from '@/entities/invoice'
import {
  decodeBase62,
  encodeBase62,
  writeTlv,
  sortCanonical,
  groupedDeflate,
} from '@/shared/lib/tlv-codec'
import { TlvType, TOKEN_DICT } from '../tlv-map'
import { generateSalt, computeDomainSeparator } from '../security'
import pako from 'pako'
import { writeVarInt } from '@/shared/lib/tlv-codec'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTestInvoice(): Invoice {
  return {
    invoiceId: 'HARD-001',
    issuedAt: 1704067200,
    dueAt: 1706745600,
    networkId: 1,
    currency: 'USDC',
    decimals: 6,
    from: {
      name: 'Hardening Sender',
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
    client: {
      name: 'Hardening Client',
    },
    items: [{ description: 'Hardening service', quantity: 1, rate: '100000000' }],
    total: '100000000',
  }
}

// ---------------------------------------------------------------------------
// 1. Decoder rejects truncated binary
// ---------------------------------------------------------------------------

describe('hardening: truncated binary', () => {
  it('throws when encoded binary is truncated to half length', () => {
    const encoded = encodeInvoice(createTestInvoice())
    const bytes = decodeBase62(encoded)
    const truncated = bytes.slice(0, Math.floor(bytes.length / 2))
    const reEncoded = encodeBase62(truncated)

    expect(() => decodeInvoice(reEncoded)).toThrow()
  })
})

// ---------------------------------------------------------------------------
// 2. Decoder rejects random bytes (prepend valid magic byte)
// ---------------------------------------------------------------------------

describe('hardening: random bytes', () => {
  it('throws on random payload with valid magic byte prepended', () => {
    // Build 32 pseudo-random bytes after the magic/version header
    const random = new Uint8Array(32)
    for (let i = 0; i < 32; i++) {
      random[i] = (i * 137 + 42) & 0xff
    }
    // Prepend magic (0x56) and version (0x01) so the header looks valid
    const payload = new Uint8Array(2 + random.length)
    payload[0] = 0x56 // MAGIC
    payload[1] = 0x01 // VERSION
    payload.set(random, 2)

    const encoded = encodeBase62(payload)
    expect(() => decodeInvoice(encoded)).toThrow()
  })
})

// ---------------------------------------------------------------------------
// 3. Decoder rejects empty input
// ---------------------------------------------------------------------------

describe('hardening: empty input', () => {
  it('throws on empty string', () => {
    expect(() => decodeInvoice('')).toThrow('Empty invoice data')
  })
})

// ---------------------------------------------------------------------------
// 4. Type 253 whitelist: reject spoofed type_id
// ---------------------------------------------------------------------------

describe('hardening: type 253 whitelist — reject spoofed type_id', () => {
  it('throws when compressed block contains non-whitelisted type_id (CHAIN_ID=2)', () => {
    // Build a valid full invoice binary, then replace (or inject) the
    // COMPRESSED_TEXT (Type 253) TLV with a crafted block containing type_id=2.
    //
    // Strategy:
    // 1. Encode a valid invoice to get the correct binary skeleton.
    // 2. Parse the TLV records.
    // 3. Build a crafted compressed block: [field_count=1][type_id=2][len][value]
    //    with enough padding so pako actually compresses it (>= 100 bytes raw).
    // 4. Replace/inject Type 253 TLV into the records, re-serialize, re-encode.

    // Step 1: Build minimal but valid records manually (same as encodeInvoice does)
    function utf8(s: string): Uint8Array {
      return new TextEncoder().encode(s)
    }
    function addressToBytes(address: string): Uint8Array {
      const hex = address.startsWith('0x') ? address.slice(2) : address
      const bytes = new Uint8Array(20)
      for (let i = 0; i < 20; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
      }
      return bytes
    }
    function uint32BE(value: number): Uint8Array {
      const b = new Uint8Array(4)
      b[0] = (value >>> 24) & 0xff
      b[1] = (value >>> 16) & 0xff
      b[2] = (value >>> 8) & 0xff
      b[3] = value & 0xff
      return b
    }

    const inv = createTestInvoice()
    const salt = generateSalt()

    // Craft a compressed block that contains type_id=2 (CHAIN_ID, not whitelisted).
    // Format: [field_count: uint8] [type_id: uint8] [value_len: varint] [value: bytes]
    // We need raw >= 100 bytes to pass pako's compression threshold in groupedDeflate,
    // so we pad the value with zeroes.
    const paddedValue = new Uint8Array(120).fill(0x41) // 120 'A' bytes
    const rawParts: number[] = [1] // field_count = 1
    rawParts.push(TlvType.CHAIN_ID) // type_id = 2 (non-whitelisted, even type)
    writeVarInt(rawParts, paddedValue.length)
    for (const b of paddedValue) rawParts.push(b)

    const raw = new Uint8Array(rawParts)
    const spoofedCompressed = pako.deflate(raw)

    // Build valid TLV records without COMPRESSED_TEXT
    const records = [
      { type: TlvType.CHAIN_ID, value: new Uint8Array([0x01]) },           // chainId=1 (varint)
      { type: TlvType.ISSUED_AT, value: uint32BE(inv.issuedAt) },
      { type: TlvType.DUE_AT, value: uint32BE(inv.dueAt) },
      { type: TlvType.DECIMALS, value: new Uint8Array([inv.decimals]) },
      { type: TlvType.FROM_WALLET, value: addressToBytes(inv.from.walletAddress) },
      { type: TlvType.CURRENCY, value: new Uint8Array([0x00, 1]) },        // USDC dict code=1
      { type: TlvType.ITEMS, value: (() => {
        // pack 1 item: [count=1][descLen][desc][qty float32][rateLen][rate varint]
        const buf: number[] = [1] // count
        const desc = utf8(inv.items[0]!.description)
        writeVarInt(buf, desc.length)
        for (const b of desc) buf.push(b)
        // qty = 1.0 as float32 BE
        const qtyView = new DataView(new ArrayBuffer(4))
        qtyView.setFloat32(0, 1.0, false)
        for (let i = 0; i < 4; i++) buf.push(qtyView.getUint8(i))
        // rate = 100000000 as bigint varint — 1 byte for small values
        // Actually writeBigIntVarInt is not exported; use raw encoding
        // 100000000 = 0x5F5E100 — needs multi-byte varint
        let rate = BigInt(100000000)
        const rateBuf: number[] = []
        while (rate >= 128n) {
          rateBuf.push(Number((rate & 0x7fn) | 0x80n))
          rate >>= 7n
        }
        rateBuf.push(Number(rate))
        writeVarInt(buf, rateBuf.length)
        for (const b of rateBuf) buf.push(b)
        return new Uint8Array(buf)
      })() },
      { type: TlvType.FROM_NAME, value: utf8(inv.from.name) },
      { type: TlvType.CLIENT_NAME, value: utf8(inv.client.name) },
      { type: TlvType.SALT, value: salt },
      { type: TlvType.INVOICE_ID, value: utf8(inv.invoiceId) },
      // Inject the spoofed compressed block
      { type: TlvType.COMPRESSED_TEXT, value: spoofedCompressed },
    ]

    // Sort canonical and add domain separator
    const sorted = sortCanonical(records)
    const domainSep = computeDomainSeparator(sorted)
    sorted.push({ type: TlvType.DOMAIN_SEPARATOR, value: domainSep })
    const finalRecords = sortCanonical(sorted)

    const bytes = writeTlv(finalRecords)
    const encoded = encodeBase62(bytes)

    expect(() => decodeInvoice(encoded)).toThrow(/Type spoofing/)
  })
})

// ---------------------------------------------------------------------------
// 5. Encoder handles maximum items (5)
// ---------------------------------------------------------------------------

describe('hardening: maximum items', () => {
  it('encodes invoice with 5 items without error', () => {
    const invoice = createTestInvoice()
    invoice.items = Array.from({ length: 5 }, (_, i) => ({
      description: `Service item ${i + 1}`,
      quantity: i + 1,
      rate: String((i + 1) * 50000000),
    }))

    const encoded = encodeInvoice(invoice)
    const decoded = decodeInvoice(encoded)

    expect(decoded.items).toHaveLength(5)
    for (let i = 0; i < 5; i++) {
      expect(decoded.items[i]!.description).toBe(invoice.items[i]!.description)
      expect(decoded.items[i]!.rate).toBe(invoice.items[i]!.rate)
    }
  })
})

// ---------------------------------------------------------------------------
// 6. Roundtrip with dictionary token (USDC on Ethereum)
// ---------------------------------------------------------------------------

describe('hardening: roundtrip with dictionary token', () => {
  it('preserves tokenAddress for a known dict token (USDC on Ethereum)', () => {
    // USDC on Ethereum is in TOKEN_DICT — uses compact dict code
    const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    expect(TOKEN_DICT[usdcAddress]).toBeDefined()

    const invoice: Invoice = {
      ...createTestInvoice(),
      tokenAddress: usdcAddress as `0x${string}`,
    }

    const decoded = decodeInvoice(encodeInvoice(invoice))
    expect(decoded.tokenAddress?.toLowerCase()).toBe(usdcAddress.toLowerCase())
  })
})

// ---------------------------------------------------------------------------
// 7. Roundtrip with non-dictionary token
// ---------------------------------------------------------------------------

describe('hardening: roundtrip with non-dictionary token', () => {
  it('preserves tokenAddress for a custom (non-dict) token address', () => {
    const customAddress = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    expect(TOKEN_DICT[customAddress.toLowerCase()]).toBeUndefined()

    const invoice: Invoice = {
      ...createTestInvoice(),
      tokenAddress: customAddress as `0x${string}`,
    }

    const decoded = decodeInvoice(encodeInvoice(invoice))
    expect(decoded.tokenAddress?.toLowerCase()).toBe(customAddress.toLowerCase())
  })
})

// ---------------------------------------------------------------------------
// 8. Roundtrip with non-dictionary currency
// ---------------------------------------------------------------------------

describe('hardening: roundtrip with non-dictionary currency', () => {
  it('preserves currency for a custom symbol not in CURRENCY_DICT (DOGE)', () => {
    const invoice: Invoice = {
      ...createTestInvoice(),
      currency: 'DOGE',
      decimals: 8,
    }

    const decoded = decodeInvoice(encodeInvoice(invoice))
    expect(decoded.currency).toBe('DOGE')
    expect(decoded.decimals).toBe(8)
  })
})
