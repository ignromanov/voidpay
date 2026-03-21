/**
 * Invoice Schema Snapshot Tests
 *
 * CRITICAL: These tests protect backward compatibility (Constitution Principle IV)
 * - Old URLs must work forever
 * - Schema structure changes require snapshot updates
 * - Existing parsers must never be modified
 *
 * If a snapshot fails, you MUST:
 * 1. Verify the change is intentional
 * 2. Ensure backward compatibility with existing URLs
 * 3. Consider adding a new schema version instead of modifying v1
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { encodeInvoice, generateInvoiceUrl } from '../lib/encode'
import { decodeInvoice } from '../lib/decode'
import type { Invoice } from '@/entities/invoice'
import {
  TEST_INVOICES,
  normalizeInvoiceAddresses,
  createLargeInvoice,
} from '@/shared/lib/test-utils'

/**
 * Normalize invoice for roundtrip comparison.
 * Encoder stores total as-is (final payment amount, inclusive of magicDust if applied).
 * Decoder reads total as-is and only conditionally sets magicDust via salt verification.
 * For roundtrip tests, strip magicDust from both sides — total is directly comparable.
 */
function normalizeForRoundtrip(inv: Invoice): Invoice {
  const { magicDust: _magicDust, ...rest } = inv as Invoice & { magicDust?: string }
  return normalizeInvoiceAddresses(rest)
}

