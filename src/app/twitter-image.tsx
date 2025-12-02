import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'VoidPay - Stateless Crypto Invoicing'
export const size = {
  width: 1200,
  height: 600,
}
export const contentType = 'image/png'

export default function TwitterImage() {
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
        {/* Черная дыра с subtle violet glow */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: '#000',
            border: '3px solid #7C3AED',
            boxShadow:
              '0 0 32px rgba(124, 58, 237, 0.4), 0 0 64px rgba(124, 58, 237, 0.2)',
            marginBottom: 40,
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#FAFAFA',
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}
        >
          VoidPay
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: '#A1A1AA',
            letterSpacing: '0.05em',
          }}
        >
          Stateless Crypto Invoicing
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
