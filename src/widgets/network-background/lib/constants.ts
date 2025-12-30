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
 * ║ SHAPE CONFIGURATIONS (Static + Breathing)                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Three shapes with static positions and breathing animation:               ║
 * ║                                                                            ║
 * ║ Visual composition: "Golden Triangle"                                     ║
 * ║   PRIMARY (top-left) → SECONDARY (center-right) → ACCENT (bottom-left)   ║
 * ║   Creates dynamic visual flow without movement                            ║
 * ║                                                                            ║
 * ║ Positioning notes:                                                         ║
 * ║   - startPercent/topPercent = top-left corner of shape container          ║
 * ║   - Visual center = corner + size/2                                       ║
 * ║   - Larger shapes need more offset to appear "centered"                   ║
 * ║                                                                            ║
 * ║ GPU Optimization:                                                          ║
 * ║   - Blur calculated ONCE at creation (cached by GPU)                      ║
 * ║   - Only alpha changes each frame (~60% GPU savings)                      ║
 * ║   - Higher blur quality enabled (no recalculation penalty)                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export const SHAPE_CONFIG: Record<'PRIMARY' | 'SECONDARY' | 'ACCENT', ShapeConfig> = {
  /**
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │ PRIMARY — Large shape, top-left anchor                                  │
   * │ Size: 0.55vh (55% of viewport height, ~594px on 1080p)                  │
   * │ Width: ~365px (rhombus aspect 0.614)                                    │
   * │ Visual center target: ~20% from left, ~25% from top                     │
   * │ Corner offset: left = 20% - 9.5% = 10%, top = 25% - 27.5% = -2.5%       │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  PRIMARY: {
    // Position: corner coords adjusted for shape size
    // Visual center ≈ 20% left, 25% top (accounting for 55vh height, ~19vw width)
    sizeVh: 0.55,
    topPercent: -3, // Negative = shape bleeds off top (center at ~25%)
    startPercent: 1, // 1% from left edge (center at ~20% with 19vw width)
    zone: 'left',

    // Timing: slow, meditative breathing
    duration: 28,
    delay: 0,

    // Animation: enhanced breathing contrast
    opacityMin: 0.03,
    opacityMax: 0.25,
    breathingMultiplier: 1.8,
    positionMultiplier: 1, // unused (static)
    amplitudePercent: 0, // static position

    // Visual: high quality blur (calculated once)
    blurStrength: 18,
    blurQuality: 5,
  },

  /**
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │ SECONDARY — Largest shape, center-right balance                         │
   * │ Size: 0.7vh (70% of viewport height, ~756px on 1080p)                   │
   * │ Width: ~464px (rhombus aspect 0.614)                                    │
   * │ Visual center target: ~85% from left, ~50% from top                     │
   * │ Corner offset: right startPercent = distance from right edge            │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  SECONDARY: {
    // Position: corner coords adjusted for shape size
    // Visual center ≈ 85% left (15% from right), 50% top
    // For right zone: startPercent = offset from right edge (before width subtraction)
    sizeVh: 0.7,
    topPercent: 15, // 15% from top (center at ~50% with 70vh height)
    startPercent: -9, // Negative = bleeds off right edge (center at ~85%)
    zone: 'right',
    hideOnMobile: true,

    // Timing: slowest, most serene breathing
    duration: 36,
    delay: 0.8,

    // Animation: deep breathing with high contrast
    opacityMin: 0.02,
    opacityMax: 0.22,
    breathingMultiplier: 2.2,
    positionMultiplier: 1, // unused (static)
    amplitudePercent: 0, // static position

    // Visual: maximum blur quality
    blurStrength: 22,
    blurQuality: 6,
  },

  /**
   * ┌─────────────────────────────────────────────────────────────────────────┐
   * │ ACCENT — Small shape, bottom-left focal point                           │
   * │ Size: 0.25vh (25% of viewport height, ~270px on 1080p)                  │
   * │ Width: ~166px (rhombus aspect 0.614)                                    │
   * │ Visual center target: ~25% from left, ~78% from top                     │
   * │ Smaller shape = less offset needed                                       │
   * └─────────────────────────────────────────────────────────────────────────┘
   */
  ACCENT: {
    // Position: corner coords adjusted for shape size
    // Visual center ≈ 25% left, 78% top (accounting for 25vh height, ~8.5vw width)
    sizeVh: 0.25,
    topPercent: 65, // 65% from top (center at ~78% with 25vh height)
    startPercent: 20, // 20% from left (center at ~25% with 8.5vw width)
    zone: 'left',

    // Timing: faster, more energetic breathing
    duration: 18,
    delay: 1.5,

    // Animation: strongest breathing effect (most visible)
    opacityMin: 0.04,
    opacityMax: 0.35,
    breathingMultiplier: 1.4,
    positionMultiplier: 1, // unused (static)
    amplitudePercent: 0, // static position

    // Visual: crisp blur for smaller shape
    blurStrength: 12,
    blurQuality: 4,
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
