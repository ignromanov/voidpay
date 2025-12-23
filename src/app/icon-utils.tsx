/**
 * Shared utilities for favicon and app icon generation
 *
 * Next.js requires specific file names (icon.tsx, apple-icon.tsx)
 * for auto-discovery, but the rendering logic is shared here.
 */

import { ImageResponse } from 'next/og'

type IconConfig = {
  size: number
  coreSize: number
  borderWidth: string
  glowSize: number
}

/**
 * Configuration presets for different icon types
 */
export const ICON_PRESETS = {
  favicon: {
    size: 32,
    coreSize: 24,
    borderWidth: '1.5px',
    glowSize: 6,
  },
  apple: {
    size: 180,
    coreSize: 140,
    borderWidth: '3px',
    glowSize: 20,
  },
} as const satisfies Record<string, IconConfig>

/**
 * Generates an icon with the VoidPay void core design
 */
export function generateIcon(preset: keyof typeof ICON_PRESETS) {
  const config = ICON_PRESETS[preset]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090B',
        }}
      >
        {/* Void core with subtle violet glow */}
        <div
          style={{
            width: config.coreSize,
            height: config.coreSize,
            borderRadius: '50%',
            background: '#000',
            border: `${config.borderWidth} solid #7C3AED`,
            boxShadow: `0 0 ${config.glowSize}px rgba(124, 58, 237, 0.5)`,
          }}
        />
      </div>
    ),
    {
      width: config.size,
      height: config.size,
    }
  )
}
