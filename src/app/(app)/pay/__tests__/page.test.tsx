import { describe, it, expect, vi } from 'vitest'
import { generateMetadata } from '../page'

// Mock decodeOGPreview
vi.mock('@/features/invoice-codec', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/invoice-codec')>()
  return {
    ...actual,
    decodeOGPreview: vi.fn((og: string) => {
      if (og === 'invalid') return null
      if (og === 'throw') throw new Error('Parse error')
      // Valid OG data
      return {
        id: 'INV-001',
        amount: '100.00',
        currency: 'USDC',
        network: 'arb',
        from: 'Acme Corp',
        due: '0215',
      }
    }),
  }
})

describe('generateMetadata', () => {
  describe('with ?og= parameter', () => {
    it('generates dynamic metadata from valid OG param', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ og: 'INV-001_100_USDC_arb_Acme' }),
      })

      expect(metadata.title).toBe('Pay 100.00 USDC — Invoice INV-001 | VoidPay')
      expect(metadata.description).toContain('100.00 USDC on ARB')
      expect(metadata.description).toContain('from Acme Corp')
      expect(metadata.description).toContain('Powered by VoidPay')
    })

    it('includes openGraph metadata', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ og: 'INV-001_100_USDC_arb' }),
      })

      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toBe('Pay 100.00 USDC — Invoice INV-001 | VoidPay')
      expect(metadata.openGraph?.type).toBe('website')
      expect(metadata.openGraph?.siteName).toBe('VoidPay')
    })

    it('includes twitter card metadata', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ og: 'INV-001_100_USDC_arb' }),
      })

      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter?.card).toBe('summary_large_image')
    })

    it('sets noindex/nofollow robots meta', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ og: 'INV-001_100_USDC_arb' }),
      })

      expect(metadata.robots).toEqual({
        index: false,
        follow: false,
      })
    })
  })

  describe('without ?og= parameter', () => {
    it('returns default metadata when og is missing', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({}),
      })

      expect(metadata.title).toBe('Pay Invoice | VoidPay')
      expect(metadata.description).toContain('View and pay crypto invoices')
    })

    it('returns default metadata when og is empty', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ og: '' }),
      })

      expect(metadata.title).toBe('Pay Invoice | VoidPay')
    })
  })

  describe('error handling', () => {
    it('returns default metadata when decodeOGPreview returns null', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ og: 'invalid' }),
      })

      expect(metadata.title).toBe('Pay Invoice | VoidPay')
    })

    it('returns default metadata when decodeOGPreview throws', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ og: 'throw' }),
      })

      expect(metadata.title).toBe('Pay Invoice | VoidPay')
    })
  })
})
