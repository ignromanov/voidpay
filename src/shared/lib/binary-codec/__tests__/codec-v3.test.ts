/**
 * Binary Codec V3 tests
 * Tests encoder and decoder roundtrip for the hybrid compression strategy
 */
import { describe, it, expect } from 'vitest'
import { encodeBinaryV3 } from '../encoder-v3'
import { decodeBinaryV3 } from '../decoder-v3'
import type { Invoice } from '@/shared/lib/invoice-types'

describe('Binary Codec V3', () => {
  const createMinimalInvoice = (): Invoice => ({
    version: 2,
    invoiceId: 'INV-001',
    issuedAt: 1704067200, // Jan 1, 2024
    dueAt: 1706745600, // Feb 1, 2024
    networkId: 1, // Ethereum
    currency: 'USDC',
    decimals: 6,
    from: {
      name: 'Sender Corp',
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
    client: {
      name: 'Client Inc',
    },
    items: [{ description: 'Consulting services', quantity: 10, rate: '100' }],
  })

  const createFullInvoice = (): Invoice => ({
    version: 2,
    invoiceId: 'FULL-INV-2024-001',
    issuedAt: 1704067200,
    dueAt: 1706745600,
    networkId: 42161, // Arbitrum
    currency: 'ETH',
    tokenAddress: '0xdead000000000000000000000000000000000000',
    decimals: 18,
    notes: 'Payment for Q1 2024 consulting services',
    from: {
      name: 'Acme Corporation',
      walletAddress: '0xaaaa000000000000000000000000000000000001',
      email: 'billing@acme.com',
      physicalAddress: '123 Main St, New York, NY 10001',
      phone: '+1-555-123-4567',
    },
    client: {
      name: 'Beta Industries',
      walletAddress: '0xbbbb000000000000000000000000000000000002',
      email: 'accounts@beta.io',
      physicalAddress: '456 Oak Ave, San Francisco, CA 94102',
      phone: '+1-555-987-6543',
    },
    items: [
      { description: 'Strategy consulting', quantity: 40, rate: '250' },
      { description: 'Technical implementation', quantity: 80, rate: '200' },
      { description: 'Project management', quantity: 20, rate: '175' },
    ],
    tax: '8.25',
    discount: '500',
  })

  describe('encoder', () => {
    it('encodes minimal invoice', () => {
      const invoice = createMinimalInvoice()
      const encoded = encodeBinaryV3(invoice)

      expect(encoded).toMatch(/^H/)
      expect(encoded.length).toBeGreaterThan(1)
    })

    it('encodes full invoice', () => {
      const invoice = createFullInvoice()
      const encoded = encodeBinaryV3(invoice)

      expect(encoded).toMatch(/^H/)
      expect(encoded.length).toBeGreaterThan(50)
    })

    it('produces different outputs for different invoices', () => {
      const invoice1 = createMinimalInvoice()
      const invoice2 = { ...createMinimalInvoice(), invoiceId: 'INV-002' }

      const encoded1 = encodeBinaryV3(invoice1)
      const encoded2 = encodeBinaryV3(invoice2)

      expect(encoded1).not.toBe(encoded2)
    })

    it('uses dictionary for common currencies', () => {
      const invoiceUSDC = createMinimalInvoice()
      invoiceUSDC.currency = 'USDC'

      const invoiceCustom = createMinimalInvoice()
      invoiceCustom.currency = 'CUSTOM_TOKEN'

      const encodedUSDC = encodeBinaryV3(invoiceUSDC)
      const encodedCustom = encodeBinaryV3(invoiceCustom)

      // USDC uses dictionary (shorter)
      expect(encodedUSDC.length).toBeLessThan(encodedCustom.length)
    })
  })

  describe('decoder', () => {
    it('decodes encoded minimal invoice', () => {
      const original = createMinimalInvoice()
      const encoded = encodeBinaryV3(original)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.networkId).toBe(original.networkId)
      expect(decoded.currency).toBe(original.currency)
    })

    it('throws error for invalid prefix', () => {
      expect(() => decodeBinaryV3('X1234')).toThrow('Invalid V3 encoding: must start with H')
    })

    it('throws error for empty string', () => {
      expect(() => decodeBinaryV3('')).toThrow('Invalid V3 encoding: must start with H')
    })
  })

  describe('roundtrip', () => {
    it('preserves minimal invoice data', () => {
      const original = createMinimalInvoice()
      const encoded = encodeBinaryV3(original)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.version).toBe(2)
      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.issuedAt).toBe(original.issuedAt)
      expect(decoded.dueAt).toBe(original.dueAt)
      expect(decoded.networkId).toBe(original.networkId)
      expect(decoded.currency).toBe(original.currency)
      expect(decoded.decimals).toBe(original.decimals)
      expect(decoded.from.name).toBe(original.from.name)
      expect(decoded.from.walletAddress.toLowerCase()).toBe(original.from.walletAddress.toLowerCase())
      expect(decoded.client.name).toBe(original.client.name)
      expect(decoded.items).toHaveLength(1)
      expect(decoded.items[0].description).toBe(original.items[0].description)
      expect(decoded.items[0].quantity).toBe(original.items[0].quantity)
      expect(decoded.items[0].rate).toBe(original.items[0].rate)
    })

    it('preserves full invoice data', () => {
      const original = createFullInvoice()
      const encoded = encodeBinaryV3(original)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.notes).toBe(original.notes)
      expect(decoded.tokenAddress?.toLowerCase()).toBe(original.tokenAddress?.toLowerCase())

      expect(decoded.from.name).toBe(original.from.name)
      expect(decoded.from.email).toBe(original.from.email)
      expect(decoded.from.physicalAddress).toBe(original.from.physicalAddress)
      expect(decoded.from.phone).toBe(original.from.phone)

      expect(decoded.client.name).toBe(original.client.name)
      expect(decoded.client.walletAddress?.toLowerCase()).toBe(
        original.client.walletAddress?.toLowerCase()
      )
      expect(decoded.client.email).toBe(original.client.email)
      expect(decoded.client.physicalAddress).toBe(original.client.physicalAddress)
      expect(decoded.client.phone).toBe(original.client.phone)

      expect(decoded.tax).toBe(original.tax)
      expect(decoded.discount).toBe(original.discount)

      expect(decoded.items).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(decoded.items[i].description).toBe(original.items[i].description)
        expect(decoded.items[i].quantity).toBe(original.items[i].quantity)
        expect(decoded.items[i].rate).toBe(original.items[i].rate)
      }
    })

    it('handles different network IDs', () => {
      const networks = [
        { id: 1, name: 'Ethereum' },
        { id: 42161, name: 'Arbitrum' },
        { id: 10, name: 'Optimism' },
        { id: 137, name: 'Polygon' },
      ]

      for (const network of networks) {
        const invoice = createMinimalInvoice()
        invoice.networkId = network.id

        const encoded = encodeBinaryV3(invoice)
        const decoded = decodeBinaryV3(encoded)

        expect(decoded.networkId).toBe(network.id)
      }
    })

    it('handles different decimal values', () => {
      const decimals = [6, 8, 18]

      for (const dec of decimals) {
        const invoice = createMinimalInvoice()
        invoice.decimals = dec

        const encoded = encodeBinaryV3(invoice)
        const decoded = decodeBinaryV3(encoded)

        expect(decoded.decimals).toBe(dec)
      }
    })

    it('handles multiple line items', () => {
      const invoice = createMinimalInvoice()
      invoice.items = [
        { description: 'Item 1', quantity: 1, rate: '100' },
        { description: 'Item 2', quantity: 2, rate: '200' },
        { description: 'Item 3', quantity: 3, rate: '300' },
        { description: 'Item 4', quantity: 4, rate: '400' },
        { description: 'Item 5', quantity: 5, rate: '500' },
      ]

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.items).toHaveLength(5)
      for (let i = 0; i < 5; i++) {
        expect(decoded.items[i].description).toBe(`Item ${i + 1}`)
        expect(decoded.items[i].quantity).toBe(i + 1)
        expect(decoded.items[i].rate).toBe(`${(i + 1) * 100}`)
      }
    })

    it('handles special characters in text fields', () => {
      const invoice = createMinimalInvoice()
      invoice.invoiceId = 'INV-2024/Q1-001'
      invoice.from.name = 'Sender & Co. Ltd.'
      invoice.client.name = "Client's Business"
      invoice.items[0].description = 'Service: "Premium" tier'
      invoice.notes = 'Payment via ETH\nThank you!'

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.invoiceId).toBe(invoice.invoiceId)
      expect(decoded.from.name).toBe(invoice.from.name)
      expect(decoded.client.name).toBe(invoice.client.name)
      expect(decoded.items[0].description).toBe(invoice.items[0].description)
      expect(decoded.notes).toBe(invoice.notes)
    })

    it('handles Unicode characters', () => {
      const invoice = createMinimalInvoice()
      invoice.from.name = '株式会社テスト'
      invoice.client.name = 'Société Générale'
      invoice.items[0].description = 'Консалтинг услуги'
      invoice.notes = '支付说明 📝'

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.from.name).toBe(invoice.from.name)
      expect(decoded.client.name).toBe(invoice.client.name)
      expect(decoded.items[0].description).toBe(invoice.items[0].description)
      expect(decoded.notes).toBe(invoice.notes)
    })

    it('handles large quantity values', () => {
      const invoice = createMinimalInvoice()
      invoice.items[0].quantity = 999999

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.items[0].quantity).toBe(999999)
    })

    it('handles decimal quantity values', () => {
      const invoice = createMinimalInvoice()
      invoice.items[0].quantity = 1.5

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.items[0].quantity).toBe(1.5)
    })

    it('handles large rate values', () => {
      const invoice = createMinimalInvoice()
      invoice.items[0].rate = '1000000000000' // 1 trillion

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.items[0].rate).toBe('1000000000000')
    })
  })

  describe('compression', () => {
    it('compresses long text when beneficial', () => {
      const shortInvoice = createMinimalInvoice()
      const longInvoice = createMinimalInvoice()

      // Add very long notes to trigger compression
      longInvoice.notes = 'A'.repeat(200)

      const shortEncoded = encodeBinaryV3(shortInvoice)
      const longEncoded = encodeBinaryV3(longInvoice)

      // Long invoice should still decode correctly
      const decoded = decodeBinaryV3(longEncoded)
      expect(decoded.notes).toBe(longInvoice.notes)

      // Compression should keep size manageable
      // 200 chars of 'A' compresses very well
      expect(longEncoded.length).toBeLessThan(shortEncoded.length + 200)
    })

    it('handles compression of repetitive content', () => {
      const invoice = createMinimalInvoice()
      invoice.notes = 'Lorem ipsum dolor sit amet. '.repeat(10)
      invoice.from.physicalAddress = '123 Main Street, Suite 100, City Name'.repeat(3)

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.notes).toBe(invoice.notes)
      expect(decoded.from.physicalAddress).toBe(invoice.from.physicalAddress)
    })
  })

  describe('edge cases', () => {
    it('handles invoice with minimum due date delta', () => {
      const invoice = createMinimalInvoice()
      invoice.dueAt = invoice.issuedAt + 1 // 1 second later

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.dueAt).toBe(invoice.dueAt)
    })

    it('handles invoice with large due date delta', () => {
      const invoice = createMinimalInvoice()
      invoice.dueAt = invoice.issuedAt + 365 * 24 * 60 * 60 // 1 year later

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.dueAt).toBe(invoice.dueAt)
    })

    it('handles checksummed addresses', () => {
      const invoice = createMinimalInvoice()
      invoice.from.walletAddress = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B' // Vitalik's address

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      // Addresses should match (case-insensitive)
      expect(decoded.from.walletAddress.toLowerCase()).toBe(invoice.from.walletAddress.toLowerCase())
    })

    it('handles empty optional fields', () => {
      const invoice = createMinimalInvoice()
      // All optional fields are undefined

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.notes).toBeUndefined()
      expect(decoded.tokenAddress).toBeUndefined()
      expect(decoded.from.email).toBeUndefined()
      expect(decoded.from.physicalAddress).toBeUndefined()
      expect(decoded.from.phone).toBeUndefined()
      expect(decoded.client.walletAddress).toBeUndefined()
      expect(decoded.client.email).toBeUndefined()
      expect(decoded.client.physicalAddress).toBeUndefined()
      expect(decoded.client.phone).toBeUndefined()
      expect(decoded.tax).toBeUndefined()
      expect(decoded.discount).toBeUndefined()
    })

    it('handles very long invoice ID', () => {
      const invoice = createMinimalInvoice()
      invoice.invoiceId = 'INV-2024-Q1-PROJECT-ALPHA-PHASE-2-MILESTONE-3-DELIVERABLE-A'

      const encoded = encodeBinaryV3(invoice)
      const decoded = decodeBinaryV3(encoded)

      expect(decoded.invoiceId).toBe(invoice.invoiceId)
    })
  })
})
