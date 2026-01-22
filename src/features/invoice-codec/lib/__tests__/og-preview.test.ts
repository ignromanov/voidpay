/**
 * OG Preview Tests
 * Tests for Open Graph preview encoding/decoding
 *
 * All rates are in atomic units (e.g., $1000 with 6 decimals = "1000000000")
 */

import { describe, it, expect } from 'vitest'
import { encodeOGPreview, decodeOGPreview, getNetworkIdFromCode } from '../og-preview'
import type { Invoice } from '@/entities/invoice'

// Mock invoice factory with atomic units
function createMockInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    version: 3,
    invoiceId: '550e8400-e29b-41d4-a716-446655440000',
    issuedAt: Math.floor(Date.now() / 1000),
    networkId: 42161, // Arbitrum
    currency: 'USDC',
    decimals: 6, // USDC has 6 decimals
    from: {
      name: 'Acme Inc',
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
    client: {
      name: 'Client Corp',
    },
    items: [
      {
        description: 'Service',
        quantity: 1,
        rate: '1000000000', // $1000 in atomic units (6 decimals)
      },
    ],
    ...overrides,
  } as Invoice
}

describe('og-preview', () => {
  describe('encodeOGPreview', () => {
    it('encodes basic invoice to OG string', () => {
      const invoice = createMockInvoice()
      const result = encodeOGPreview(invoice)

      expect(result).toContain('550e8400') // shortened ID
      expect(result).toContain('1000.00') // formatted amount
      expect(result).toContain('USDC') // currency
      expect(result).toContain('arb') // network code
    })

    it('includes sender name when present', () => {
      const invoice = createMockInvoice({
        from: { name: 'Acme Inc', walletAddress: '0x1234567890123456789012345678901234567890' },
      })
      const result = encodeOGPreview(invoice)

      expect(result).toContain('Acme Inc')
    })

    it('truncates long sender names to 20 chars', () => {
      const invoice = createMockInvoice({
        from: {
          name: 'Very Long Company Name That Exceeds Limit',
          walletAddress: '0x1234567890123456789012345678901234567890',
        },
      })
      const result = encodeOGPreview(invoice)

      // Should contain truncated name
      expect(result.length).toBeLessThan(100)
    })

    it('removes unsafe URL characters from sender name', () => {
      const invoice = createMockInvoice({
        from: { name: 'Test & Co', walletAddress: '0x1234567890123456789012345678901234567890' },
      })
      const result = encodeOGPreview(invoice)

      expect(result).not.toContain('&')
    })

    it('includes due date in MMDD format when present', () => {
      // Dec 25, 2024 at noon UTC (avoid timezone edge cases)
      const dueAt = Math.floor(Date.UTC(2024, 11, 25, 12, 0, 0) / 1000)
      const invoice = createMockInvoice({ dueAt })
      const result = encodeOGPreview(invoice)

      expect(result).toContain('1225') // MMDD format
    })

    it('calculates total correctly with multiple items', () => {
      const invoice = createMockInvoice({
        items: [
          { description: 'Item 1', quantity: 2, rate: '100000000' }, // $100 × 2 = $200
          { description: 'Item 2', quantity: 1, rate: '50000000' }, // $50 × 1 = $50
        ],
      })
      const result = encodeOGPreview(invoice)

      expect(result).toContain('250.00') // 2*100 + 1*50
    })

    it('applies tax to total', () => {
      const invoice = createMockInvoice({
        items: [{ description: 'Service', quantity: 1, rate: '100000000' }], // $100
        tax: '10', // 10%
      })
      const result = encodeOGPreview(invoice)

      expect(result).toContain('110.00') // 100 + 10% tax
    })

    it('applies discount to total', () => {
      const invoice = createMockInvoice({
        items: [{ description: 'Service', quantity: 1, rate: '100000000' }], // $100
        discount: '10', // 10%
      })
      const result = encodeOGPreview(invoice)

      expect(result).toContain('90.00') // 100 - 10% discount
    })
  })

  describe('decodeOGPreview', () => {
    it('decodes basic OG string', () => {
      const ogString = 'a1b2c3d4_1250.00_USDC_arb'
      const result = decodeOGPreview(ogString)

      expect(result.id).toBe('a1b2c3d4')
      expect(result.amount).toBe('1250.00')
      expect(result.currency).toBe('USDC')
      expect(result.network).toBe('arb')
    })

    it('parses sender name when present', () => {
      const ogString = 'a1b2c3d4_1250.00_USDC_arb_Acme'
      const result = decodeOGPreview(ogString)

      expect(result.from).toBe('Acme')
    })

    it('parses due date when present', () => {
      const ogString = 'a1b2c3d4_1250.00_USDC_arb_Acme_1231'
      const result = decodeOGPreview(ogString)

      expect(result.from).toBe('Acme')
      expect(result.due).toBe('1231')
    })

    it('handles due date without sender name', () => {
      const ogString = 'a1b2c3d4_1250.00_USDC_arb_1231'
      const result = decodeOGPreview(ogString)

      expect(result.from).toBeUndefined()
      expect(result.due).toBe('1231')
    })

    it('throws on invalid format (less than 4 parts)', () => {
      expect(() => decodeOGPreview('a1b2c3d4_1250.00_USDC')).toThrow('Invalid OG preview format')
    })

    it('handles empty parts gracefully', () => {
      const ogString = '_1250.00_USDC_arb'
      const result = decodeOGPreview(ogString)

      expect(result.id).toBe('')
    })
  })

  describe('getNetworkIdFromCode', () => {
    it('returns chain ID for eth', () => {
      expect(getNetworkIdFromCode('eth')).toBe(1)
    })

    it('returns chain ID for arb', () => {
      expect(getNetworkIdFromCode('arb')).toBe(42161)
    })

    it('returns chain ID for op', () => {
      expect(getNetworkIdFromCode('op')).toBe(10)
    })

    it('returns chain ID for poly', () => {
      expect(getNetworkIdFromCode('poly')).toBe(137)
    })

    it('is case-insensitive', () => {
      expect(getNetworkIdFromCode('ETH')).toBe(1)
      expect(getNetworkIdFromCode('Arb')).toBe(42161)
    })

    it('returns undefined for unknown code', () => {
      expect(getNetworkIdFromCode('unknown')).toBeUndefined()
    })
  })

  describe('roundtrip encoding', () => {
    it('encodes and decodes correctly', () => {
      const invoice = createMockInvoice({
        from: {
          name: 'TestCo',
          walletAddress: '0x1234567890123456789012345678901234567890',
        },
        // June 15, 2024 at noon UTC (avoid timezone edge cases)
        dueAt: Math.floor(Date.UTC(2024, 5, 15, 12, 0, 0) / 1000),
      })

      const encoded = encodeOGPreview(invoice)
      const decoded = decodeOGPreview(encoded)

      expect(decoded.currency).toBe('USDC')
      expect(decoded.network).toBe('arb')
      expect(decoded.from).toBe('TestCo')
      expect(decoded.due).toBe('0615')
    })
  })
})
