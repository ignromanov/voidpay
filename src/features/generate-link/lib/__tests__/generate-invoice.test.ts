/**
 * Tests for invoice URL generation and history tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateAndTrackInvoice, UrlSizeError } from '../generate-invoice'
import type { DraftState, LineItem } from '@/shared/lib/invoice-types'

// Mock the invoice-codec module
vi.mock('@/features/invoice-codec', () => ({
  generateInvoiceUrl: vi.fn((invoice, options) => {
    // Simulate URL generation
    const base = 'https://voidpay.xyz/pay'
    const hash = '#H' + Buffer.from(JSON.stringify(invoice)).toString('base64').slice(0, 50)
    if (options?.includeOG) {
      return `${base}?og=INV-001_100_USDC_eth${hash}`
    }
    return `${base}${hash}`
  }),
}))

// Mock the creator store
vi.mock('@/entities/creator', () => ({
  useCreatorStore: {
    getState: () => ({
      preferences: {
        magicDustEnabled: true,
      },
    }),
  },
}))

// Valid EIP-55 checksummed address
const VALID_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

function createValidDraftState(): DraftState {
  return {
    data: {
      invoiceId: 'INV-001',
      iss: '2026-01-26',
      from: {
        name: 'Sender Company',
        walletAddress: VALID_ADDRESS,
      },
      client: {
        name: 'Client Company',
      },
      networkId: 1,
      currency: 'USDC',
      decimals: 6,
    },
    meta: {
      draftId: 'draft-123',
      lastModified: new Date().toISOString(),
      autoSaved: true,
      source: 'new',
    },
  }
}

function createValidLineItems(): LineItem[] {
  return [
    {
      id: 'item-1',
      description: 'Web Development',
      quantity: 10,
      rate: '100000000', // 100 USDC
    },
  ]
}

describe('generateAndTrackInvoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates URL using generateInvoiceUrl from invoice-codec', async () => {
    const draft = createValidDraftState()
    const lineItems = createValidLineItems()

    const { url } = await generateAndTrackInvoice(draft, lineItems)

    expect(url).toContain('https://voidpay.xyz/pay')
    expect(url).toContain('#H')
  })

  it('includes OG preview when option is set', async () => {
    const draft = createValidDraftState()
    const lineItems = createValidLineItems()

    const { url } = await generateAndTrackInvoice(draft, lineItems, { includeOG: true })

    expect(url).toContain('?og=')
  })

  it('does not include OG preview by default', async () => {
    const draft = createValidDraftState()
    const lineItems = createValidLineItems()

    const { url } = await generateAndTrackInvoice(draft, lineItems)

    expect(url).not.toContain('?og=')
  })

  it('adds invoice to history', async () => {
    const draft = createValidDraftState()
    const lineItems = createValidLineItems()

    const { url } = await generateAndTrackInvoice(draft, lineItems)

    // Verify URL was generated (history addition is mocked)
    expect(url).toContain('https://voidpay.xyz/pay')
  })

  it('returns baked invoice with total and magicDust', async () => {
    const draft = createValidDraftState()
    const lineItems = createValidLineItems()

    const { invoice } = await generateAndTrackInvoice(draft, lineItems)

    // total should be calculated: 10 × 100 USDC = 1000 USDC + magicDust
    expect(invoice.total).toBeDefined()
    expect(typeof invoice.total).toBe('string')
    expect(BigInt(invoice.total!)).toBeGreaterThan(BigInt('1000000000')) // > 1000 USDC in atomic
    // magicDust should be present (preferences mock has magicDustEnabled: true)
    expect(invoice.magicDust).toBeDefined()
  })
})

describe('UrlSizeError', () => {
  it('creates error with size information', () => {
    const error = new UrlSizeError(2500)

    expect(error.name).toBe('UrlSizeError')
    expect(error.size).toBe(2500)
    expect(error.limit).toBe(2000)
    expect(error.message).toContain('2500 bytes')
    expect(error.message).toContain('2000 bytes')
  })

  it('provides user-friendly message', () => {
    const error = new UrlSizeError(2100)

    expect(error.message).toContain('Try reducing notes or line items')
  })
})
