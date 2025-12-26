import type { Graphics } from 'pixi.js'
import type { ShapeData } from '../generate-shapes'

/**
 * Runtime state for an animated PixiJS shape
 */
export interface AnimatedShape {
  /** PixiJS Graphics container */
  container: Graphics
  /** Shape configuration data */
  data: ShapeData
  /** Current phase in position oscillation (radians) */
  phase: number
  /** Current phase in breathing animation (radians) */
  breathingPhase: number
  /** Starting X position for oscillation (pixels) */
  startX: number
  /** Oscillation amplitude (pixels) — shape moves from startX to startX+amplitude */
  amplitude: number
  /** Fade-in animation progress (0 to 1+) */
  fadeInProgress: number
  /** Whether initial fade-in is complete */
  fadeInComplete: boolean
  /** Fade-out animation progress (0 to 1) */
  fadeOutProgress: number
  /** Alpha value captured when fade-out started (for smooth interpolation) */
  fadeOutStartAlpha: number
  /** Whether shape is scheduled for removal */
  isExiting: boolean
}

/**
 * Viewport dimensions
 */
export interface Viewport {
  width: number
  height: number
}

/**
 * Calculated shape dimensions after aspect ratio adjustment
 */
export interface ShapeDimensions {
  width: number
  height: number
  scaleX: number
  scaleY: number
}

/**
 * Animation parameters for a shape
 */
export interface AnimationParams {
  /** Starting X position for oscillation */
  startX: number
  /** Amplitude for oscillation (shape moves from startX to startX+amplitude) */
  amplitude: number
  /** Vertical position */
  yPos: number
}
