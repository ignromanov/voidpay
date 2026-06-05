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

describe('frozen oracle — encodeInvoiceWire byte-identity', () => {
  for (const vector of roundtripVectors) {
    it(`vector: ${vector.name}`, async () => {
      // The decoded field IS the @void-layer/types Invoice (snake_case + salt).
      const pkgInvoice = vector.decoded

      // Encode via package: App Invoice adapter → WASM → Brotli wire bytes.
      const wireBytes = await encodeInvoiceWire(pkgInvoice)
      const wireHex = bytesToHex(wireBytes)

      expect(wireHex).toBe(vector.wire_hex)
    })
  }
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
