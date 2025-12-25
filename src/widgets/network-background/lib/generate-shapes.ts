import type { ShapeType, NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import { NETWORK_THEMES } from '@/shared/ui/constants/brand-tokens'
import { SHAPE_LAYOUT } from './constants'

/**
 * Position zone for shapes - left or right side of screen
 */
export type ShapeZone = 'left' | 'right'

/**
 * Configuration data for a single animated shape
 */
export interface ShapeData {
  /** Shape type (determines SVG) */
  type: ShapeType
  /** Fill color */
  color: string
  /** Position zone (left or right edge) */
  zone: ShapeZone
  /** Size as fraction of viewport height (0.5 = 50vh) */
  sizeVh: number
  /** Vertical position as percentage (0-100) */
  topPercent: number
  /** Animation cycle duration in seconds */
  duration: number
  /** Animation start delay in seconds */
  delay: number
  /** Hide on mobile devices */
  hideOnMobile?: boolean
}

/**
 * Generate shapes configuration for a theme
 * Creates asymmetric layout: primary (top-left), secondary (right), accent (bottom-left)
 */
export function generateShapes(
  themeConfig: (typeof NETWORK_THEMES)[NetworkTheme]
): ShapeData[] {
  return [
    // Primary: Large shape top-left (anchor point)
    {
      type: themeConfig.shape,
      color: themeConfig.primary,
      zone: SHAPE_LAYOUT.PRIMARY.zone,
      sizeVh: SHAPE_LAYOUT.PRIMARY.sizeVh,
      topPercent: SHAPE_LAYOUT.PRIMARY.topPercent,
      duration: SHAPE_LAYOUT.PRIMARY.duration,
      delay: SHAPE_LAYOUT.PRIMARY.delay,
    },
    // Secondary: Large shape right side (hidden on mobile)
    {
      type: themeConfig.shape,
      color: themeConfig.secondary,
      zone: SHAPE_LAYOUT.SECONDARY.zone,
      sizeVh: SHAPE_LAYOUT.SECONDARY.sizeVh,
      topPercent: SHAPE_LAYOUT.SECONDARY.topPercent,
      duration: SHAPE_LAYOUT.SECONDARY.duration,
      delay: SHAPE_LAYOUT.SECONDARY.delay,
      hideOnMobile: SHAPE_LAYOUT.SECONDARY.hideOnMobile,
    },
    // Accent: Small shape bottom-left
    {
      type: themeConfig.shape,
      color: themeConfig.primary,
      zone: SHAPE_LAYOUT.ACCENT.zone,
      sizeVh: SHAPE_LAYOUT.ACCENT.sizeVh,
      topPercent: SHAPE_LAYOUT.ACCENT.topPercent,
      duration: SHAPE_LAYOUT.ACCENT.duration,
      delay: SHAPE_LAYOUT.ACCENT.delay,
    },
  ]
}
