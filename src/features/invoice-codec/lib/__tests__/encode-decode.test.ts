/**
 * Invoice Codec TLV v1 encode/decode tests
 *
 * Tests the rewritten codec with:
 * - Base64url (replaces Base62)
 * - Mantissa encoding for amounts
 * - writeQuantity/readQuantity for item quantities
 * - Chain dictionary for chainId
 * - App-level text dictionary
 * - dueAt as delta from issuedAt
 * - magicDust derived from salt (not stored as TLV record)
 */
import { describe, it, expect, vi } from 'vitest'
import { encodeInvoice, generateInvoiceUrl } from '../encode'
import { decodeInvoice } from '../decode'
import type { Invoice } from '@/entities/invoice'
import { readTlv, decodeBase64url, readVarInt } from '@/shared/lib/tlv-codec'
import { TlvType } from '../tlv-map'
import { deriveMagicDust } from '../security'

vi.mock('@/shared/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/config')>()
  return {
    ...actual,
    getAppBaseUrl: () => 'https://voidpay.xyz',
  }
})

const createMinimalInvoice = (): Invoice => ({
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
  total: '100000000',
})

const createUSDCInvoiceWith3Items = (): Invoice => ({
  invoiceId: 'USDC-001',
  issuedAt: 1704067200,
  dueAt: 1706745600,
  networkId: 42161, // Arbitrum — uses chain dict
  currency: 'USDC',
  decimals: 6,
  from: {
    name: 'Freelancer Inc',
    walletAddress: '0xaaaa000000000000000000000000000000000001',
  },
  client: {
    name: 'Client Corp',
  },
  items: [
    { description: 'Design work', quantity: 10, rate: '50000000' },
    { description: 'Development', quantity: 5, rate: '100000000' },
    { description: 'QA testing', quantity: 3, rate: '30000000' },
  ],
  total: '1090000000',
})

const createETHInvoice = (): Invoice => ({
  invoiceId: 'ETH-001',
  issuedAt: 1704067200,
  dueAt: 1709337600,
  networkId: 1,
  currency: 'ETH',
  decimals: 18,
  from: {
    name: 'ETH Contractor',
    walletAddress: '0xbbbb000000000000000000000000000000000002',
  },
  client: {
    name: 'ETH Client',
  },
  items: [{ description: 'Consulting', quantity: 1, rate: '1500000000000000000' }],
  total: '1500000000000000000',
})

const createFullInvoice = (): Invoice => ({
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
})

const createInvoiceWithMagicDust = (): Invoice => ({
  invoiceId: 'DUST-001',
  issuedAt: 1704067200,
  dueAt: 1706745600,
  networkId: 1,
  currency: 'USDC',
  decimals: 6,
  tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  from: {
    name: 'Dust Sender',
    walletAddress: '0x1234567890123456789012345678901234567890',
  },
  client: {
    name: 'Dust Client',
  },
  items: [{ description: 'Service', quantity: 1, rate: '150000000' }],
  total: '150000042',
  magicDust: '42',
})

