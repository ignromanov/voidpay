import type { ShapeType } from '@/shared/ui/constants/brand-tokens'

/**
 * Animation timing and behavior constants
 */
export const ANIMATION = {
  /** Minimum opacity during breathing animation */
  OPACITY_MIN: 0.08,
  /** Maximum opacity during breathing animation */
  OPACITY_MAX: 0.25,
  /** Duration of initial fade-in (seconds) */
  FADE_IN_DURATION_S: 1.5,
  /** Duration of theme transition fade-out (seconds) */
  FADE_OUT_DURATION_S: 0.5,
  /** Multiplier for breathing animation relative to base duration */
  BREATHING_MULTIPLIER: 1.2,
  /** Multiplier for position animation relative to base duration */
  POSITION_MULTIPLIER: 1.4,
  /** Base amplitude for large shapes (percentage of viewport) */
  BASE_AMPLITUDE_PERCENT: 12,
  /** Fixed amplitude for small shapes (percentage of viewport) */
  SMALL_AMPLITUDE_PERCENT: 24,
  /** Threshold below which shapes are considered "small" */
  SMALL_SHAPE_THRESHOLD: 0.3,
  /** Delay multiplier for staggered fade-in */
  FADE_DELAY_MULTIPLIER: 0.3,
  /** requestIdleCallback timeout (ms) */
  IDLE_CALLBACK_TIMEOUT_MS: 3000,
  /** Safari fallback timeout (ms) */
  SAFARI_FALLBACK_TIMEOUT_MS: 2000,
} as const

/**
 * Blur filter settings for shape rendering
 */
export const BLUR = {
  /** Blur filter strength (pixels) */
  STRENGTH: 12,
  /** Blur filter quality (higher = smoother but slower) */
  QUALITY: 4,
} as const

/**
 * PixiJS application settings
 */
export const PIXI_CONFIG = {
  /** Maximum device pixel ratio to use */
  MAX_RESOLUTION: 2,
  /** Preferred rendering backend */
  PREFERENCE: 'webgl' as const,
} as const

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  /** Mobile breakpoint (px) */
  MOBILE: 768,
} as const

/**
 * Aspect ratios for each shape type (width / height)
 * Calculated from original SVG viewBox dimensions
 */
export const SHAPE_ASPECT_RATIOS: Record<ShapeType, number> = {
  rhombus: 784 / 1277, // Ethereum: ~0.614
  triangle: 1.0, // Arbitrum: square hexagon badge
  hexagon: 178 / 161, // Polygon: ~1.106
  circle: 1, // Optimism: perfect circle
  blob: 1.1, // VoidPay: slightly wide
}

/**
 * SVG viewBox dimensions for each shape type
 * Used for calculating scale factor when rendering as Graphics
 */
export const SVG_VIEWBOX_SIZES: Record<ShapeType, { width: number; height: number }> = {
  rhombus: { width: 784, height: 1277 },
  triangle: { width: 2500, height: 2500 },
  hexagon: { width: 178, height: 161 },
  circle: { width: 500, height: 500 },
  blob: { width: 200, height: 200 },
}

/**
 * Shape layout configuration for asymmetric design
 */
export const SHAPE_LAYOUT = {
  /** Primary shape (top-left, dominant) */
  PRIMARY: {
    sizeVh: 0.5,
    topPercent: 8,
    duration: 20,
    delay: 0,
    zone: 'left' as const,
  },
  /** Secondary shape (right side, hidden on mobile) */
  SECONDARY: {
    sizeVh: 0.6,
    topPercent: 20,
    duration: 25,
    delay: 2,
    zone: 'right' as const,
    hideOnMobile: true,
  },
  /** Accent shape (bottom-left, small) */
  ACCENT: {
    sizeVh: 0.25,
    topPercent: 65,
    duration: 15,
    delay: 4,
    zone: 'left' as const,
  },
} as const

/**
 * Position calculation constants
 */
export const POSITION = {
  /** Base center position for small left shapes (percentage from left) */
  LEFT_SMALL_CENTER_PERCENT: 4,
  /** Base center position for large left shapes (percentage from left) */
  LEFT_LARGE_CENTER_PERCENT: 2,
  /** Base offset for right zone shapes (percentage from right edge) */
  RIGHT_OFFSET_PERCENT: -4,
} as const
