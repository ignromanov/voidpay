/**
 * Hardening tests — encoder/decoder rejects malicious or malformed inputs.
 */
import { describe, it, expect } from 'vitest'
import { encodeInvoice } from '../encode'
import { decodeInvoice } from '../decode'
import type { Invoice } from '@/entities/invoice'
import {
  decodeBase64url,
  encodeBase64url,
  writeTlv,
  sortCanonical,
  groupedDeflate,
  writeVarInt,
  writeQuantity,
  writeMantissa,
} from '@/shared/lib/tlv-codec'
import { TlvType, TOKEN_DICT } from '../tlv-map'
import { generateSalt, computeDomainSeparator } from '../security'
import { brotliCompressSync } from 'node:zlib'

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
  it('throws when encoded binary is truncated to half length', async () => {
    const encoded = await encodeInvoice(createTestInvoice())
    const bytes = decodeBase64url(encoded)
    const truncated = bytes.slice(0, Math.floor(bytes.length / 2))
    const reEncoded = encodeBase64url(truncated)

    await expect(decodeInvoice(reEncoded)).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// 2. Decoder rejects random bytes (prepend valid magic byte)
// ---------------------------------------------------------------------------

describe('hardening: random bytes', () => {
  it('throws on random payload with valid magic byte prepended', async () => {
    // Build 32 pseudo-random bytes after the magic/version/count header
    const random = new Uint8Array(32)
    for (let i = 0; i < 32; i++) {
      random[i] = (i * 137 + 42) & 0xff
    }
    // Prepend magic (0x56), version (0x01), count (0x00) — 3-byte header
    const payload = new Uint8Array(3 + random.length)
    payload[0] = 0x56 // MAGIC
    payload[1] = 0x01 // VERSION
    payload[2] = 0x00 // COUNT
    payload.set(random, 3)

    const encoded = encodeBase64url(payload)
    await expect(decodeInvoice(encoded)).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// 3. Decoder rejects empty input
// ---------------------------------------------------------------------------

describe('hardening: empty input', () => {
  it('throws on empty string', async () => {
    await expect(decodeInvoice('')).rejects.toThrow('Empty invoice data')
  })
})

// ---------------------------------------------------------------------------
// 4. Type 253 whitelist: reject spoofed type_id
// ---------------------------------------------------------------------------

describe('hardening: type 253 whitelist — reject spoofed type_id', () => {
  it('throws when compressed block contains non-whitelisted type_id (CHAIN_ID=2)', async () => {
    // Build a valid full invoice binary, then replace (or inject) the
    // COMPRESSED_TEXT (Type 253) TLV with a crafted block containing type_id=2.
    //
    // Strategy:
    // 1. Encode a valid invoice to get the correct binary skeleton.
    // 2. Parse the TLV records.
    // 3. Build a crafted compressed block: [field_count=1][type_id=2][len][value]
    //    with enough padding so Brotli actually compresses it (>= 100 bytes raw).
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
    // We need raw >= 100 bytes to pass Brotli's compression threshold in groupedDeflate,
    // so we pad the value with zeroes.
    const paddedValue = new Uint8Array(120).fill(0x41) // 120 'A' bytes
    const rawParts: number[] = [1] // field_count = 1
    rawParts.push(TlvType.CHAIN_ID) // type_id = 2 (non-whitelisted, even type)
    writeVarInt(rawParts, paddedValue.length)
    for (const b of paddedValue) rawParts.push(b)

    const raw = new Uint8Array(rawParts)
    const spoofedCompressed = new Uint8Array(brotliCompressSync(Buffer.from(raw)))

    // Build valid TLV records without COMPRESSED_TEXT
    // chainId=1 uses dict encoding: [0x00, 0x01]
    const chainIdBuf: number[] = []
    chainIdBuf.push(0x00, 0x01) // dict prefix + code for Ethereum (chainId=1)

    // items: [count=1][descLen][desc][scale: uint8][scaled_value: varint][mantissa: bigint varint][zeros: uint8]
    const itemsBuf: number[] = [1] // count
    const desc = utf8(inv.items[0]!.description)
    writeVarInt(itemsBuf, desc.length)
    for (const b of desc) itemsBuf.push(b)
    writeQuantity(itemsBuf, 1) // quantity = 1
    writeMantissa(itemsBuf, BigInt(inv.items[0]!.rate)) // rate = 100000000n

    const records = [
      { type: TlvType.CHAIN_ID, value: new Uint8Array(chainIdBuf) },
      { type: TlvType.ISSUED_AT, value: uint32BE(inv.issuedAt) },
      { type: TlvType.DUE_AT, value: uint32BE(inv.dueAt) },
      { type: TlvType.DECIMALS, value: new Uint8Array([inv.decimals]) },
      { type: TlvType.FROM_WALLET, value: addressToBytes(inv.from.walletAddress) },
      { type: TlvType.CURRENCY, value: new Uint8Array([0x00, 1]) },        // USDC dict code=1
      { type: TlvType.ITEMS, value: new Uint8Array(itemsBuf) },
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
    const encoded = encodeBase64url(bytes)

    await expect(decodeInvoice(encoded)).rejects.toThrow(/Type spoofing/)
  })
})

// ---------------------------------------------------------------------------
// 5. Encoder handles maximum items (5)
// ---------------------------------------------------------------------------

describe('hardening: maximum items', () => {
  it('encodes invoice with 5 items without error', async () => {
    const invoice = createTestInvoice()
    invoice.items = Array.from({ length: 5 }, (_, i) => ({
      description: `Service item ${i + 1}`,
      quantity: i + 1,
      rate: String((i + 1) * 50000000),
    }))

    const encoded = await encodeInvoice(invoice)
    const decoded = await decodeInvoice(encoded)

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
  it('preserves tokenAddress for a known dict token (USDC on Ethereum)', async () => {
    // USDC on Ethereum is in TOKEN_DICT — uses compact dict code
    const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    expect(TOKEN_DICT[usdcAddress]).toBeDefined()

    const invoice: Invoice = {
      ...createTestInvoice(),
      tokenAddress: usdcAddress as `0x${string}`,
    }

    const decoded = await decodeInvoice(await encodeInvoice(invoice))
    expect(decoded.tokenAddress?.toLowerCase()).toBe(usdcAddress.toLowerCase())
  })
})

// ---------------------------------------------------------------------------
// 7. Roundtrip with non-dictionary token
// ---------------------------------------------------------------------------

describe('hardening: roundtrip with non-dictionary token', () => {
  it('preserves tokenAddress for a custom (non-dict) token address', async () => {
    const customAddress = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    expect(TOKEN_DICT[customAddress.toLowerCase()]).toBeUndefined()

    const invoice: Invoice = {
      ...createTestInvoice(),
      tokenAddress: customAddress as `0x${string}`,
    }

    const decoded = await decodeInvoice(await encodeInvoice(invoice))
    expect(decoded.tokenAddress?.toLowerCase()).toBe(customAddress.toLowerCase())
  })
})

// ---------------------------------------------------------------------------
// 8. Roundtrip with non-dictionary currency
// ---------------------------------------------------------------------------

describe('hardening: roundtrip with non-dictionary currency', () => {
  it('preserves currency for a custom symbol not in CURRENCY_DICT (DOGE)', async () => {
    const invoice: Invoice = {
      ...createTestInvoice(),
      currency: 'DOGE',
      decimals: 8,
    }

    const decoded = await decodeInvoice(await encodeInvoice(invoice))
    expect(decoded.currency).toBe('DOGE')
    expect(decoded.decimals).toBe(8)
  })
})

// ---------------------------------------------------------------------------
// 9. Dictionary validation: reject unknown codes and decimals mismatches
// ---------------------------------------------------------------------------

describe('hardening: dictionary codes and decimals cross-check', () => {
  function buildRawInvoiceRecords(overrides: {
    decimals?: number
    currency?: Uint8Array
    tokenAddress?: Uint8Array
  }) {
    const utf8 = (s: string) => new TextEncoder().encode(s)
    const addressToBytes = (address: string) => {
      const hex = address.startsWith('0x') ? address.slice(2) : address
      const bytes = new Uint8Array(20)
      for (let i = 0; i < 20; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
      }
      return bytes
    }
    const uint32BE = (value: number) => {
      const b = new Uint8Array(4)
      b[0] = (value >>> 24) & 0xff
      b[1] = (value >>> 16) & 0xff
      b[2] = (value >>> 8) & 0xff
      b[3] = value & 0xff
      return b
    }

    const inv = createTestInvoice()
    const itemsBuf: number[] = [1]
    const desc = utf8(inv.items[0]!.description)
    writeVarInt(itemsBuf, desc.length)
    for (const b of desc) itemsBuf.push(b)
    writeQuantity(itemsBuf, 1)
    writeMantissa(itemsBuf, BigInt(inv.items[0]!.rate))

    const totalBuf: number[] = []
    writeMantissa(totalBuf, BigInt(inv.total!))

    const records = [
      { type: TlvType.CHAIN_ID, value: new Uint8Array([0x00, 0x01]) },
      { type: TlvType.ISSUED_AT, value: uint32BE(inv.issuedAt) },
      { type: TlvType.DUE_AT, value: new Uint8Array([0x00]) },
      { type: TlvType.DECIMALS, value: new Uint8Array([overrides.decimals ?? inv.decimals]) },
      { type: TlvType.FROM_WALLET, value: addressToBytes(inv.from.walletAddress) },
      { type: TlvType.CURRENCY, value: overrides.currency ?? new Uint8Array([0x00, 1]) },
      { type: TlvType.ITEMS, value: new Uint8Array(itemsBuf) },
      { type: TlvType.FROM_NAME, value: utf8(inv.from.name) },
      { type: TlvType.CLIENT_NAME, value: utf8(inv.client.name) },
      { type: TlvType.SALT, value: generateSalt() },
      { type: TlvType.INVOICE_ID, value: utf8(inv.invoiceId) },
      { type: TlvType.TOTAL, value: new Uint8Array(totalBuf) },
      ...(overrides.tokenAddress
        ? [{ type: TlvType.TOKEN_ADDRESS, value: overrides.tokenAddress }]
        : []),
    ]

    const sorted = sortCanonical(records)
    const domainSep = computeDomainSeparator(sorted)
    sorted.push({ type: TlvType.DOMAIN_SEPARATOR, value: domainSep })
    return encodeBase64url(writeTlv(sortCanonical(sorted)))
  }

  it('throws on unknown token dictionary code (0x00, 0xfe)', async () => {
    const encoded = buildRawInvoiceRecords({ tokenAddress: new Uint8Array([0x00, 0xfe]) })
    await expect(decodeInvoice(encoded)).rejects.toThrow(/Unknown token dictionary code: 254/)
  })

  it('throws when token dictionary decimals mismatch Type 8 DECIMALS', async () => {
    // Code 1 = Ethereum USDC (6 decimals), but DECIMALS is tampered to 18
    const encoded = buildRawInvoiceRecords({
      decimals: 18,
      tokenAddress: new Uint8Array([0x00, 1]),
    })
    await expect(decodeInvoice(encoded)).rejects.toThrow(/Token decimals mismatch/)
  })

  it('throws on unknown currency dictionary code (0x00, 0xfe)', async () => {
    const encoded = buildRawInvoiceRecords({ currency: new Uint8Array([0x00, 0xfe]) })
    await expect(decodeInvoice(encoded)).rejects.toThrow(/Unknown currency dictionary code: 254/)
  })

  it('throws when currency dictionary record is not exactly 2 bytes', async () => {
    const encoded = buildRawInvoiceRecords({ currency: new Uint8Array([0x00, 1, 2]) })
    await expect(decodeInvoice(encoded)).rejects.toThrow(/Invalid currency dictionary record length/)
  })

  it('throws on empty raw currency symbol (0x01 prefix only)', async () => {
    const encoded = buildRawInvoiceRecords({ currency: new Uint8Array([0x01]) })
    await expect(decodeInvoice(encoded)).rejects.toThrow(/Empty raw currency symbol/)
  })

  it('throws on unknown currency prefix byte', async () => {
    const encoded = buildRawInvoiceRecords({ currency: new Uint8Array([0x02, 1]) })
    await expect(decodeInvoice(encoded)).rejects.toThrow(/Invalid currency prefix byte: 0x2/)
  })

  it('throws when token dictionary record is not exactly 2 bytes', async () => {
    const encoded = buildRawInvoiceRecords({ tokenAddress: new Uint8Array([0x00, 1, 2]) })
    await expect(decodeInvoice(encoded)).rejects.toThrow(/Invalid token dictionary record length/)
  })

  it('throws when raw token address record is not 21 bytes', async () => {
    const encoded = buildRawInvoiceRecords({ tokenAddress: new Uint8Array([0x01, 1, 2, 3, 4]) })
    await expect(decodeInvoice(encoded)).rejects.toThrow(/Invalid raw token address length: 5/)
  })

  it('throws on unknown token address prefix byte', async () => {
    const encoded = buildRawInvoiceRecords({ tokenAddress: new Uint8Array([0x02, 1]) })
    await expect(decodeInvoice(encoded)).rejects.toThrow(/Invalid token address prefix byte: 0x2/)
  })
})
