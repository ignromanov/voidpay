/**
 * Frozen oracle byte-identity test (T-P3-C1).
 *
 * Asserts that app-via-package encode/decode produces bytes byte-identical to
 * the frozen golden vectors in void-layer/codec v4-codec.json.
 *
 * oracle = canonical authority captured from vl/app TS at pinned master SHA
 * (see decision 2026-05-29-codec-d1-frozen-vectors-oracle).
 *
 * Provenance: fixtures/v4-codec.json is a vendored copy of the frozen artifact
 * from void-layer/codec packages/codec/vectors/v4-codec.json at pinned master
 * SHA (decision 2026-05-29-codec-d1-frozen-vectors-oracle). The oracle is
 * declared frozen: true and immutable — this checked-in copy cannot drift.
 * Source-of-truth: void-layer/codec repo, packages/codec/vectors/v4-codec.json.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { encodeInvoiceWire, decodeInvoiceWire } from '@void-layer/codec'
import type { Invoice as PkgInvoice } from '@void-layer/types'
import type { Invoice } from '@/entities/invoice'
import { encodeInvoice } from '../encode'
import { decodeBase64url } from '@/shared/lib/tlv-codec'

// ---------------------------------------------------------------------------
// Load frozen oracle
// ---------------------------------------------------------------------------

interface OracleVector {
  name: string
  canonical_hex: string
  wire_hex: string
  receipt_hash_hex: string
  decoded: PkgInvoice
  roundtrip: boolean
}

interface OracleFile {
  schema_version: number
  frozen: boolean
  vectors: OracleVector[]
}

const ORACLE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  'fixtures',
  'v4-codec.json',
)

const oracle: OracleFile = JSON.parse(readFileSync(ORACLE_PATH, 'utf8'))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    out[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return out
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ---------------------------------------------------------------------------
// Tests — one per roundtrip vector
// ---------------------------------------------------------------------------

const roundtripVectors = oracle.vectors.filter((v) => v.roundtrip)

// Proves package canonical encode is byte-identical to the oracle.
// NOTE: vector.decoded is already a snake_case PkgInvoice — the app adapter
// (toPackageInvoice) is NOT exercised here. See "app-via-package" block below.
describe('frozen oracle — encodeInvoiceWire byte-identity (package direct, no app adapter)', () => {
  for (const vector of roundtripVectors) {
    it(`vector: ${vector.name}`, async () => {
      // The decoded field IS the @void-layer/types Invoice (snake_case + salt).
      const pkgInvoice = vector.decoded

      // Encode directly via package WASM, bypassing the app camelCase→snake_case adapter.
      const wireBytes = await encodeInvoiceWire(pkgInvoice)
      const wireHex = bytesToHex(wireBytes)

      expect(wireHex).toBe(vector.wire_hex)
    })
  }
})

// ---------------------------------------------------------------------------
// Test-side mapper: PkgInvoice (snake_case) → app Invoice (camelCase)
// This is test scaffolding — the code under test is toPackageInvoice inside encodeInvoice.
// ---------------------------------------------------------------------------

function toAppInvoice(decoded: PkgInvoice): Invoice {
  return {
    invoiceId: decoded.invoice_id,
    issuedAt: decoded.issued_at,
    dueAt: decoded.due_at,
    networkId: decoded.network_id,
    currency: decoded.currency,
    decimals: decoded.decimals,
    total: decoded.total,
    from: {
      name: decoded.from.name,
      walletAddress: decoded.from.wallet_address as `0x${string}`,
      ...(decoded.from.email && { email: decoded.from.email }),
      ...(decoded.from.phone && { phone: decoded.from.phone }),
      ...(decoded.from.physical_address && { physicalAddress: decoded.from.physical_address }),
      ...(decoded.from.tax_id && { taxId: decoded.from.tax_id }),
    },
    client: {
      name: decoded.client.name,
      ...(decoded.client.wallet_address && {
        walletAddress: decoded.client.wallet_address as `0x${string}`,
      }),
      ...(decoded.client.email && { email: decoded.client.email }),
      ...(decoded.client.phone && { phone: decoded.client.phone }),
      ...(decoded.client.physical_address && {
        physicalAddress: decoded.client.physical_address,
      }),
      ...(decoded.client.tax_id && { taxId: decoded.client.tax_id }),
    },
    items: decoded.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
    })),
    ...(decoded.token_address && { tokenAddress: decoded.token_address as `0x${string}` }),
    ...(decoded.notes && { notes: decoded.notes }),
    ...(decoded.tax && { tax: decoded.tax }),
    ...(decoded.discount && { discount: decoded.discount }),
  }
}

// ---------------------------------------------------------------------------
// App-via-package byte-identity: drives encoding THROUGH toPackageInvoice.
// A bug in the app adapter (dropped/renamed field) will surface here as hex mismatch.
// ---------------------------------------------------------------------------

describe('frozen oracle — app-via-package byte-identity (exercises toPackageInvoice adapter)', () => {
  for (const vector of roundtripVectors) {
    it(`vector: ${vector.name}`, async () => {
      const appInvoice = toAppInvoice(vector.decoded)
      // Pass the oracle salt for determinism (same salt → same magic bytes → same wire).
      const url = await encodeInvoice(appInvoice, hexToBytes(vector.decoded.salt))
      const wireHex = bytesToHex(decodeBase64url(url))

      expect(wireHex).toBe(vector.wire_hex)
    })
  }
})

// ---------------------------------------------------------------------------
// Total guard: encodeInvoice must throw on missing/empty total.
// ---------------------------------------------------------------------------

describe('encodeInvoice — required total guard', () => {
  const baseInvoice: Invoice = {
    invoiceId: 'INV-001',
    issuedAt: 1700000000,
    dueAt: 1700086400,
    networkId: 1,
    currency: 'USDC',
    decimals: 6,
    total: '1000000',
    from: { name: 'Alice', walletAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045' },
    client: { name: 'Bob' },
    items: [{ description: 'Consulting', quantity: 1, rate: '1000000' }],
  }

  it('throws when total is empty string', async () => {
    await expect(encodeInvoice({ ...baseInvoice, total: '' })).rejects.toThrow(
      'Invoice total is required for encoding',
    )
  })

  it('throws when total is undefined', async () => {
    await expect(encodeInvoice({ ...baseInvoice, total: undefined as any })).rejects.toThrow(
      'Invoice total is required for encoding',
    )
  })
})

describe('frozen oracle — decodeInvoiceWire round-trip', () => {
  for (const vector of roundtripVectors) {
    it(`vector: ${vector.name}`, async () => {
      const wireBytes = hexToBytes(vector.wire_hex)
      const decoded = await decodeInvoiceWire(wireBytes)

      // Core fields must match the oracle decoded Invoice
      expect(decoded.invoice_id).toBe(vector.decoded.invoice_id)
      expect(decoded.issued_at).toBe(vector.decoded.issued_at)
      expect(decoded.due_at).toBe(vector.decoded.due_at)
      expect(decoded.network_id).toBe(vector.decoded.network_id)
      expect(decoded.currency).toBe(vector.decoded.currency)
      expect(decoded.decimals).toBe(vector.decoded.decimals)
      expect(decoded.total).toBe(vector.decoded.total)
      expect(decoded.from.name).toBe(vector.decoded.from.name)
      expect(decoded.from.wallet_address.toLowerCase()).toBe(
        vector.decoded.from.wallet_address.toLowerCase(),
      )
      expect(decoded.client.name).toBe(vector.decoded.client.name)
      expect(decoded.salt).toBe(vector.decoded.salt)
    })
  }
})
