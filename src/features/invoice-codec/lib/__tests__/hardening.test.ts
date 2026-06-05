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
} from '@/shared/lib/tlv-codec'
import { TOKEN_DICT } from '../tlv-map'
import { encodeInvoiceCanonical, decodeInvoiceCanonical } from '@void-layer/codec'

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
// 4. Domain-separator integrity gate (WASM ChecksumMismatch)
// ---------------------------------------------------------------------------
//
// Forward-compat (unknown odd tags): unknown-odd TLV types (e.g. Type 253) are
// silently ignored by the WASM decoder — they do NOT cause rejection. This
// forward-compat behaviour is covered at the package/Rust level in
// packages/codec/tests/derive_odd_tag_full_invoice_vector.rs and does not
// require a separate TS-level test.

describe('hardening: domain-separator integrity gate', () => {
  it('rejects tampered canonical bytes with "checksum mismatch"', () => {
    // Build canonical TLV bytes via the WASM encoder (synchronous in Node/vitest).
    const inv = createTestInvoice()
    const pkgInvoice = {
      invoice_id: inv.invoiceId,
      issued_at: inv.issuedAt,
      due_at: inv.dueAt,
      network_id: inv.networkId as 1,
      currency: inv.currency,
      decimals: inv.decimals,
      total: inv.total ?? '0',
      salt: '00000000000000000000000000000000',
      from: {
        name: inv.from.name,
        wallet_address: inv.from.walletAddress,
      },
      client: { name: inv.client.name },
      items: inv.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      })),
    }
    const canonical = encodeInvoiceCanonical(pkgInvoice)

    // Flip one byte in the middle of the payload (well inside the body,
    // past the 3-byte header, targeting a non-Type-31 data byte).
    const tampered = new Uint8Array(canonical)
    tampered[Math.floor(canonical.length / 2)] ^= 0xff

    // The WASM decoder must reject with the specific domain-separator error.
    // `checksum mismatch` is the semver-locked display string from CodecError::ChecksumMismatch.
    expect(() => decodeInvoiceCanonical(tampered)).toThrow('checksum mismatch')
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
