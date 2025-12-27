import type { ShapeType } from '@/shared/ui/constants/brand-tokens'

// =============================================================================
// Shape Configuration Type
// =============================================================================

/**
 * Complete configuration for a single animated shape
 * Each shape (PRIMARY, SECONDARY, ACCENT) has independent parameters
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ PARAMETER REFERENCE                                                         │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ LAYOUT & POSITION                                                           │
 * │ ─────────────────                                                           │
 * │ sizeVh         Size as fraction of viewport height (0.5 = 50vh)             │
 * │ topPercent     Vertical position from top (0-100%)                          │
 * │ startPercent   Horizontal start position (negative = off-screen)            │
 * │ zone           Screen edge: 'left' or 'right'                               │
 * │ hideOnMobile   Hide shape on mobile devices (< 768px)                       │
 * │                                                                             │
 * │ TIMING                                                                      │
 * │ ──────                                                                      │
 * │ duration       Base animation cycle duration in seconds                     │
 * │ delay          Initial delay before animation starts (seconds)              │
 * │                                                                             │
 * │ ANIMATION                                                                   │
 * │ ─────────                                                                   │
 * │ opacityMin     Minimum opacity during breathing (0-1)                       │
 * │ opacityMax     Maximum opacity during breathing (0-1)                       │
 * │ breathingMultiplier  Slows breathing: cycle = duration × multiplier         │
 * │ positionMultiplier   Slows movement: cycle = duration × multiplier          │
 * │ amplitudePercent     Travel distance toward center (% of viewport width)    │
 * │                                                                             │
 * │ VISUAL                                                                      │
 * │ ──────                                                                      │
 * │ blurStrength   Gaussian blur amount in pixels                               │
 * │ blurQuality    Blur quality (1-10, higher = smoother but slower)            │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
export interface ShapeConfig {
  // ───────────────────────────────────────────────────────────────────────────
  // Layout & Position
  // ───────────────────────────────────────────────────────────────────────────

  /** Size as fraction of viewport height (0.5 = 50% of screen height) */
  sizeVh: number

  /** Vertical position from top edge (0 = top, 100 = bottom) */
  topPercent: number

  /**
   * Starting X position as % of viewport width
   * - Negative: starts off-screen (left zone: left edge, right zone: right edge)
   * - Zero: starts exactly at edge
   * - Positive: starts inside viewport
   * Example: -10 means 10% of viewport width beyond the edge
   */
  startPercent: number

  /** Which edge the shape is anchored to ('left' or 'right') */
  zone: 'left' | 'right'

  /** If true, shape is hidden on mobile devices (< 768px width) */
  hideOnMobile?: boolean

  // ───────────────────────────────────────────────────────────────────────────
  // Timing
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Base animation cycle duration in seconds
   * Actual cycle time = duration × multiplier × mass factor
   * Larger values = slower animation
   */
  duration: number

  /** Delay before animation starts (seconds), creates staggered entrance */
  delay: number

  // ───────────────────────────────────────────────────────────────────────────
  // Animation
  // ───────────────────────────────────────────────────────────────────────────

  /** Minimum opacity during breathing cycle (0-1) */
  opacityMin: number

  /** Maximum opacity during breathing cycle (0-1) */
  opacityMax: number

  /**
   * Breathing animation speed modifier
   * breathing_cycle = duration × breathingMultiplier × mass_factor
   * Higher value = slower breathing
   */
  breathingMultiplier: number

  /**
   * Position animation speed modifier
   * position_cycle = duration × positionMultiplier × mass_factor
   * Higher value = slower movement
   */
  positionMultiplier: number

  /**
   * Travel distance toward center as % of viewport width
   * Shape moves from startPercent to (startPercent + amplitudePercent)
   * Larger shapes should have smaller amplitude (mass-based physics)
   */
  amplitudePercent: number

  // ───────────────────────────────────────────────────────────────────────────
  // Visual
  // ───────────────────────────────────────────────────────────────────────────

  /** Gaussian blur strength in pixels (0 = no blur) */
  blurStrength: number

  /** Blur quality: 1-10 (higher = smoother gradient but more GPU load) */
  blurQuality: number
}

