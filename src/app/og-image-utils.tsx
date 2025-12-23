/**
 * Shared utilities for Open Graph and social media images
 *
 * Next.js requires specific file names (opengraph-image.tsx, twitter-image.tsx)
 * for auto-discovery, but the rendering logic is shared here.
 */

import { ImageResponse } from 'next/og'

type SocialImageConfig = {
  width: number
  height: number
  voidCoreSize: number
  voidCoreBorder: string
  voidCoreShadow: string
  titleSize: number
  taglineSize: number
  titleMargin: number
  taglineMargin: number
}

/**
 * Configuration presets for different social platforms
 */
export const SOCIAL_IMAGE_PRESETS = {
  opengraph: {
    width: 1200,
    height: 630,
    voidCoreSize: 200,
    voidCoreBorder: '4px solid #7C3AED',
    voidCoreShadow: '0 0 40px rgba(124, 58, 237, 0.4), 0 0 80px rgba(124, 58, 237, 0.2)',
    titleSize: 72,
    taglineSize: 28,
    titleMargin: 16,
    taglineMargin: 48,
  },
  twitter: {
    width: 1200,
    height: 600,
    voidCoreSize: 160,
    voidCoreBorder: '3px solid #7C3AED',
    voidCoreShadow: '0 0 32px rgba(124, 58, 237, 0.4), 0 0 64px rgba(124, 58, 237, 0.2)',
    titleSize: 64,
    taglineSize: 24,
    titleMargin: 12,
    taglineMargin: 40,
  },
} as const satisfies Record<string, SocialImageConfig>

/**
 * Generates a social media image with VoidPay branding
 */
export function generateSocialImage(preset: keyof typeof SOCIAL_IMAGE_PRESETS) {
  const config = SOCIAL_IMAGE_PRESETS[preset]

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
        {/* Void core with subtle violet glow */}
        <div
          style={{
            width: config.voidCoreSize,
            height: config.voidCoreSize,
            borderRadius: '50%',
            background: '#000',
            border: config.voidCoreBorder,
            boxShadow: config.voidCoreShadow,
            marginBottom: config.taglineMargin,
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: config.titleSize,
            fontWeight: 700,
            color: '#FAFAFA',
            letterSpacing: '-0.02em',
            marginBottom: config.titleMargin,
          }}
        >
          VoidPay
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: config.taglineSize,
            color: '#A1A1AA',
            letterSpacing: '0.05em',
          }}
        >
          Stateless Crypto Invoicing
        </div>
      </div>
    ),
    {
      width: config.width,
      height: config.height,
    }
  )
}

/**
 * Shared exports for social images
 */
export const SOCIAL_IMAGE_ALT = 'VoidPay - Stateless Crypto Invoicing'
