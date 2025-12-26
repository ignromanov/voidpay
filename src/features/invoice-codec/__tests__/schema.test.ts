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
import type { InvoiceSchemaV1 } from '@/entities/invoice'

// Canonical test invoice - represents a real-world invoice with all fields populated
const createTestInvoiceV1 = (): InvoiceSchemaV1 => ({
  v: 1,
  id: 'INV-2024-001',
  iss: 1704067200, // 2024-01-01T00:00:00Z
  due: 1706745600, // 2024-02-01T00:00:00Z
  nt: 'Payment for web development services',
  net: 1, // Ethereum mainnet
  cur: 'USDC',
  t: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on Ethereum
  dec: 6,
  f: {
    n: 'Acme Development LLC',
    a: '0x1234567890123456789012345678901234567890',
    e: 'billing@acme.dev',
    ads: '123 Tech Street\nSan Francisco, CA 94105',
    ph: '+1-555-123-4567',
  },
  c: {
    n: 'Client Corporation',
    a: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    e: 'accounts@client.com',
    ads: '456 Business Ave\nNew York, NY 10001',
    ph: '+1-555-987-6543',
  },
  it: [
    { d: 'Frontend Development', q: 40, r: '150000000' }, // $150/hr * 40 hrs
    { d: 'Backend API Development', q: 60, r: '175000000' }, // $175/hr * 60 hrs
    { d: 'Code Review & QA', q: 10, r: '125000000' }, // $125/hr * 10 hrs
  ],
  tax: '8.5%',
  dsc: '5%',
})

// Minimal invoice - only required fields
const createMinimalInvoiceV1 = (): InvoiceSchemaV1 => ({
  v: 1,
  id: 'INV-MIN-001',
  iss: 1704067200,
  due: 1706745600,
  net: 137, // Polygon
  cur: 'MATIC',
  dec: 18, // Native token
  f: {
    n: 'Freelancer',
    a: '0x1111111111111111111111111111111111111111',
  },
  c: {
    n: 'Client',
  },
  it: [{ d: 'Consulting', q: 1, r: '1000000000000000000' }], // 1 MATIC
})