describe('Invoice Schema V1 Encoding', () => {
  describe('Snapshot Tests - Backward Compatibility Protection', () => {
    // Mock crypto.getRandomValues for deterministic salt in snapshots
    const originalGetRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto)
    beforeEach(() => {
      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
        const bytes = array as Uint8Array
        for (let i = 0; i < bytes.length; i++) bytes[i] = i & 0xff
        return array
      })
    })
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should encode full invoice to stable compressed format', async () => {
      const invoice = TEST_INVOICES.full()
      const encoded = await encodeInvoice(invoice)

      // Snapshot ensures encoding doesn't change unexpectedly
      // If this fails, existing URLs might break!
      expect(encoded).toMatchSnapshot('full-invoice-v1-encoded')
    })

    it('should encode minimal invoice to stable compressed format', async () => {
      const invoice = TEST_INVOICES.minimal()
      const encoded = await encodeInvoice(invoice)

      expect(encoded).toMatchSnapshot('minimal-invoice-v1-encoded')
    })

    it('should preserve exact JSON structure in encoding', async () => {
      const invoice = TEST_INVOICES.full()
      const encoded = await encodeInvoice(invoice)
      const decoded = await decodeInvoice(encoded)

      // Snapshot the decoded structure to catch structural changes
      expect(decoded).toMatchSnapshot('full-invoice-v1-structure')
    })
  })

  describe('Round-trip Tests - Encode/Decode Consistency', () => {
    it('should perfectly round-trip full invoice', async () => {
      const original = TEST_INVOICES.full()
      const encoded = await encodeInvoice(original)
      const decoded = await decodeInvoice(encoded)

      // Total is stored and decoded as-is. Strip magicDust field for comparison
      // (decoder sets it only when salt verification succeeds).
      expect(normalizeForRoundtrip(decoded)).toEqual(normalizeForRoundtrip(original))
    })

    it('should perfectly round-trip minimal invoice', async () => {
      const original = TEST_INVOICES.minimal()
      const encoded = await encodeInvoice(original)
      const decoded = await decodeInvoice(encoded)

      expect(normalizeForRoundtrip(decoded)).toEqual(normalizeForRoundtrip(original))
    })

    it('should preserve all optional fields when present', async () => {
      const invoice = TEST_INVOICES.full()
      const encoded = await encodeInvoice(invoice)
      const decoded = await decodeInvoice(encoded)

      expect(decoded.notes).toBe(invoice.notes)
      expect(decoded.tokenAddress?.toLowerCase()).toBe(invoice.tokenAddress?.toLowerCase())
      expect(decoded.tax).toBe(invoice.tax)
      expect(decoded.discount).toBe(invoice.discount)
      expect(decoded.from.email).toBe(invoice.from.email)
      expect(decoded.from.physicalAddress).toBe(invoice.from.physicalAddress)
      expect(decoded.from.phone).toBe(invoice.from.phone)
      expect(decoded.client.walletAddress?.toLowerCase()).toBe(
        invoice.client.walletAddress?.toLowerCase()
      )
      expect(decoded.client.email).toBe(invoice.client.email)
      expect(decoded.client.physicalAddress).toBe(invoice.client.physicalAddress)
      expect(decoded.client.phone).toBe(invoice.client.phone)
    })

    it('should handle unicode characters in notes and names', async () => {
      const invoice = TEST_INVOICES.unicode()
      const encoded = await encodeInvoice(invoice)
      const decoded = await decodeInvoice(encoded)

      expect(decoded.notes).toBe(invoice.notes)
      expect(decoded.from.name).toBe(invoice.from.name)
      expect(decoded.client.name).toBe(invoice.client.name)
    })

    it('should handle line items with various quantity formats', async () => {
      const invoice = TEST_INVOICES.variousQuantities()
      const encoded = await encodeInvoice(invoice)
      const decoded = await decodeInvoice(encoded)

      // Decoder normalizes numeric string quantities to numbers
      expect(decoded.items).toEqual(invoice.items)
    })
  })

  describe('Error Handling', () => {
    it('should throw on invalid compressed data', async () => {
      await expect(decodeInvoice('invalid-data-not-compressed')).rejects.toThrow()
    })

    it('should throw on empty input', async () => {
      await expect(decodeInvoice('')).rejects.toThrow(/Empty invoice data/)
    })

    it('should throw on corrupted data', async () => {
      await expect(decodeInvoice('ABCD1234')).rejects.toThrow()
    })

    it('should throw on truncated binary data', async () => {
      // Short Base64url that decodes to invalid TLV
      await expect(decodeInvoice('AQ')).rejects.toThrow()
    })
  })

  describe('URL Generation', () => {
    it('should generate valid URL with hash fragment', async () => {
      const invoice = TEST_INVOICES.minimal()
      const url = await generateInvoiceUrl(invoice)

      // TLV v1: Base64url in hash fragment
      expect(url).toContain('/pay#')
      expect(url).toMatch(/^https?:\/\//)
      // Verify it's valid Base64url after #
      const hash = url.split('#')[1]
      expect(hash).toMatch(/^[A-Za-z0-9_-]+=*$/)
    })

    it('should generate URL with custom base URL', async () => {
      const invoice = TEST_INVOICES.minimal()
      const customBase = 'https://custom.voidpay.xyz'
      const url = await generateInvoiceUrl(invoice, { baseUrl: customBase })

      expect(url.startsWith(customBase)).toBe(true)
      expect(url).toContain('/pay#')
    })

    it('should generate URL that can be decoded back', async () => {
      const invoice = TEST_INVOICES.full()
      const url = await generateInvoiceUrl(invoice, { baseUrl: 'https://voidpay.xyz' })

      const hashIndex = url.indexOf('#')
      const compressed = url.slice(hashIndex + 1)

      expect(compressed).toBeTruthy()
      const decoded = await decodeInvoice(compressed)

      expect(normalizeForRoundtrip(decoded)).toEqual(normalizeForRoundtrip(invoice))
    })

    it('should throw when URL exceeds size limits', async () => {
      const largeInvoice = createLargeInvoice()
      await expect(generateInvoiceUrl(largeInvoice)).rejects.toThrow(/exceeds/i)
    })

    it('should calculate correct byte size for unicode characters', async () => {
      const invoice = TEST_INVOICES.japaneseUnicode()

      const url = await generateInvoiceUrl(invoice)
      expect(url).toBeDefined()

      const byteSize = new TextEncoder().encode(url).length
      expect(byteSize).toBeLessThanOrEqual(2000)
    })
  })
})
