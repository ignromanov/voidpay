/**
 * Invoice Codec TLV v1 encode/decode tests
 */
import { describe, it, expect, vi } from 'vitest'
import { encodeInvoice, generateInvoiceUrl } from '../encode'
import { decodeInvoice } from '../decode'
import type { Invoice } from '@/entities/invoice'
import { readTlv, decodeBase62, encodeBase62, writeTlv } from '@/shared/lib/tlv-codec'
import { TlvType } from '../tlv-map'

vi.mock('@/shared/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/config')>()
  return {
    ...actual,
    getAppBaseUrl: () => 'https://voidpay.xyz',
  }
})

const createMinimalInvoice = (): Invoice => ({
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
  items: [{ description: 'Test service', quantity: 1, rate: '100000000' }],
})

const createFullInvoice = (): Invoice => ({
  version: 2,
  invoiceId: 'FULL-001',
  issuedAt: 1704067200,
  dueAt: 1706745600,
  networkId: 42161,
  currency: 'ETH',
  decimals: 18,
  notes: 'Payment for consulting services Q1 2024',
  tokenAddress: '0xdead000000000000000000000000000000000000',
  from: {
    name: 'Consulting Corp',
    walletAddress: '0xaaaa000000000000000000000000000000000001',
    email: 'billing@consulting.com',
    physicalAddress: '123 Main St',
    phone: '+1-555-123-4567',
    taxId: 'US-12345678',
  },
  client: {
    name: 'Client Industries',
    walletAddress: '0xbbbb000000000000000000000000000000000002',
    email: 'accounts@client.io',
    physicalAddress: '456 Oak Ave',
    phone: '+1-555-987-6543',
    taxId: 'UK-87654321',
  },
  items: [
    { description: 'Strategy consulting', quantity: 40, rate: '250000000000000000000' },
    { description: 'Technical review', quantity: 20, rate: '200000000000000000000' },
  ],
  tax: '8.25',
  discount: '5',
  total: '14025000000000000000000',
  magicDust: '42',
})