// =============================================================================
// Shape Configurations (PRIMARY, SECONDARY, ACCENT)
// =============================================================================

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║ SHAPE CONFIGURATIONS                                                       ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Three animated shapes with mass-based physics:                            ║
 * ║                                                                            ║
 * ║ Movement pattern:                                                          ║
 * ║   1. Shape starts at edge (startPercent position)                         ║
 * ║   2. Moves toward center by amplitudePercent                              ║
 * ║   3. Returns smoothly to start position                                   ║
 * ║   4. Cycle repeats                                                        ║
 * ║                                                                            ║
 * ║ Mass-based physics:                                                        ║
 * ║   - Larger shapes (high sizeVh) → slower, smaller amplitude               ║
 * ║   - Smaller shapes (low sizeVh) → faster, larger amplitude                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export const SHAPE_CONFIG: Record<'PRIMARY' | 'SECONDARY' | 'ACCENT', ShapeConfig> = {
  /**
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │ PRIMARY — Medium shape, top-left                                        │
   * │ Size: 0.5vh (50% of viewport height)                                    │
   * │ Character: Balanced, anchor element                                     │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  PRIMARY: {
    // Position: top-left corner, slightly off-screen
    sizeVh: 0.5, // 50% viewport height
    topPercent: 8, // 8% from top
    startPercent: -2, // 2% beyond left edge
    zone: 'left',

    // Timing: medium speed
    duration: 24, // 24s base cycle
    delay: 0, // starts immediately

    // Animation: medium inertia
    opacityMin: 0.06, // fades to 6%
    opacityMax: 0.18, // peaks at 18%
    breathingMultiplier: 2.5, // breathing cycle ≈ 60s
    positionMultiplier: 2.8, // position cycle ≈ 67s
    amplitudePercent: 20, // travels 35% toward center

    // Visual: medium blur
    blurStrength: 14, // 14px gaussian blur
    blurQuality: 2, // low quality
  },

  /**
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │ SECONDARY — Largest shape, right side                                   │
   * │ Size: 0.65vh (65% of viewport height)                                   │
   * │ Character: Heavy, majestic, slow-moving                                 │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  SECONDARY: {
    // Position: right side, hidden on mobile
    sizeVh: 0.65, // 65% viewport height (largest)
    topPercent: 12, // 12% from top
    startPercent: -2, // 2% beyond right edge
    zone: 'right',
    hideOnMobile: true, // too big for mobile

    // Timing: slowest
    duration: 28, // 28s base cycle
    delay: 0.5, // 1.5s delayed entrance

    // Animation: high inertia (heavy mass)
    opacityMin: 0.05, // fades to 5%
    opacityMax: 0.16, // peaks at 16%
    breathingMultiplier: 2.8, // breathing cycle ≈ 78s
    positionMultiplier: 3.2, // position cycle ≈ 90s
    amplitudePercent: 20, // smallest travel (heavy)

    // Visual: strongest blur
    blurStrength: 16, // 16px gaussian blur
    blurQuality: 2, // low quality
  },

  /**
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │ ACCENT — Smallest shape, bottom-left                                    │
   * │ Size: 0.22vh (22% of viewport height)                                   │
   * │ Character: Quick, playful, eye-catching                                 │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  ACCENT: {
    // Position: bottom-left corner
    sizeVh: 0.22, // 22% viewport height (smallest)
    topPercent: 65, // 65% from top
    startPercent: 5, // 5% beyond left edge
    zone: 'left',

    // Timing: fastest
    duration: 20, // 20s base cycle
    delay: 1, // 3s delayed entrance

    // Animation: low inertia (light mass)
    opacityMin: 0.07, // fades to 7%
    opacityMax: 0.2, // peaks at 20%
    breathingMultiplier: 2.2, // breathing cycle ≈ 44s
    positionMultiplier: 2.5, // position cycle ≈ 50s
    amplitudePercent: 40, // largest travel (light)

    // Visual: lightest blur
    blurStrength: 10, // 10px gaussian blur
    blurQuality: 2, // low quality
  },
} as const

// =============================================================================
// Animation Defaults (shared timing constants)
// =============================================================================

/**
 * Shared animation timing constants (not per-shape)
 * These control transitions and thresholds that are consistent across all shapes
 */
export const ANIMATION_DEFAULTS = {
  /** Duration of initial fade-in (seconds) */
  FADE_IN_DURATION_S: 1.5,
  /** Duration of theme transition fade-out (seconds) */
  FADE_OUT_DURATION_S: 0.5,
  /** Delay multiplier for staggered fade-in */
  FADE_DELAY_MULTIPLIER: 0.3,
  /** Threshold below which shapes are considered "small" */
  SMALL_SHAPE_THRESHOLD: 0.3,
  /** requestIdleCallback timeout (ms) */
  IDLE_CALLBACK_TIMEOUT_MS: 3000,
  /** Safari fallback timeout (ms) */
  SAFARI_FALLBACK_TIMEOUT_MS: 2000,
} as const

// =============================================================================
// PixiJS Configuration
// =============================================================================

/**
 * PixiJS application settings
 */
export const PIXI_CONFIG = {
  /** Maximum device pixel ratio to use */
  MAX_RESOLUTION: 2,
  /** Preferred rendering backend */
  PREFERENCE: 'webgl' as const,
} as const

// =============================================================================
// Responsive Breakpoints
// =============================================================================

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  /** Mobile breakpoint (px) */
  MOBILE: 768,
} as const

// =============================================================================
// Shape Geometry
// =============================================================================

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
