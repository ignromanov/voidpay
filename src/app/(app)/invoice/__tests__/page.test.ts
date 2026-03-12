import { describe, it, expect, vi } from 'vitest'

vi.mock('@/features/invoice-codec', () => ({
  decodeOGPreview: vi.fn((og: string) => {
    if (og === 'INV-001_100_USDC_arb_Acme') {
      return { id: 'INV-001', amount: '100', currency: 'USDC', network: 'arb', from: 'Acme' }
    }
    return null
  }),
}))

// Mock InvoiceWorkspace to avoid pulling in full component tree
vi.mock('../InvoiceWorkspace', () => ({
  InvoiceWorkspace: () => null,
}))

import { generateMetadata } from '../page'

describe('Invoice page metadata', () => {
  it('sets noindex/nofollow by default', async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({}) })
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('sets noindex/nofollow even with OG params', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ og: 'INV-001_100_USDC_arb_Acme' }),
    })
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('includes invoice ID in title when OG provided', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ og: 'INV-001_100_USDC_arb_Acme' }),
    })
    expect(metadata.title).toContain('INV-001')
  })

  it('returns default title when no OG param', async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({}) })
    expect(metadata.title).toBe('Track Invoice | VoidPay')
  })

  it('returns default metadata when OG param is invalid', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ og: 'invalid-og-string' }),
    })
    expect(metadata.title).toBe('Track Invoice | VoidPay')
  })
})