describe('Invoice Schema V1 Encoding', () => {
  describe('Snapshot Tests - Backward Compatibility Protection', () => {
    it('should encode full invoice to stable compressed format', () => {
      const invoice = createTestInvoiceV1()
      const encoded = encodeInvoice(invoice)

      // Snapshot ensures encoding doesn't change unexpectedly
      // If this fails, existing URLs might break!
      expect(encoded).toMatchSnapshot('full-invoice-v1-encoded')
    })

    it('should encode minimal invoice to stable compressed format', () => {
      const invoice = createMinimalInvoiceV1()
      const encoded = encodeInvoice(invoice)

      expect(encoded).toMatchSnapshot('minimal-invoice-v1-encoded')
    })

    it('should preserve exact JSON structure in encoding', () => {
      const invoice = createTestInvoiceV1()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      // Snapshot the decoded structure to catch structural changes
      expect(decoded).toMatchSnapshot('full-invoice-v1-structure')
    })
  })

  describe('Round-trip Tests - Encode/Decode Consistency', () => {
    it('should perfectly round-trip full invoice', () => {
      const original = createTestInvoiceV1()
      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      expect(decoded).toEqual(original)
    })

    it('should perfectly round-trip minimal invoice', () => {
      const original = createMinimalInvoiceV1()
      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      expect(decoded).toEqual(original)
    })

    it('should preserve all optional fields when present', () => {
      const invoice = createTestInvoiceV1()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      // Verify optional fields are preserved
      expect(decoded.nt).toBe(invoice.nt)
      expect(decoded.t).toBe(invoice.t)
      expect(decoded.tax).toBe(invoice.tax)
      expect(decoded.dsc).toBe(invoice.dsc)
      expect(decoded.f.e).toBe(invoice.f.e)
      expect(decoded.f.ads).toBe(invoice.f.ads)
      expect(decoded.f.ph).toBe(invoice.f.ph)
      expect(decoded.c.a).toBe(invoice.c.a)
      expect(decoded.c.e).toBe(invoice.c.e)
      expect(decoded.c.ads).toBe(invoice.c.ads)
      expect(decoded.c.ph).toBe(invoice.c.ph)
    })

    it('should handle unicode characters in notes and names', () => {
      const invoice: InvoiceSchemaV1 = {
        ...createMinimalInvoiceV1(),
        nt: 'Payment for services - Paiement pour services 支付服务费 🚀',
        f: {
          n: 'Développeur Фрилансер 开发者',
          a: '0x1111111111111111111111111111111111111111',
        },
        c: {
          n: 'Client 顧客 Клиент',
        },
      }

      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      expect(decoded.nt).toBe(invoice.nt)
      expect(decoded.f.n).toBe(invoice.f.n)
      expect(decoded.c.n).toBe(invoice.c.n)
    })

    it('should handle line items with various quantity formats', () => {
      const invoice: InvoiceSchemaV1 = {
        ...createMinimalInvoiceV1(),
        it: [
          { d: 'Integer quantity', q: 100, r: '1000000' },
          { d: 'String quantity', q: '50.5', r: '2000000' },
          { d: 'Large rate', q: 1, r: '999999999999999999' }, // Near BigInt max
        ],
      }

      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      expect(decoded.it).toEqual(invoice.it)
    })
  })

  describe('Version Detection', () => {
    it('should correctly identify schema version 1', () => {
      const invoice = createTestInvoiceV1()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      expect(decoded.v).toBe(1)
    })
  })

  describe('Error Handling', () => {
    it('should throw on invalid compressed data', () => {
      expect(() => decodeInvoice('invalid-data-not-compressed')).toThrow()
    })

    it('should throw on missing version field', () => {
      // This tests the decodeInvoice error path for missing version
      const invalidInvoice = { id: 'test', net: 1 }
      const encoded = encodeInvoice(invalidInvoice as unknown as InvoiceSchemaV1)

      expect(() => decodeInvoice(encoded)).toThrow('Missing or invalid version field')
    })

    it('should throw on unsupported schema version', () => {
      const futureInvoice = { v: 999, id: 'test', net: 1 }
      const encoded = encodeInvoice(futureInvoice as unknown as InvoiceSchemaV1)

      expect(() => decodeInvoice(encoded)).toThrow('Unsupported schema version: 999')
    })

    it('should throw on invalid version type', () => {
      const invalidInvoice = { v: 'not-a-number', id: 'test', net: 1 }
      const encoded = encodeInvoice(invalidInvoice as unknown as InvoiceSchemaV1)

      expect(() => decodeInvoice(encoded)).toThrow('Missing or invalid version field')
    })

    it('should throw on invalid invoice data structure', () => {
      // Create a v1 invoice missing required fields
      const incompleteInvoice = { v: 1, id: 'test' }
      const encoded = encodeInvoice(incompleteInvoice as unknown as InvoiceSchemaV1)

      expect(() => decodeInvoice(encoded)).toThrow(/Invalid invoice data/)
    })
  })

  describe('URL Generation', () => {
    it('should generate valid URL with default base', () => {
      const invoice = createMinimalInvoiceV1()
      const url = generateInvoiceUrl(invoice)

      expect(url).toContain('/pay?d=')
      expect(url).toMatch(/^https?:\/\//)
    })

    it('should generate URL with custom base URL', () => {
      const invoice = createMinimalInvoiceV1()
      const customBase = 'https://custom.voidpay.xyz'
      const url = generateInvoiceUrl(invoice, customBase)

      expect(url.startsWith(customBase)).toBe(true)
      expect(url).toContain('/pay?d=')
    })

    it('should generate URL that can be decoded back', () => {
      const invoice = createTestInvoiceV1()
      const url = generateInvoiceUrl(invoice, 'https://voidpay.xyz')

      // Extract the compressed data from the URL
      const urlObj = new URL(url)
      const compressed = urlObj.searchParams.get('d')

      expect(compressed).toBeTruthy()
      const decoded = decodeInvoice(compressed!)
      expect(decoded).toEqual(invoice)
    })

    it('should throw when URL exceeds 2000 bytes', () => {
      // Create an invoice with very long notes to exceed URL limit
      const largeInvoice: InvoiceSchemaV1 = {
        ...createTestInvoiceV1(),
        nt: 'A'.repeat(2000), // Very long notes
        it: Array(50)
          .fill(null)
          .map((_, i) => ({
            d: `Line item ${i} with a very long description that takes up a lot of space in the URL`,
            q: i + 1,
            r: '999999999999999999',
          })),
      }

      expect(() => generateInvoiceUrl(largeInvoice)).toThrow(/exceeds 2000 byte limit/)
    })

    it('should calculate correct byte size for unicode characters', () => {
      // Unicode characters take more bytes than ASCII
      const invoice: InvoiceSchemaV1 = {
        ...createMinimalInvoiceV1(),
        nt: '日本語テキスト',
        f: { ...createMinimalInvoiceV1().f, n: '山田太郎' },
      }

      // Should not throw for reasonable unicode content
      const url = generateInvoiceUrl(invoice)
      expect(url).toBeDefined()

      // Verify byte calculation uses TextEncoder
      const byteSize = new TextEncoder().encode(url).length
      expect(byteSize).toBeLessThanOrEqual(2000)
    })
  })
})
