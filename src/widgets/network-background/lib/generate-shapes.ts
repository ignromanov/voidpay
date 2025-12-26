import type { ShapeType, NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import { NETWORK_THEMES } from '@/shared/ui/constants/brand-tokens'
import { SHAPE_CONFIG } from './constants'

/**
 * Position zone for shapes - left or right side of screen
 */
export type ShapeZone = 'left' | 'right'

/**
 * Configuration data for a single animated shape
 * Each shape has independent animation and visual parameters
 */
export interface ShapeData {
  // ─────────────────────────────────────────────────────────────────────────
  // Identity
  // ─────────────────────────────────────────────────────────────────────────
  /** Shape type (determines SVG) */
  type: ShapeType
  /** Fill color */
  color: string

  // ─────────────────────────────────────────────────────────────────────────
  // Layout & Position
  // ─────────────────────────────────────────────────────────────────────────
  /** Position zone (left or right edge) */
  zone: ShapeZone
  /** Size as fraction of viewport height (0.5 = 50vh) */
  sizeVh: number
  /** Vertical position as percentage (0-100) */
  topPercent: number
  /** Starting X position as % of viewport (negative = off-screen) */
  startPercent: number
  /** Hide on mobile devices */
  hideOnMobile?: boolean

  // ─────────────────────────────────────────────────────────────────────────
  // Timing
  // ─────────────────────────────────────────────────────────────────────────
  /** Animation cycle duration in seconds */
  duration: number
  /** Animation start delay in seconds */
  delay: number

  // ─────────────────────────────────────────────────────────────────────────
  // Animation parameters
  // ─────────────────────────────────────────────────────────────────────────
  /** Minimum opacity during breathing animation */
  opacityMin: number
  /** Maximum opacity during breathing animation */
  opacityMax: number
  /** Multiplier for breathing animation relative to base duration */
  breathingMultiplier: number
  /** Multiplier for position animation relative to base duration */
  positionMultiplier: number
  /** Oscillation amplitude as percentage of viewport width */
  amplitudePercent: number

  // ─────────────────────────────────────────────────────────────────────────
  // Visual parameters
  // ─────────────────────────────────────────────────────────────────────────
  /** Blur filter strength (pixels) */
  blurStrength: number
  /** Blur filter quality (higher = smoother but slower) */
  blurQuality: number
}

/**
 * Generate shapes configuration for a theme
 * Creates asymmetric layout: primary (top-left), secondary (right), accent (bottom-left)
 * Each shape receives its full configuration from SHAPE_CONFIG
 */
export function generateShapes(
  themeConfig: (typeof NETWORK_THEMES)[NetworkTheme]
): ShapeData[] {
  return [
    // Primary: Large shape top-left (anchor point)
    {
      type: themeConfig.shape,
      color: themeConfig.primary,
      ...SHAPE_CONFIG.PRIMARY,
    },
    // Secondary: Large shape right side (hidden on mobile)
    {
      type: themeConfig.shape,
      color: themeConfig.secondary,
      ...SHAPE_CONFIG.SECONDARY,
    },
    // Accent: Small shape bottom-left
    {
      type: themeConfig.shape,
      color: themeConfig.primary,
      ...SHAPE_CONFIG.ACCENT,
    },
  ]
}
