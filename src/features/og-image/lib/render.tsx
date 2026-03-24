/**
 * OG Image Rendering
 *
 * Server-side image generation for social media previews.
 * Uses Satori (via next/og ImageResponse) to render JSX → PNG.
 *
 * Design tokens match the VoidPay dark theme:
 * - Amount: violet-300 (#C4B5FD) — matches PaymentPanel accent
 * - Currency: zinc-500 (#71717A) — secondary text
 * - Network: brand color per chain (from NETWORK_CODE_COLORS)
 * - Background: zinc-950 (#09090B)
 * - Brand accent: electric-violet (#7C3AED)
 */

import { ImageResponse } from 'next/og'
import { NETWORK_CODE_COLORS, NETWORK_CODE_NAMES } from '@/entities/network'

export const OG_ALT = 'VoidPay - Stateless Crypto Invoicing'

export const OG_SIZES = {
  opengraph: { width: 1200, height: 630 },
  twitter: { width: 1200, height: 600 },
} as const

export type OGType = keyof typeof OG_SIZES

/** Default (static branding) image metadata for pages without ?og= */
export function defaultOgImages() {
  return {
    openGraph: [{ url: '/opengraph-image', ...OG_SIZES.opengraph, alt: OG_ALT }],
    twitter: [{ url: '/twitter-image', ...OG_SIZES.twitter, alt: OG_ALT }],
  }
}

/** Dynamic invoice image metadata for pages with ?og= */
export function dynamicOgImages(og: string) {
  return {
    openGraph: [{ url: `/api/og?og=${encodeURIComponent(og)}`, ...OG_SIZES.opengraph, alt: OG_ALT }],
    twitter: [{ url: `/api/og?og=${encodeURIComponent(og)}&t=twitter`, ...OG_SIZES.twitter, alt: OG_ALT }],
  }
}

export interface InvoiceOGData {
  id: string
  amount: string
  currency: string
  networkCode: string
  from?: string | undefined
}


/** Render dynamic invoice OG image */
export function renderInvoiceOG(data: InvoiceOGData, size: { width: number; height: number }) {
  const formattedAmount = formatWithSeparators(data.amount)
  const networkName = NETWORK_CODE_NAMES[data.networkCode.toLowerCase()] ?? data.networkCode.toUpperCase()
  const networkColor = NETWORK_CODE_COLORS[data.networkCode.toLowerCase()] ?? '#A1A1AA'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090B',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Violet glow — brand identity */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: '50%',
            width: 600,
            height: 400,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
            transform: 'translateX(-50%)',
          }}
        />

        {/* INVOICE label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              background: '#7C3AED',
              boxShadow: '0 0 12px rgba(124, 58, 237, 0.6)',
            }}
          />
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#7C3AED',
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
            }}
          >
            {data.id ? `Invoice ${data.id}` : 'Invoice'}
          </div>
        </div>

        {/* Amount + Currency */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: '#C4B5FD',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {formattedAmount}
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 500,
              color: '#71717A',
              letterSpacing: '-0.01em',
            }}
          >
            {data.currency}
          </div>
        </div>

        {/* Network + sender */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 22,
              fontWeight: 600,
              color: networkColor,
              letterSpacing: '0.02em',
              padding: '6px 20px',
              border: `1px solid ${networkColor}33`,
              borderRadius: 9999,
              background: `${networkColor}12`,
            }}
          >
            {networkName}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 22,
              color: '#71717A',
              letterSpacing: '0.02em',
            }}
          >
            {data.from ? data.from : ''}
          </div>
        </div>

        {/* Branding footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ width: 32, height: 1, background: 'linear-gradient(90deg, transparent, #3F3F46)' }} />
          <div style={{ fontSize: 18, fontWeight: 500, color: '#52525B', letterSpacing: '0.08em' }}>VoidPay</div>
          <div style={{ width: 32, height: 1, background: 'linear-gradient(90deg, #3F3F46, transparent)' }} />
        </div>
      </div>
    ),
    size,
  )
}

/** Render static VoidPay branding OG image */
export function renderBrandingOG(size: { width: number; height: number }) {
  // OpenGraph (630px) gets larger logo, Twitter (600px) gets smaller
  const coreSize = size.height > 610 ? 200 : 160

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #09090B 0%, #18181B 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: coreSize,
            height: coreSize,
            borderRadius: '50%',
            background: '#000',
            border: '4px solid #7C3AED',
            boxShadow: '0 0 40px rgba(124, 58, 237, 0.4), 0 0 80px rgba(124, 58, 237, 0.2)',
            marginBottom: 48,
          }}
        />
        <div style={{ fontSize: 72, fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em', marginBottom: 16 }}>
          VoidPay
        </div>
        <div style={{ fontSize: 28, color: '#A1A1AA', letterSpacing: '0.05em' }}>Stateless Crypto Invoicing</div>
      </div>
    ),
    size,
  )
}

/** Add thousand separators (e.g., "1250.00" → "1,250.00") */
function formatWithSeparators(value: string): string {
  const [integer, decimal] = value.split('.')
  if (!integer) return value
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted
}
