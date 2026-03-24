/**
 * Dynamic OG Image Route Handler
 *
 * Thin proxy — parsing + delegation to features/og-image.
 *
 * Routes:
 *   /api/og?og=a1b2c3d4_1250.00_USDC_arb_Acme          → 1200x630 (OpenGraph)
 *   /api/og?og=a1b2c3d4_1250.00_USDC_arb_Acme&t=twitter → 1200x600 (Twitter)
 *   /api/og (no params)                                   → generic VoidPay branding
 */

import { decodeOGPreview } from '@/features/invoice-codec'
import { renderInvoiceOG, renderBrandingOG, OG_SIZES } from '@/features/og-image'
import type { InvoiceOGData } from '@/features/og-image'

export const runtime = 'edge'

// OG images are deterministic (?og= is content-derived) — cache aggressively.
// Crawlers (Telegram, Discord, Facebook) re-fetch on every share without this.
const CACHE_HEADER = 'public, immutable, max-age=31536000'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const og = searchParams.get('og')
  const type = searchParams.has('t') ? 'twitter' : 'opengraph'
  const size = OG_SIZES[type]

  let response: Response

  if (!og) {
    response = renderBrandingOG(size)
  } else {
    try {
      const preview = decodeOGPreview(og)
      const data: InvoiceOGData = {
        id: preview.id,
        amount: preview.amount,
        currency: preview.currency,
        networkCode: preview.network,
        from: preview.from?.replace(/-/g, ' '),
      }
      response = renderInvoiceOG(data, size)
    } catch {
      response = renderBrandingOG(size)
    }
  }

  response.headers.set('Cache-Control', CACHE_HEADER)
  return response
}