describe('Invoice Codec TLV v1', () => {
  describe('encodeInvoice', () => {
    it('encodes minimal invoice without error', () => {
      const encoded = encodeInvoice(createMinimalInvoice())
      expect(encoded).toBeTruthy()
      expect(encoded.length).toBeGreaterThan(1)
    })

    it('encodes full invoice without error', () => {
      const encoded = encodeInvoice(createFullInvoice())
      expect(encoded).toBeTruthy()
    })

    it('output is valid Base62 (no H prefix)', () => {
      const encoded = encodeInvoice(createMinimalInvoice())
      // v1 has no 'H' prefix — raw Base62 of binary with magic byte inside
      expect(encoded).not.toMatch(/^H/)
      // Valid Base62 characters only
      expect(encoded).toMatch(/^[0-9A-Za-z]+$/)
    })

    it('encoded binary has correct magic byte and version', () => {
      const encoded = encodeInvoice(createMinimalInvoice())
      const bytes = decodeBase62(encoded)
      expect(bytes[0]).toBe(0x56) // MAGIC
      expect(bytes[1]).toBe(0x01) // VERSION
    })

    it('encoded TLV contains salt (Type 20, 16 bytes)', () => {
      const encoded = encodeInvoice(createMinimalInvoice())
      const bytes = decodeBase62(encoded)
      const { records } = readTlv(bytes)
      const salt = records.find((r) => r.type === TlvType.SALT)
      expect(salt).toBeDefined()
      expect(salt!.value.length).toBe(16)
    })

    it('records are in canonical order', () => {
      const encoded = encodeInvoice(createFullInvoice())
      const bytes = decodeBase62(encoded)
      const { records } = readTlv(bytes)
      for (let i = 1; i < records.length; i++) {
        expect(records[i]!.type).toBeGreaterThan(records[i - 1]!.type)
      }
    })

    it('invoiceId is individual TLV (Type 22), not in compressed block', () => {
      const encoded = encodeInvoice(createFullInvoice())
      const bytes = decodeBase62(encoded)
      const { records } = readTlv(bytes)
      const invoiceIdRecord = records.find((r) => r.type === TlvType.INVOICE_ID)
      expect(invoiceIdRecord).toBeDefined()
    })
  })

  describe('decodeInvoice', () => {
    it('decodes minimal invoice correctly', () => {
      const original = createMinimalInvoice()
      const encoded = encodeInvoice(original)
      const decoded = decodeInvoice(encoded)

      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.networkId).toBe(original.networkId)
      expect(decoded.currency).toBe(original.currency)
      expect(decoded.decimals).toBe(original.decimals)
      expect(decoded.from.name).toBe(original.from.name)
      expect(decoded.client.name).toBe(original.client.name)
      expect(decoded.version).toBe(2)
    })

    it('throws on empty string', () => {
      expect(() => decodeInvoice('')).toThrow('Empty invoice data')
    })

    it('throws on invalid Base62', () => {
      expect(() => decodeInvoice('!!invalid!!')).toThrow()
    })

    it('outputs version: 2', () => {
      const encoded = encodeInvoice(createMinimalInvoice())
      const decoded = decodeInvoice(encoded)
      expect(decoded.version).toBe(2)
    })

    it('validates against schema', () => {
      const encoded = encodeInvoice(createMinimalInvoice())
      const decoded = decodeInvoice(encoded)
      expect(decoded.from.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  describe('generateInvoiceUrl', () => {
    it('generates URL with hash fragment (no H prefix)', () => {
      const url = generateInvoiceUrl(createMinimalInvoice())
      expect(url).toMatch(/^https:\/\/voidpay\.xyz\/pay#[0-9A-Za-z]+$/)
      expect(url).not.toContain('#H')
    })

    it('uses custom base URL', () => {
      const url = generateInvoiceUrl(createMinimalInvoice(), { baseUrl: 'https://custom.domain' })
      expect(url).toMatch(/^https:\/\/custom\.domain\/pay#/)
    })

    it('supports legacy string baseUrl argument', () => {
      const url = generateInvoiceUrl(createMinimalInvoice(), 'https://legacy.domain')
      expect(url).toMatch(/^https:\/\/legacy\.domain\/pay#/)
    })

    it('generates URL with OG preview', () => {
      const url = generateInvoiceUrl(createMinimalInvoice(), { includeOG: true })
      expect(url).toContain('?og=')
      expect(url).toMatch(/#[0-9A-Za-z]+$/)
    })

    it('throws when URL exceeds 2000 bytes', () => {
      const invoice = createMinimalInvoice()
      let seed = 12345
      const pseudoRandom = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed
      }
      invoice.notes = Array.from({ length: 3000 }, () =>
        String.fromCharCode(32 + (pseudoRandom() % 95))
      ).join('')

      expect(() => generateInvoiceUrl(invoice)).toThrow(/exceeds|size/i)
    })

    it('stays under 2000 bytes for typical invoice', () => {
      const url = generateInvoiceUrl(createFullInvoice())
      const byteSize = new TextEncoder().encode(url).length
      expect(byteSize).toBeLessThanOrEqual(2000)
    })
  })

  describe('roundtrip encode/decode', () => {
    it('preserves minimal invoice fields', () => {
      const original = createMinimalInvoice()
      const decoded = decodeInvoice(encodeInvoice(original))

      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.issuedAt).toBe(original.issuedAt)
      expect(decoded.dueAt).toBe(original.dueAt)
      expect(decoded.networkId).toBe(original.networkId)
      expect(decoded.currency).toBe(original.currency)
      expect(decoded.decimals).toBe(original.decimals)
      expect(decoded.from.name).toBe(original.from.name)
      expect(decoded.from.walletAddress.toLowerCase()).toBe(
        original.from.walletAddress.toLowerCase()
      )
      expect(decoded.client.name).toBe(original.client.name)
      expect(decoded.items).toHaveLength(original.items.length)
      expect(decoded.items[0]!.description).toBe(original.items[0]!.description)
      expect(decoded.items[0]!.rate).toBe(original.items[0]!.rate)
    })

    it('preserves full invoice fields', () => {
      const original = createFullInvoice()
      const decoded = decodeInvoice(encodeInvoice(original))

      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.notes).toBe(original.notes)
      expect(decoded.tokenAddress?.toLowerCase()).toBe(original.tokenAddress?.toLowerCase())
      expect(decoded.from.email).toBe(original.from.email)
      expect(decoded.from.phone).toBe(original.from.phone)
      expect(decoded.from.physicalAddress).toBe(original.from.physicalAddress)
      expect(decoded.from.taxId).toBe(original.from.taxId)
      expect(decoded.client.email).toBe(original.client.email)
      expect(decoded.client.phone).toBe(original.client.phone)
      expect(decoded.client.physicalAddress).toBe(original.client.physicalAddress)
      expect(decoded.client.taxId).toBe(original.client.taxId)
      expect(decoded.tax).toBe(original.tax)
      expect(decoded.discount).toBe(original.discount)
      expect(decoded.total).toBe(original.total)
      expect(decoded.magicDust).toBe(original.magicDust)
      expect(decoded.items).toHaveLength(2)
      expect(decoded.items[0]!.description).toBe(original.items[0]!.description)
      expect(decoded.items[0]!.rate).toBe(original.items[0]!.rate)
      expect(decoded.items[1]!.description).toBe(original.items[1]!.description)
    })

    it('handles native ETH (no tokenAddress)', () => {
      const original: Invoice = {
        ...createMinimalInvoice(),
        currency: 'ETH',
        decimals: 18,
      }
      delete (original as Record<string, unknown>).tokenAddress

      const decoded = decodeInvoice(encodeInvoice(original))
      expect(decoded.currency).toBe('ETH')
      expect(decoded.tokenAddress).toBeUndefined()
    })

    it('handles Unicode characters', () => {
      const original = createMinimalInvoice()
      original.from.name = '日本株式会社'
      original.client.name = 'Société Française'
      original.items[0]!.description = 'Услуги консалтинга'

      const decoded = decodeInvoice(encodeInvoice(original))
      expect(decoded.from.name).toBe(original.from.name)
      expect(decoded.client.name).toBe(original.client.name)
      expect(decoded.items[0]!.description).toBe(original.items[0]!.description)
    })

    it('handles ERC-20 with magic dust', () => {
      const original: Invoice = {
        ...createMinimalInvoice(),
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        total: '150000042',
        magicDust: '42',
      }

      const decoded = decodeInvoice(encodeInvoice(original))
      expect(decoded.total).toBe('150000042')
      expect(decoded.magicDust).toBe('42')
      expect(decoded.tokenAddress?.toLowerCase()).toBe(original.tokenAddress?.toLowerCase())
    })

    it('handles multiple line items', () => {
      const original = createMinimalInvoice()
      original.items = Array.from({ length: 5 }, (_, i) => ({
        description: `Service ${i + 1}`,
        quantity: i + 1,
        rate: String((i + 1) * 100000000),
      }))

      const decoded = decodeInvoice(encodeInvoice(original))
      expect(decoded.items).toHaveLength(5)
      for (let i = 0; i < 5; i++) {
        expect(decoded.items[i]!.description).toBe(original.items[i]!.description)
        expect(decoded.items[i]!.rate).toBe(original.items[i]!.rate)
        expect(decoded.items[i]!.quantity).toBeCloseTo(original.items[i]!.quantity, 4)
      }
    })
  })
})
