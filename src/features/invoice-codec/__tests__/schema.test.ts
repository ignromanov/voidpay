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

import { describe, it, expect } from 'vitest'
import { encodeInvoice, generateInvoiceUrl } from '../lib/encode'
import { decodeInvoice } from '../lib/decode'
import {
  TEST_INVOICES,
  normalizeInvoiceAddresses,
  createLargeInvoice,
} from '@/shared/lib/test-utils'

describe('Invoice Schema V1 Encoding', () => {
  describe('Snapshot Tests - Backward Compatibility Protection', () => {
    it('should encode full invoice to stable compressed format', () => {
      const invoice = TEST_INVOICES.full()
      const encoded = encodeInvoice(invoice)

      // Snapshot ensures encoding doesn't change unexpectedly
      // If this fails, existing URLs might break!
      expect(encoded).toMatchSnapshot('full-invoice-v1-encoded')
    })

    it('should encode minimal invoice to stable compressed format', () => {
      const invoice = TEST_INVOICES.minimal()
      const encoded = encodeInvoice(invoice)

      expect(encoded).toMatchSnapshot('minimal-invoice-v1-encoded')
    })

    it('should preserve exact JSON structure in encoding', () => {
      const invoice = TEST_INVOICES.full()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      // Snapshot the decoded structure to catch structural changes
      expect(decoded).toMatchSnapshot('full-invoice-v1-structure')
    })
  })

  describe('Round-trip Tests - Encode/Decode Consistency', () => {
    it('should perfectly round-trip full invoice', () => {
      const original = TEST_INVOICES.full()
      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      // Addresses are normalized to lowercase by binary codec
      expect(normalizeInvoiceAddresses(decoded)).toEqual(normalizeInvoiceAddresses(original))
    })

    it('should perfectly round-trip minimal invoice', () => {
      const original = TEST_INVOICES.minimal()
      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      expect(normalizeInvoiceAddresses(decoded)).toEqual(normalizeInvoiceAddresses(original))
    })

    it('should preserve all optional fields when present', () => {
      const invoice = TEST_INVOICES.full()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      // Verify optional fields are preserved (addresses normalized to lowercase)
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

    it('should handle unicode characters in notes and names', () => {
      const invoice = TEST_INVOICES.unicode()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      expect(decoded.notes).toBe(invoice.notes)
      expect(decoded.from.name).toBe(invoice.from.name)
      expect(decoded.client.name).toBe(invoice.client.name)
    })

    it('should handle line items with various quantity formats', () => {
      const invoice = TEST_INVOICES.variousQuantities()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      // Decoder normalizes numeric string quantities to numbers
      expect(decoded.items).toEqual(invoice.items)
    })
  })

  describe('Version Detection', () => {
    it('should correctly identify schema version 2', () => {
      const invoice = TEST_INVOICES.full()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      expect(decoded.version).toBe(2)
    })
  })

  describe('Error Handling', () => {
    it('should throw on invalid compressed data', () => {
      expect(() => decodeInvoice('invalid-data-not-compressed')).toThrow()
    })

    it('should throw on missing H prefix', () => {
      // Binary V3 requires 'H' prefix
      expect(() => decodeInvoice('ABCD1234')).toThrow(/expected Binary V3/)
    })

    it('should throw on corrupted base62 data', () => {
      // Valid H prefix but corrupted data
      expect(() => decodeInvoice('H!!!invalid!!!')).toThrow()
    })

    it('should throw on truncated binary data', () => {
      // Valid H prefix but too short
      expect(() => decodeInvoice('H1')).toThrow()
    })
  })

  describe('URL Generation', () => {
    it('should generate valid URL with hash fragment', () => {
      const invoice = TEST_INVOICES.minimal()
      const url = generateInvoiceUrl(invoice)

      expect(url).toContain('/pay#H') // Binary V3 prefix
      expect(url).toMatch(/^https?:\/\//)
    })

    it('should generate URL with custom base URL', () => {
      const invoice = TEST_INVOICES.minimal()
      const customBase = 'https://custom.voidpay.xyz'
      const url = generateInvoiceUrl(invoice, { baseUrl: customBase })

      expect(url.startsWith(customBase)).toBe(true)
      expect(url).toContain('/pay#H')
    })

    it('should generate URL that can be decoded back', () => {
      const invoice = TEST_INVOICES.full()
      const url = generateInvoiceUrl(invoice, { baseUrl: 'https://voidpay.xyz' })

      // Extract the compressed data from hash fragment
      const hashIndex = url.indexOf('#')
      const compressed = url.slice(hashIndex + 1)

      expect(compressed).toBeTruthy()
      expect(compressed.startsWith('H')).toBe(true)
      const decoded = decodeInvoice(compressed)

      expect(normalizeInvoiceAddresses(decoded)).toEqual(normalizeInvoiceAddresses(invoice))
    })

    it('should throw when URL exceeds 2000 bytes', () => {
      const largeInvoice = createLargeInvoice()
      expect(() => generateInvoiceUrl(largeInvoice)).toThrow(/exceeds 2000 byte limit/)
    })

    it('should calculate correct byte size for unicode characters', () => {
      // Unicode characters take more bytes than ASCII
      const invoice = TEST_INVOICES.japaneseUnicode()

      // Should not throw for reasonable unicode content
      const url = generateInvoiceUrl(invoice)
      expect(url).toBeDefined()

      // Verify byte calculation uses TextEncoder
      const byteSize = new TextEncoder().encode(url).length
      expect(byteSize).toBeLessThanOrEqual(2000)
    })
  })
})
