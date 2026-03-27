import { describe, it, expect } from 'vitest'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import { buildDocument, buildFilename } from '../lib/build-document'
import type { PartialInvoice } from '@/shared/lib/invoice-types'

const MOCK_INVOICE: PartialInvoice = {
  invoiceId: 'INV-001',
  issuedAt: 1710000000,
  dueAt: 1712678400,
  networkId: 42161,
  currency: 'USDC',
  decimals: 6,
  from: { name: 'Acme Corp', walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
  client: { name: 'Client Inc' },
  items: [
    { description: 'Web Design', quantity: 1, rate: '1000000000' },
    { description: 'Hosting', quantity: 12, rate: '25000000' },
  ],
  total: '1300000000',
}

/** Recursively extract all text strings from a pdfmake content tree */
function extractText(content: unknown): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (typeof content === 'number') return String(content)
  if (Array.isArray(content)) return content.map(extractText).join(' ')
  if (typeof content === 'object') {
    const obj = content as Record<string, unknown>
    return Object.values(obj).map(extractText).join(' ')
  }
  return ''
}

function extractAllText(doc: TDocumentDefinitions): string {
  return extractText(doc.content)
}

describe('buildDocument', () => {
  it('returns valid TDocumentDefinitions with A4 page', () => {
    const doc = buildDocument(MOCK_INVOICE, {})
    expect(doc).toBeDefined()
    expect(doc.pageSize).toBe('A4')
    expect(doc.pageOrientation).toBe('portrait')
    expect(doc.content).toBeDefined()
    expect(Array.isArray(doc.content)).toBe(true)
  })

  it('content includes invoice ID', () => {
    const doc = buildDocument(MOCK_INVOICE, {})
    const text = extractAllText(doc)
    expect(text).toContain('INV-001')
  })

  it('content includes party names (Acme Corp, Client Inc)', () => {
    const doc = buildDocument(MOCK_INVOICE, {})
    const text = extractAllText(doc)
    expect(text).toContain('Acme Corp')
    expect(text).toContain('Client Inc')
  })

  it('content includes line item descriptions', () => {
    const doc = buildDocument(MOCK_INVOICE, {})
    const text = extractAllText(doc)
    expect(text).toContain('Web Design')
    expect(text).toContain('Hosting')
  })

  it('content includes formatted total with currency (1,300.00 USDC)', () => {
    const doc = buildDocument(MOCK_INVOICE, {})
    const text = extractAllText(doc)
    expect(text).toContain('1,300.00')
    expect(text).toContain('USDC')
  })

  it('sets watermark from status', () => {
    const doc = buildDocument(MOCK_INVOICE, { status: 'paid' })
    expect(doc.watermark).toBeDefined()
    const wm = doc.watermark as { text: string; opacity: number }
    expect(wm.text).toBe('PAID')
    expect(wm.opacity).toBeLessThan(0.2)
  })

  it('sets watermark from draft status', () => {
    const doc = buildDocument(MOCK_INVOICE, { status: 'draft' })
    const wm = doc.watermark as { text: string }
    expect(wm.text).toBe('DRAFT')
  })

  it('omits watermark when no status', () => {
    const doc = buildDocument(MOCK_INVOICE, {})
    expect(doc.watermark).toBeUndefined()
  })

  it('includes QR when invoiceUrl provided', () => {
    const invoiceUrl = 'https://voidpay.xyz/pay#test'
    const doc = buildDocument(MOCK_INVOICE, { invoiceUrl })
    const text = extractText(doc.content)
    expect(text).toContain(invoiceUrl)
  })

  it('includes txHash in footer when provided', () => {
    const txHash = '0xabc123def456'
    const doc = buildDocument(MOCK_INVOICE, { txHash })
    const text = extractAllText(doc)
    expect(text).toContain(txHash)
  })

  it('includes notes when present', () => {
    const invoiceWithNotes: PartialInvoice = {
      ...MOCK_INVOICE,
      notes: 'Payment due within 30 days. Bank transfer preferred.',
    }
    const doc = buildDocument(invoiceWithNotes, {})
    const text = extractAllText(doc)
    expect(text).toContain('Payment due within 30 days')
  })

  it('includes tax in totals section when present', () => {
    const invoiceWithTax: PartialInvoice = {
      ...MOCK_INVOICE,
      total: undefined,
      tax: '10',
    }
    const doc = buildDocument(invoiceWithTax, {})
    const text = extractAllText(doc)
    expect(text).toMatch(/tax/i)
  })

  it('includes discount in totals section when present', () => {
    const invoiceWithDiscount: PartialInvoice = {
      ...MOCK_INVOICE,
      total: undefined,
      discount: '5',
    }
    const doc = buildDocument(invoiceWithDiscount, {})
    const text = extractAllText(doc)
    expect(text).toMatch(/discount/i)
  })

  it('includes magic dust when present', () => {
    const invoiceWithDust: PartialInvoice = {
      ...MOCK_INVOICE,
      magicDust: '42',
    }
    const doc = buildDocument(invoiceWithDust, {})
    const text = extractAllText(doc)
    expect(text).toMatch(/magic dust/i)
  })

  it('handles empty/minimal invoice gracefully', () => {
    const empty: PartialInvoice = {}
    expect(() => buildDocument(empty, {})).not.toThrow()
    const doc = buildDocument(empty, {})
    expect(doc.content).toBeDefined()
    expect(doc.pageSize).toBe('A4')
  })
})

describe('buildFilename', () => {
  it('formats as voidpay-{id}-{total}-{currency}.pdf', () => {
    const filename = buildFilename(MOCK_INVOICE)
    expect(filename).toBe('voidpay-INV-001-1300.00-USDC.pdf')
  })

  it('handles missing fields with default filename', () => {
    const filename = buildFilename({})
    expect(filename).toBe('voidpay-invoice.pdf')
  })

  it('uses human-readable total (not atomic units)', () => {
    const invoice: PartialInvoice = {
      invoiceId: 'INV-002',
      total: '500000000',
      decimals: 6,
      currency: 'USDC',
    }
    const filename = buildFilename(invoice)
    // Should be 500.00, not 500000000
    expect(filename).toBe('voidpay-INV-002-500.00-USDC.pdf')
    expect(filename).not.toContain('500000000')
  })
})
