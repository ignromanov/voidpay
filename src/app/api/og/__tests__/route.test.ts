import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDecodeOGPreview = vi.fn()
vi.mock('@/features/invoice-codec', () => ({
  decodeOGPreview: (...args: unknown[]) => mockDecodeOGPreview(...args),
}))

const mockRenderInvoiceOG = vi.fn()
const mockRenderBrandingOG = vi.fn()
vi.mock('@/features/og-image', () => ({
  OG_SIZES: {
    opengraph: { width: 1200, height: 630 },
    twitter: { width: 1200, height: 600 },
  },
  renderInvoiceOG: (...args: unknown[]) => mockRenderInvoiceOG(...args),
  renderBrandingOG: (...args: unknown[]) => mockRenderBrandingOG(...args),
}))

import { GET } from '../route'

describe('GET /api/og', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRenderBrandingOG.mockImplementation(
      async () => new Response('branding-png', { status: 200 }),
    )
    mockRenderInvoiceOG.mockImplementation(
      async () => new Response('invoice-png', { status: 200 }),
    )
  })

  it('renders branding OG with immutable Cache-Control when ?og is absent', async () => {
    const res = await GET(new Request('https://voidpay.xyz/api/og'))
    expect(mockRenderBrandingOG).toHaveBeenCalledWith({ width: 1200, height: 630 })
    expect(res.headers.get('Cache-Control')).toBe('public, immutable, max-age=31536000')
    expect(await res.text()).toBe('branding-png')
  })

  it('renders invoice OG with twitter dimensions when ?og and ?t=twitter are present', async () => {
    mockDecodeOGPreview.mockReturnValue({
      id: 'INV-001',
      amount: '1250.00',
      currency: 'USDC',
      network: 'arb',
      from: 'Acme',
      to: 'Client',
    })

    const res = await GET(
      new Request('https://voidpay.xyz/api/og?og=INV-001_1250.00_USDC_arb_Acme_Client&t=twitter'),
    )

    expect(mockRenderInvoiceOG).toHaveBeenCalledWith(
      {
        id: 'INV-001',
        amount: '1250.00',
        currency: 'USDC',
        networkCode: 'arb',
        from: 'Acme',
        to: 'Client',
      },
      { width: 1200, height: 600 },
    )
    expect(await res.text()).toBe('invoice-png')
  })

  it('falls back to branding OG when decodeOGPreview throws', async () => {
    mockDecodeOGPreview.mockImplementation(() => {
      throw new Error('Malformed OG param')
    })

    const res = await GET(new Request('https://voidpay.xyz/api/og?og=corrupted'))
    expect(mockRenderBrandingOG).toHaveBeenCalledWith({ width: 1200, height: 630 })
    expect(await res.text()).toBe('branding-png')
  })
})
