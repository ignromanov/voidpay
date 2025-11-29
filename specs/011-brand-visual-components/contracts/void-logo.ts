/**
 * VoidLogo Component Contract
 *
 * SVG logo component featuring eclipse body, crescent light leak,
 * lightning bolt accents, and radial gradient glow effect.
 */

import type { HTMLAttributes } from 'react'

/** Size presets for VoidLogo */
export type VoidLogoSize = 'sm' | 'md' | 'lg' | 'xl'

/** Size values in pixels */
export const VOID_LOGO_SIZES: Record<VoidLogoSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
} as const

export interface VoidLogoProps extends Omit<HTMLAttributes<SVGElement>, 'children'> {
  /**
   * Size preset or custom pixel value
   * @default 'md'
   */
  size?: VoidLogoSize | number

  /**
   * Disable crescent pulse animation
   * Useful for reduced motion or static contexts
   * @default false
   */
  static?: boolean
}

/**
 * Design tokens for VoidLogo
 */
export const VOID_LOGO_TOKENS = {
  /** Electric Violet - primary brand color */
  primaryColor: '#7C3AED',
  /** Glow opacity for radial gradient */
  glowOpacity: 0.6,
  /** Crescent pulse animation duration */
  pulseDuration: '3s',
  /** SVG viewBox dimensions */
  viewBox: '0 0 48 48',
} as const

/**
 * Component requirements (FR-001 to FR-004):
 *
 * FR-001: Render SVG with eclipse body (circle), crescent light leak, lightning bolts
 * FR-002: Apply radial gradient glow using Electric Violet (#7C3AED)
 * FR-003: Crescent element animates with slow pulse effect
 * FR-004: Accept optional className prop for style customization
 */
