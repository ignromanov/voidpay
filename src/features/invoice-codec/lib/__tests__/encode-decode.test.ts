/**
 * Invoice Codec encode/decode tests
 * Tests the high-level encode/decode functions that wrap binary-codec
 */
import { describe, it, expect, vi } from 'vitest'
import { encodeInvoice, generateInvoiceUrl } from '../encode'
import { decodeInvoice } from '../decode'
import type { Invoice } from '@/entities/invoice'

// Mock getAppBaseUrl for consistent test URLs
vi.mock('@/shared/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/config')>()
  return {
    ...actual,
    getAppBaseUrl: () => 'https://voidpay.xyz',
  }
})

describe('Invoice Codec', () => {
  const createTestInvoice = (): Invoice => ({
    version: 2,
    invoiceId: 'TEST-001',
    issuedAt: 1704067200,
    dueAt: 1706745600,
    networkId: 1,
    currency: 'USDC',
    decimals: 6,
    from: {
      name: 'Test Sender',
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
    client: {
      name: 'Test Client',
    },
    items: [{ description: 'Test service', quantity: 1, rate: '100' }],
  })

  describe('encodeInvoice', () => {
    it('encodes invoice to H-prefixed string', () => {
      const invoice = createTestInvoice()
      const encoded = encodeInvoice(invoice)

      expect(encoded).toMatch(/^H/)
      expect(encoded.length).toBeGreaterThan(1)
    })

    it('produces consistent output for same input', () => {
      const invoice = createTestInvoice()
      const encoded1 = encodeInvoice(invoice)
      const encoded2 = encodeInvoice(invoice)

      expect(encoded1).toBe(encoded2)
    })
  })

  describe('decodeInvoice', () => {
    it('decodes encoded invoice correctly', () => {
      const original = createTestInvoice()
      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.networkId).toBe(original.networkId)
      expect(decoded.currency).toBe(original.currency)
      expect(decoded.from.name).toBe(original.from.name)
    })

    it('throws error for non-H prefix', () => {
      expect(() => decodeInvoice('X1234')).toThrow(
        'Invalid invoice format: expected Binary V3 (H prefix)'
      )
    })

    it('throws error for empty string', () => {
      expect(() => decodeInvoice('')).toThrow(
        'Invalid invoice format: expected Binary V3 (H prefix)'
      )
    })

    it('validates decoded data against schema', () => {
      const invoice = createTestInvoice()
      const encoded = encodeInvoice(invoice)
      const decoded = decodeInvoice(encoded)

      // Schema validation ensures version is 2
      expect(decoded.version).toBe(2)
      // Wallet address is valid format
      expect(decoded.from.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  describe('generateInvoiceUrl', () => {
    it('generates URL with hash fragment', () => {
      const invoice = createTestInvoice()
      const url = generateInvoiceUrl(invoice)

      expect(url).toMatch(/^https:\/\/voidpay\.xyz\/pay#H/)
    })

    it('uses custom base URL when provided', () => {
      const invoice = createTestInvoice()
      const url = generateInvoiceUrl(invoice, { baseUrl: 'https://custom.domain' })

      expect(url).toMatch(/^https:\/\/custom\.domain\/pay#H/)
    })

    it('supports legacy string baseUrl argument', () => {
      const invoice = createTestInvoice()
      const url = generateInvoiceUrl(invoice, 'https://legacy.domain')

      expect(url).toMatch(/^https:\/\/legacy\.domain\/pay#H/)
    })

    it('generates URL with OG preview when requested', () => {
      const invoice = createTestInvoice()
      const url = generateInvoiceUrl(invoice, { includeOG: true })

      expect(url).toContain('?og=')
      expect(url).toContain('#H')
    })

    it('throws error when URL exceeds 2000 bytes', () => {
      const invoice = createTestInvoice()
      // Create incompressible content using pseudo-random characters
      // The seeded random ensures consistent test behavior while defeating compression
      let seed = 12345
      const pseudoRandom = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed
      }
      invoice.notes = Array.from({ length: 3000 }, () =>
        String.fromCharCode(32 + (pseudoRandom() % 95))
      ).join('')

      expect(() => generateInvoiceUrl(invoice)).toThrow(/URL size .* exceeds 2000 byte limit/)
    })

    it('stays under 2000 bytes for typical invoice', () => {
      const invoice: Invoice = {
        version: 2,
        invoiceId: 'INV-2024-Q1-001',
        issuedAt: 1704067200,
        dueAt: 1706745600,
        networkId: 42161,
        currency: 'ETH',
        decimals: 18,
        notes: 'Payment for consulting services Q1 2024',
        from: {
          name: 'Consulting Corp',
          walletAddress: '0xaaaa000000000000000000000000000000000001',
          email: 'billing@consulting.com',
        },
        client: {
          name: 'Client Industries',
          walletAddress: '0xbbbb000000000000000000000000000000000002',
          email: 'accounts@client.io',
        },
        items: [
          { description: 'Strategy consulting', quantity: 40, rate: '250' },
          { description: 'Technical review', quantity: 20, rate: '200' },
        ],
        tax: '8.25',
      }

      const url = generateInvoiceUrl(invoice)
      const byteSize = new TextEncoder().encode(url).length

      expect(byteSize).toBeLessThanOrEqual(2000)
    })
  })

  describe('roundtrip encode/decode', () => {
    it('preserves all invoice fields', () => {
      const original: Invoice = {
        version: 2,
        invoiceId: 'ROUNDTRIP-001',
        issuedAt: 1704067200,
        dueAt: 1706745600,
        networkId: 137,
        currency: 'MATIC',
        tokenAddress: '0xdead000000000000000000000000000000000000',
        decimals: 18,
        notes: 'Test notes',
        from: {
          name: 'Sender Name',
          walletAddress: '0xaaaa000000000000000000000000000000000001',
          email: 'sender@test.com',
          physicalAddress: '123 Main St',
          phone: '+1-555-123-4567',
        },
        client: {
          name: 'Client Name',
          walletAddress: '0xbbbb000000000000000000000000000000000002',
          email: 'client@test.com',
          physicalAddress: '456 Oak Ave',
          phone: '+1-555-987-6543',
        },
        items: [
          { description: 'Item 1', quantity: 5, rate: '100' },
          { description: 'Item 2', quantity: 10, rate: '50' },
        ],
        tax: '10',
        discount: '25',
      }

      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.notes).toBe(original.notes)
      expect(decoded.tokenAddress?.toLowerCase()).toBe(original.tokenAddress?.toLowerCase())
      expect(decoded.from.email).toBe(original.from.email)
      expect(decoded.from.phone).toBe(original.from.phone)
      expect(decoded.client.email).toBe(original.client.email)
      expect(decoded.tax).toBe(original.tax)
      expect(decoded.discount).toBe(original.discount)
      expect(decoded.items).toHaveLength(2)
    })

    it('handles Unicode characters', () => {
      const original = createTestInvoice()
      original.from.name = '日本株式会社'
      original.client.name = 'Société Française'
      original.items[0].description = 'Услуги консалтинга'

      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      expect(decoded.from.name).toBe(original.from.name)
      expect(decoded.client.name).toBe(original.client.name)
      expect(decoded.items[0].description).toBe(original.items[0].description)
    })
  })
})
