/**
 * OG Image Rendering
 *
 * Server-side image generation for social media previews.
 * Uses Satori (via next/og ImageResponse) to render JSX → PNG.
 * Loads Geist Sans font for brand-consistent typography.
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
import { formatDisplayAmount } from './og-utils'

export const OG_ALT = 'VoidPay - Stateless Crypto Invoicing'

export const OG_SIZES = {
  opengraph: { width: 1200, height: 630 },
  twitter: { width: 1200, height: 600 },
} as const

export type OGType = keyof typeof OG_SIZES

/** Font entry for Satori ImageResponse */
export type OGFont = { name: string; data: ArrayBuffer; weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; style: 'normal' }

// Geist font loading via fetch from public/ (served by CDN, not filesystem)
// On Vercel: public/ files are on CDN, NOT in the serverless function bundle (/var/task/)
// Caches the Promise to prevent duplicate fetches on concurrent cold-start requests
let fontsPromise: Promise<OGFont[]> | undefined

function loadFonts(): Promise<OGFont[]> {
  if (!fontsPromise) {
    fontsPromise = loadFontsImpl()
  }
  return fontsPromise
}

function getFontsBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT || 3000}`
}

async function loadFontsImpl(): Promise<OGFont[]> {
  const base = getFontsBaseUrl()

  const [bold, semiBold, medium] = await Promise.all([
    fetch(`${base}/fonts/Geist-Bold.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${base}/fonts/Geist-SemiBold.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${base}/fonts/Geist-Medium.ttf`).then((r) => r.arrayBuffer()),
  ])

  return [
    { name: 'Geist', data: bold, weight: 700, style: 'normal' },
    { name: 'Geist', data: semiBold, weight: 600, style: 'normal' },
    { name: 'Geist', data: medium, weight: 500, style: 'normal' },
  ]
}

/** Default (static branding) image metadata for pages without ?og= */
export function defaultOgImages() {
  return {
    openGraph: [{ url: '/og-image.png', ...OG_SIZES.opengraph, alt: OG_ALT }],
    twitter: [{ url: '/og-image.png', ...OG_SIZES.opengraph, alt: OG_ALT }],
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
  to?: string | undefined
}


/** Render dynamic invoice OG image — card-based design.
 *  KEEP IN SYNC with OGInvoiceCard.tsx (Tailwind version for browser screenshots) */
export async function renderInvoiceOG(data: InvoiceOGData, size: { width: number; height: number }) {
  const fonts = await loadFonts()
  const displayAmount = formatDisplayAmount(data.amount)
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
          fontFamily: 'Geist, sans-serif',
          position: 'relative',
        }}
      >
        {/* Network-colored background glow — primary */}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '50%',
            width: 1000,
            height: 550,
            borderRadius: 9999,
            background: `radial-gradient(ellipse at center, ${networkColor}45 0%, ${networkColor}20 35%, transparent 65%)`,
            transform: 'translateX(-50%)',
          }}
        />
        {/* Network-colored secondary glow — bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            right: -100,
            width: 600,
            height: 400,
            borderRadius: 9999,
            background: `radial-gradient(ellipse at center, ${networkColor}20 0%, transparent 60%)`,
          }}
        />

        {/* Invoice Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 700,
            padding: '48px 56px',
            borderRadius: 20,
            border: '1px solid rgba(63,63,70,0.4)',
            background: 'linear-gradient(145deg, rgba(24,24,27,0.97) 0%, rgba(9,9,11,0.99) 100%)',
            boxShadow: `0 20px 60px -12px rgba(0,0,0,0.7), 0 0 40px -15px ${networkColor}20`,
            position: 'relative',
          }}
        >
          {/* Top gradient bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              borderRadius: '20px 20px 0 0',
              background: `linear-gradient(90deg, transparent, ${networkColor}80, transparent)`,
            }}
          />

          {/* Header: Invoice ID + Network badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: '#7C3AED',
                  boxShadow: '0 0 6px rgba(124,58,237,0.5)',
                }}
              />
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#71717A',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                }}
              >
                {data.id ? `Invoice ${data.id}` : 'Invoice'}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 17,
                fontWeight: 600,
                color: networkColor,
                padding: '3px 14px',
                border: `1px solid ${networkColor}25`,
                borderRadius: 9999,
                background: `${networkColor}10`,
              }}
            >
              {networkName}
            </div>
          </div>

          {/* Amount + Currency */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                fontSize: displayAmount.length > 10 ? 60 : 80,
                fontWeight: 700,
                color: '#FAFAFA',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 520,
              }}
            >
              {displayAmount}
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 500,
                color: '#71717A',
              }}
            >
              {data.currency}
            </div>
          </div>

          {/* From / To — single row */}
          {(data.from || data.to) ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid rgba(63,63,70,0.3)',
              }}
            >
              {data.from ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '0 1 auto' }}>
                  <div style={{ fontSize: 17, color: '#52525B', flexShrink: 0 }}>from</div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.from}</div>
                </div>
              ) : null}
              {data.from && data.to ? (
                <div style={{ width: 1, height: 18, background: '#27272A', flexShrink: 0 }} />
              ) : null}
              {data.to ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '0 1 auto' }}>
                  <div style={{ fontSize: 17, color: '#52525B', flexShrink: 0 }}>to</div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.to}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* VoidPay branding below card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 32,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 9999,
              background: 'radial-gradient(circle at 40% 40%, #18181B, #000)',
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: '0 0 10px rgba(124,58,237,0.2)',
            }}
          />
          <div style={{ fontSize: 18, fontWeight: 600, color: '#52525B', letterSpacing: '0.02em' }}>VoidPay</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}

/** Render static VoidPay branding OG image (fallback — main branding uses /public/og-image.png) */
export async function renderBrandingOG(size: { width: number; height: number }) {
  const fonts = await loadFonts()
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
          fontFamily: 'Geist, sans-serif',
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
        <div style={{ fontSize: 28, fontWeight: 500, color: '#A1A1AA', letterSpacing: '0.05em' }}>
          Stateless Crypto Invoicing
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}

