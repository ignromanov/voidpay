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
  version: 1,
  invoiceId: 'INV-2024-001',
  issuedAt: 1704067200, // 2024-01-01T00:00:00Z
  dueAt: 1706745600, // 2024-02-01T00:00:00Z
  notes: 'Payment for web development services',
  networkId: 1, // Ethereum mainnet
  currency: 'USDC',
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on Ethereum
  decimals: 6,
  from: {
    name: 'Acme Development LLC',
    walletAddress: '0x1234567890123456789012345678901234567890',
    email: 'billing@acme.dev',
    physicalAddress: '123 Tech Street\nSan Francisco, CA 94105',
    phone: '+1-555-123-4567',
  },
  client: {
    name: 'Client Corporation',
    walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    email: 'accounts@client.com',
    physicalAddress: '456 Business Ave\nNew York, NY 10001',
    phone: '+1-555-987-6543',
  },
  items: [
    { description: 'Frontend Development', quantity: 40, rate: '150000000' }, // $150/hr * 40 hrs
    { description: 'Backend API Development', quantity: 60, rate: '175000000' }, // $175/hr * 60 hrs
    { description: 'Code Review & QA', quantity: 10, rate: '125000000' }, // $125/hr * 10 hrs
  ],
  tax: '8.5%',
  discount: '5%',
})

// Minimal invoice - only required fields
const createMinimalInvoiceV1 = (): InvoiceSchemaV1 => ({
  version: 1,
  invoiceId: 'INV-MIN-001',
  issuedAt: 1704067200,
  dueAt: 1706745600,
  networkId: 137, // Polygon
  currency: 'MATIC',
  decimals: 18, // Native token
  from: {
    name: 'Freelancer',
    walletAddress: '0x1111111111111111111111111111111111111111',
  },
  client: {
    name: 'Client',
  },
  items: [{ description: 'Consulting', quantity: 1, rate: '1000000000000000000' }], // 1 MATIC
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
    // Helper to normalize addresses for comparison (binary codec returns lowercase)
    const normalizeAddresses = (inv: InvoiceSchemaV1): InvoiceSchemaV1 => ({
      ...inv,
      tokenAddress: inv.tokenAddress?.toLowerCase(),
      from: { ...inv.from, walletAddress: inv.from.walletAddress.toLowerCase() },
      client: {
        ...inv.client,
        walletAddress: inv.client.walletAddress?.toLowerCase(),
      },
    })

    it('should perfectly round-trip full invoice', () => {
      const original = createTestInvoiceV1()
      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      // Addresses are normalized to lowercase by binary codec
      expect(normalizeAddresses(decoded)).toEqual(normalizeAddresses(original))
    })

    it('should perfectly round-trip minimal invoice', () => {
      const original = createMinimalInvoiceV1()
      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      expect(normalizeAddresses(decoded)).toEqual(normalizeAddresses(original))
    })

    it('should preserve all optional fields when present', () => {
      const invoice = createTestInvoiceV1()
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
      const invoice: InvoiceSchemaV1 = {
        ...createMinimalInvoiceV1(),
        notes: 'Payment for services - Paiement pour services 支付服务费 🚀',
        from: {
          name: 'Développeur Фрилансер 开发者',
          walletAddress: '0x1111111111111111111111111111111111111111',
        },
        client: {
          name: 'Client 顧客 Клиент',
        },
      }

      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      expect(decoded.notes).toBe(invoice.notes)
      expect(decoded.from.name).toBe(invoice.from.name)
      expect(decoded.client.name).toBe(invoice.client.name)
    })

    it('should handle line items with various quantity formats', () => {
      const invoice: InvoiceSchemaV1 = {
        ...createMinimalInvoiceV1(),
        items: [
          { description: 'Integer quantity', quantity: 100, rate: '1000000' },
          { description: 'Float quantity', quantity: 50.5, rate: '2000000' },
          { description: 'Large rate', quantity: 1, rate: '999999999999999999' }, // Near BigInt max
        ],
      }

      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      // Decoder normalizes numeric string quantities to numbers
      expect(decoded.items).toEqual(invoice.items)
    })
  })

  describe('Version Detection', () => {
    it('should correctly identify schema version 1', () => {
      const invoice = createTestInvoiceV1()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      expect(decoded.version).toBe(1)
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
      const invoice = createMinimalInvoiceV1()
      const url = generateInvoiceUrl(invoice)

      expect(url).toContain('/pay#H') // Binary V3 prefix
      expect(url).toMatch(/^https?:\/\//)
    })

    it('should generate URL with custom base URL', () => {
      const invoice = createMinimalInvoiceV1()
      const customBase = 'https://custom.voidpay.xyz'
      const url = generateInvoiceUrl(invoice, { baseUrl: customBase })

      expect(url.startsWith(customBase)).toBe(true)
      expect(url).toContain('/pay#H')
    })

    it('should generate URL that can be decoded back', () => {
      const invoice = createTestInvoiceV1()
      const url = generateInvoiceUrl(invoice, { baseUrl: 'https://voidpay.xyz' })

      // Extract the compressed data from hash fragment
      const hashIndex = url.indexOf('#')
      const compressed = url.slice(hashIndex + 1)

      expect(compressed).toBeTruthy()
      expect(compressed.startsWith('H')).toBe(true)
      const decoded = decodeInvoice(compressed)

      // Normalize addresses for comparison (binary codec returns lowercase)
      const normalizeAddresses = (inv: InvoiceSchemaV1): InvoiceSchemaV1 => ({
        ...inv,
        tokenAddress: inv.tokenAddress?.toLowerCase(),
        from: { ...inv.from, walletAddress: inv.from.walletAddress.toLowerCase() },
        client: {
          ...inv.client,
          walletAddress: inv.client.walletAddress?.toLowerCase(),
        },
      })
      expect(normalizeAddresses(decoded)).toEqual(normalizeAddresses(invoice))
    })

    it('should throw when URL exceeds 2000 bytes', () => {
      // Binary V3 with Deflate is very efficient, need diverse random data
      // to prevent good compression ratios
      const randomString = (len: number) =>
        Array.from({ length: len }, () =>
          String.fromCharCode(65 + Math.floor(Math.random() * 26))
        ).join('')

      const largeInvoice: InvoiceSchemaV1 = {
        ...createTestInvoiceV1(),
        notes: randomString(280), // Max notes length
        items: Array(100)
          .fill(null)
          .map((_, i) => ({
            description: randomString(50) + i, // Random + unique to prevent compression
            quantity: Math.random() * 1000,
            rate: String(Math.floor(Math.random() * 1e18)),
          })),
      }

      expect(() => generateInvoiceUrl(largeInvoice)).toThrow(/exceeds 2000 byte limit/)
    })

    it('should calculate correct byte size for unicode characters', () => {
      // Unicode characters take more bytes than ASCII
      const invoice: InvoiceSchemaV1 = {
        ...createMinimalInvoiceV1(),
        notes: '日本語テキスト',
        from: { ...createMinimalInvoiceV1().from, name: '山田太郎' },
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
