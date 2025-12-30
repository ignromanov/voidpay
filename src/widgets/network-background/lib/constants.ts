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
   * Horizontal travel distance toward center as % of viewport width
   * Shape moves from startPercent to (startPercent + amplitudePercent)
   * Larger shapes should have smaller amplitude (mass-based physics)
   */
  amplitudePercent: number

  /**
   * Vertical travel distance as % of viewport height (optional)
   * Positive = moves down, Negative = moves up
   * Combined with amplitudePercent creates diagonal movement
   * @default 0 (horizontal only)
   */
  amplitudeYPercent?: number

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
    // Position: top-left corner (diagonal flow: anchor point)
    sizeVh: 0.5, // 50% viewport height
    topPercent: 6, // 6% from top
    startPercent: -2, // 2% beyond left edge
    zone: 'left',

    // Timing: golden ratio middle (φ¹ ≈ 32s)
    duration: 32, // 32s base cycle
    delay: 0, // starts immediately

    // Animation: moderate inertia, distinct breathing/movement cycles
    opacityMin: 0.04, // fades to 4%
    opacityMax: 0.2, // peaks at 20% (higher contrast)
    breathingMultiplier: 2.3, // breathing cycle ≈ 74s (prime-based)
    positionMultiplier: 3.1, // position cycle ≈ 99s (different from breathing)
    amplitudePercent: 22, // moderate travel toward center

    // Visual: medium blur
    blurStrength: 14, // 14px gaussian blur
    blurQuality: 2, // balanced quality/performance
  },

  /**
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │ SECONDARY — Largest shape, center-right (diagonal flow: middle point)  │
   * │ Size: 0.65vh (65% of viewport height)                                   │
   * │ Character: Heavy, majestic, slow-moving                                 │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  SECONDARY: {
    // Position: center-right (diagonal flow: creates S-curve with PRIMARY and ACCENT)
    sizeVh: 0.65, // 65% viewport height (largest)
    topPercent: 38, // 38% from top (centered vertically)
    startPercent: -2, // 2% beyond right edge
    zone: 'right',
    hideOnMobile: true, // too big for mobile

    // Timing: golden ratio largest (φ² ≈ 52s)
    duration: 52, // 52s base cycle
    delay: 1.5, // 1.5s delayed entrance

    // Animation: moderate inertia, distinct breathing/movement cycles
    opacityMin: 0.03, // fades to 3%
    opacityMax: 0.22, // peaks at 22% (higher contrast)
    breathingMultiplier: 2.7, // breathing cycle ≈ 140s (prime-based)
    positionMultiplier: 3.7, // position cycle ≈ 192s (different from breathing)
    amplitudePercent: 20, // moderate travel toward center

    // Visual: strongest blur
    blurStrength: 16, // 16px gaussian blur
    blurQuality: 2, // balanced quality/performance
  },

  /**
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │ ACCENT — Smallest shape, bottom-left (diagonal flow: end point)        │
   * │ Size: 0.22vh (22% of viewport height)                                   │
   * │ Character: Quick, playful, eye-catching                                 │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  ACCENT: {
    // Position: bottom-left corner (diagonal flow: completes S-curve)
    sizeVh: 0.22, // 22% viewport height (smallest)
    topPercent: 72, // 72% from top (lower for better diagonal)
    startPercent: 5, // 5% inside left edge
    zone: 'left',

    // Timing: slowed down (×1.5 from original 20s)
    duration: 30, // 30s base cycle
    delay: 2.5, // 2.5s delayed entrance

    // Animation: screen-crossing diagonal flight, distinct breathing/movement cycles
    opacityMin: 0.05, // fades to 5%
    opacityMax: 0.28, // peaks at 28% (highest contrast, eye-catching)
    breathingMultiplier: 1.9, // breathing cycle ≈ 57s (prime-based)
    positionMultiplier: 2.9, // position cycle ≈ 87s (different from breathing)
    amplitudePercent: 70, // crosses from 5% to 75% of screen
    amplitudeYPercent: -60, // diagonal rise (~40° angle, ~650px on 1080p)

    // Visual: lightest blur
    blurStrength: 10, // 10px gaussian blur
    blurQuality: 2, // balanced quality/performance
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
  /** Target FPS (lower = less GPU usage, 30 is smooth enough for ambient animation) */
  MAX_FPS: 30,
  /** Minimum FPS for deltaTime calculation (prevents animation jumps during lag) */
  MIN_FPS: 15,
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