describe('Invoice Codec TLV v1', () => {
  describe('encodeInvoice', () => {
    it('encodes minimal invoice without error', async () => {
      const encoded = await encodeInvoice(createMinimalInvoice())
      expect(encoded).toBeTruthy()
      expect(encoded.length).toBeGreaterThan(1)
    })

    it('encodes full invoice without error', async () => {
      const encoded = await encodeInvoice(createFullInvoice())
      expect(encoded).toBeTruthy()
    })

    it('output is valid Base64url (no padding, URL-safe chars)', async () => {
      const encoded = await encodeInvoice(createMinimalInvoice())
      // Base64url: A-Z a-z 0-9 - _ (no + / =)
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('encoded binary has correct magic byte and version', async () => {
      const encoded = await encodeInvoice(createMinimalInvoice())
      const bytes = decodeBase64url(encoded)
      expect(bytes[0]).toBe(0x56) // MAGIC
      expect(bytes[1]! & 0x7f).toBe(0x01) // VERSION (high bit = compression flag)
    })

    it('encoded TLV contains salt (Type 20, 8 bytes)', async () => {
      const encoded = await encodeInvoice(createMinimalInvoice())
      const bytes = decodeBase64url(encoded)
      const { records } = await readTlv(bytes)
      const salt = records.find((r) => r.type === TlvType.SALT)
      expect(salt).toBeDefined()
      expect(salt!.value.length).toBe(8)
    })

    it('records are in canonical order', async () => {
      const encoded = await encodeInvoice(createFullInvoice())
      const bytes = decodeBase64url(encoded)
      const { records } = await readTlv(bytes)
      for (let i = 1; i < records.length; i++) {
        expect(records[i]!.type).toBeGreaterThan(records[i - 1]!.type)
      }
    })

    it('invoiceId is individual TLV (Type 22), not in compressed block', async () => {
      const encoded = await encodeInvoice(createFullInvoice())
      const bytes = decodeBase64url(encoded)
      const { records } = await readTlv(bytes)
      const invoiceIdRecord = records.find((r) => r.type === TlvType.INVOICE_ID)
      expect(invoiceIdRecord).toBeDefined()
    })

    it('does not emit MAGIC_DUST TLV record (Type 25 removed)', async () => {
      const encoded = await encodeInvoice(createInvoiceWithMagicDust())
      const bytes = decodeBase64url(encoded)
      const { records } = await readTlv(bytes)
      // Type 25 was the old MAGIC_DUST — should not exist
      const magicDustRecord = records.find((r) => r.type === 25)
      expect(magicDustRecord).toBeUndefined()
    })

    it('chainId uses dict encoding for known chains', async () => {
      const encoded = await encodeInvoice(createUSDCInvoiceWith3Items())
      const bytes = decodeBase64url(encoded)
      const { records } = await readTlv(bytes)
      const chainIdRecord = records.find((r) => r.type === TlvType.CHAIN_ID)
      expect(chainIdRecord).toBeDefined()
      // Arbitrum (42161) → dict: 0x00, 0x02
      expect(chainIdRecord!.value[0]).toBe(0x00)
      expect(chainIdRecord!.value[1]).toBe(0x02)
    })

    it('dueAt is encoded as delta from issuedAt', async () => {
      const invoice = createMinimalInvoice()
      const encoded = await encodeInvoice(invoice)
      const bytes = decodeBase64url(encoded)
      const { records } = await readTlv(bytes)
      const dueAtRecord = records.find((r) => r.type === TlvType.DUE_AT)
      expect(dueAtRecord).toBeDefined()
      // dueAt - issuedAt = 2678400 (~31 days in seconds)
      // Stored as varint delta, not absolute uint32
      // 2678400 needs 4 varint bytes (same as uint32 for large deltas)
      // but shorter deltas (< ~16 days) would save bytes
      const { value: delta } = readVarInt(dueAtRecord!.value, 0)
      expect(delta).toBe(2678400)
    })
  })

  describe('decodeInvoice', () => {
    it('decodes minimal invoice correctly', async () => {
      const original = createMinimalInvoice()
      const encoded = await encodeInvoice(original)
      const decoded = await decodeInvoice(encoded)

      expect(decoded.invoiceId).toBe(original.invoiceId)
      expect(decoded.networkId).toBe(original.networkId)
      expect(decoded.currency).toBe(original.currency)
      expect(decoded.decimals).toBe(original.decimals)
      expect(decoded.from.name).toBe(original.from.name)
      expect(decoded.client.name).toBe(original.client.name)
    })

    it('throws on empty string', async () => {
      await expect(decodeInvoice('')).rejects.toThrow('Empty invoice data')
    })

    it('throws on invalid Base64url', async () => {
      await expect(decodeInvoice('!!invalid!!')).rejects.toThrow()
    })

    it('validates against schema', async () => {
      const encoded = await encodeInvoice(createMinimalInvoice())
      const decoded = await decodeInvoice(encoded)
      expect(decoded.from.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  describe('generateInvoiceUrl', () => {
    it('generates URL with hash fragment (Base64url)', async () => {
      const url = await generateInvoiceUrl(createMinimalInvoice())
      expect(url).toMatch(/^https:\/\/voidpay\.xyz\/pay#[A-Za-z0-9_-]+$/)
    })

    it('uses custom base URL', async () => {
      const url = await generateInvoiceUrl(createMinimalInvoice(), { baseUrl: 'https://custom.domain' })
      expect(url).toMatch(/^https:\/\/custom\.domain\/pay#/)
    })

    it('supports legacy string baseUrl argument', async () => {
      const url = await generateInvoiceUrl(createMinimalInvoice(), 'https://legacy.domain')
      expect(url).toMatch(/^https:\/\/legacy\.domain\/pay#/)
    })

    it('generates URL with OG preview', async () => {
      const url = await generateInvoiceUrl(createMinimalInvoice(), { includeOG: true })
      expect(url).toContain('?og=')
      expect(url).toMatch(/#[A-Za-z0-9_-]+$/)
    })

    it('throws when URL exceeds 2000 bytes', async () => {
      const invoice = createMinimalInvoice()
      let seed = 12345
      const pseudoRandom = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed
      }
      invoice.notes = Array.from({ length: 3000 }, () =>
        String.fromCharCode(32 + (pseudoRandom() % 95))
      ).join('')

      await expect(generateInvoiceUrl(invoice)).rejects.toThrow(/exceeds|size/i)
    })

    it('stays under 2000 bytes for typical invoice', async () => {
      const url = await generateInvoiceUrl(createFullInvoice())
      const byteSize = new TextEncoder().encode(url).length
      expect(byteSize).toBeLessThanOrEqual(2000)
    })
  })

  describe('roundtrip encode/decode', () => {
    it('preserves minimal invoice fields', async () => {
      const original = createMinimalInvoice()
      const decoded = await decodeInvoice(await encodeInvoice(original))

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

    it('preserves full invoice fields (all optional fields)', async () => {
      const original = createFullInvoice()
      const decoded = await decodeInvoice(await encodeInvoice(original))

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
      expect(decoded.items).toHaveLength(2)
      expect(decoded.items[0]!.description).toBe(original.items[0]!.description)
      expect(decoded.items[0]!.rate).toBe(original.items[0]!.rate)
      expect(decoded.items[1]!.description).toBe(original.items[1]!.description)
    })

    it('preserves USDC invoice with 3 items (integer quantities, 6 decimals)', async () => {
      const original = createUSDCInvoiceWith3Items()
      const decoded = await decodeInvoice(await encodeInvoice(original))

      expect(decoded.networkId).toBe(42161) // Arbitrum chain dict roundtrip
      expect(decoded.currency).toBe('USDC')
      expect(decoded.decimals).toBe(6)
      expect(decoded.items).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(decoded.items[i]!.description).toBe(original.items[i]!.description)
        expect(decoded.items[i]!.quantity).toBe(original.items[i]!.quantity)
        expect(decoded.items[i]!.rate).toBe(original.items[i]!.rate)
      }
    })

    it('preserves ETH invoice (18 decimals — large trailing zeros in mantissa)', async () => {
      const original = createETHInvoice()
      const decoded = await decodeInvoice(await encodeInvoice(original))

      expect(decoded.currency).toBe('ETH')
      expect(decoded.decimals).toBe(18)
      expect(decoded.items[0]!.rate).toBe('1500000000000000000')
      // dueAt delta: 1709337600 - 1704067200 = 5270400
      expect(decoded.dueAt).toBe(original.dueAt)
    })

    it('derives magicDust from salt and total = subtotal + magicDust', async () => {
      const original = createInvoiceWithMagicDust()
      // original.total = '150000042', original.magicDust = '42'
      // subtotal stored = 150000042 - 42 = 150000000

      const encoded = await encodeInvoice(original)
      const decoded = await decodeInvoice(encoded)

      // The decoder derives magicDust from salt (not from a stored TLV record)
      // So the decoded magicDust will differ from the original (42) since
      // deriveMagicDust uses the random salt. But total = subtotal + decoded.magicDust.
      const decodedMagicDust = BigInt(decoded.magicDust!)
      expect(decodedMagicDust).toBeGreaterThanOrEqual(1n)
      expect(decodedMagicDust).toBeLessThanOrEqual(999n)

      // Verify: decoded.total = original subtotal (150000000) + derived magicDust
      const originalSubtotal = BigInt(original.total!) - BigInt(original.magicDust!)
      expect(BigInt(decoded.total!)).toBe(originalSubtotal + decodedMagicDust)
    })

    it('handles invoice without magicDust (total stored as-is)', async () => {
      const original = createMinimalInvoice()
      // No magicDust → subtotal = total
      const encoded = await encodeInvoice(original)
      const decoded = await decodeInvoice(encoded)

      // Decoder always derives magicDust from salt and adds it
      const decodedMagicDust = BigInt(decoded.magicDust!)
      expect(decodedMagicDust).toBeGreaterThanOrEqual(1n)
      expect(decodedMagicDust).toBeLessThanOrEqual(999n)

      // total = original total + derived magicDust
      expect(BigInt(decoded.total!)).toBe(BigInt(original.total!) + decodedMagicDust)
    })

    it('chainId encoding: Arbitrum (42161) uses dict code', async () => {
      const original = createUSDCInvoiceWith3Items() // networkId: 42161
      const decoded = await decodeInvoice(await encodeInvoice(original))
      expect(decoded.networkId).toBe(42161)
    })

    it('chainId encoding: unknown chain uses raw varint', async () => {
      const original: Invoice = {
        ...createMinimalInvoice(),
        networkId: 56, // BSC — not in chain dict
      }
      const decoded = await decodeInvoice(await encodeInvoice(original))
      expect(decoded.networkId).toBe(56)
    })

    it('dueAt correctly reconstructed from issuedAt + delta', async () => {
      const original = createMinimalInvoice()
      // issuedAt: 1704067200, dueAt: 1706745600, delta: 2678400
      const decoded = await decodeInvoice(await encodeInvoice(original))
      expect(decoded.issuedAt).toBe(1704067200)
      expect(decoded.dueAt).toBe(1706745600)
    })

    it('handles native ETH (no tokenAddress)', async () => {
      const original: Invoice = {
        ...createMinimalInvoice(),
        currency: 'ETH',
        decimals: 18,
      }
      delete (original as Record<string, unknown>).tokenAddress

      const decoded = await decodeInvoice(await encodeInvoice(original))
      expect(decoded.currency).toBe('ETH')
      expect(decoded.tokenAddress).toBeUndefined()
    })

    it('handles Unicode characters', async () => {
      const original = createMinimalInvoice()
      original.from.name = '日本株式会社'
      original.client.name = 'Société Française'
      original.items[0]!.description = 'Услуги консалтинга'

      const decoded = await decodeInvoice(await encodeInvoice(original))
      expect(decoded.from.name).toBe(original.from.name)
      expect(decoded.client.name).toBe(original.client.name)
      expect(decoded.items[0]!.description).toBe(original.items[0]!.description)
    })

    it('handles ERC-20 with dict token address', async () => {
      const original: Invoice = {
        ...createMinimalInvoice(),
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC on Ethereum
      }

      const decoded = await decodeInvoice(await encodeInvoice(original))
      expect(decoded.tokenAddress?.toLowerCase()).toBe(original.tokenAddress?.toLowerCase())
    })

    it('handles multiple line items with fractional quantities', async () => {
      const original = createMinimalInvoice()
      original.items = [
        { description: 'Hours', quantity: 1.5, rate: '100000000' },
        { description: 'Units', quantity: 0.25, rate: '200000000' },
        { description: 'Bulk', quantity: 100, rate: '50000000' },
      ]

      const decoded = await decodeInvoice(await encodeInvoice(original))
      expect(decoded.items).toHaveLength(3)
      expect(decoded.items[0]!.quantity).toBeCloseTo(1.5, 4)
      expect(decoded.items[1]!.quantity).toBeCloseTo(0.25, 4)
      expect(decoded.items[2]!.quantity).toBe(100)
    })

    it('app-dict roundtrip: email with @gmail.com', async () => {
      const original: Invoice = {
        ...createMinimalInvoice(),
        from: {
          ...createMinimalInvoice().from,
          email: 'user@gmail.com',
        },
      }
      const decoded = await decodeInvoice(await encodeInvoice(original))
      expect(decoded.from.email).toBe('user@gmail.com')
    })

    it('handles zero dueAt delta (dueAt === issuedAt)', async () => {
      const original: Invoice = {
        ...createMinimalInvoice(),
        dueAt: createMinimalInvoice().issuedAt, // same as issuedAt → delta = 0
      }
      const decoded = await decodeInvoice(await encodeInvoice(original))
      expect(decoded.dueAt).toBe(decoded.issuedAt)
    })
  })
})
