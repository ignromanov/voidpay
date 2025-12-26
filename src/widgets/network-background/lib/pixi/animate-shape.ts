import type { AnimatedShape, Viewport } from './types'
import { ANIMATION_DEFAULTS } from '../constants'

const { FADE_IN_DURATION_S, FADE_OUT_DURATION_S, FADE_DELAY_MULTIPLIER } = ANIMATION_DEFAULTS

/**
 * Animate fade-out for exiting shapes (theme transitions)
 * Uses captured start alpha for frame-rate independent interpolation
 * Returns true if still animating, false when complete
 */
function animateFadeOut(shape: AnimatedShape, deltaTime: number): boolean {
  // Capture starting alpha on first call (-1 is sentinel for "not captured")
  if (shape.fadeOutStartAlpha < 0) {
    shape.fadeOutStartAlpha = shape.container.alpha
  }

  shape.fadeOutProgress += deltaTime / FADE_OUT_DURATION_S
  const progress = Math.min(shape.fadeOutProgress, 1)

  // easeIn curve: accelerates toward invisible (slow start, fast end)
  const easedProgress = progress * progress

  // Interpolate from start alpha to 0
  shape.container.alpha = shape.fadeOutStartAlpha * (1 - easedProgress)

  return shape.fadeOutProgress < 1
}

/**
 * Animate fade-in for new shapes
 * Fades to shape's opacityMin to avoid flash when breathing starts
 * Returns true when complete
 */
function animateFadeIn(shape: AnimatedShape, deltaTime: number): boolean {
  const fadeInDelay = shape.data.delay * FADE_DELAY_MULTIPLIER
  shape.fadeInProgress += deltaTime

  if (shape.fadeInProgress < fadeInDelay) {
    return false
  }

  const fadeProgress = Math.min(
    (shape.fadeInProgress - fadeInDelay) / FADE_IN_DURATION_S,
    1
  )
  // easeOut curve
  const easedProgress = 1 - Math.pow(1 - fadeProgress, 3)
  // Use shape-specific opacityMin
  shape.container.alpha = easedProgress * shape.data.opacityMin

  if (fadeProgress >= 1) {
    shape.fadeInComplete = true
    shape.container.alpha = shape.data.opacityMin
    return true
  }

  return false
}

/**
 * Calculate mass multiplier - larger shapes move slower
 * Mass is proportional to size (sizeVh)
 */
function getMassMultiplier(sizeVh: number): number {
  // Gentle scaling: 0.25 -> 1.0, 0.5 -> 1.25, 0.6 -> 1.35
  // Smaller coefficient for subtler effect
  return 1 + (sizeVh - 0.25) * 1
}

/**
 * Animate position with one-directional movement
 * Shape moves from startX to (startX + amplitude) and back
 * Uses (1 - cos(phase)) / 2 for smooth 0→1→0 oscillation
 */
function animatePosition(
  shape: AnimatedShape,
  deltaTime: number,
  _viewport: Viewport
): void {
  const { data, amplitude, startX } = shape

  // Position speed based on duration * shape-specific multiplier * mass
  // Larger shapes (higher mass) move slower
  const massMultiplier = getMassMultiplier(data.sizeVh)
  const posSpeed = (2 * Math.PI) / (data.duration * data.positionMultiplier * massMultiplier)
  shape.phase += deltaTime * posSpeed

  // One-directional oscillation: 0 → 1 → 0
  // At phase=0: (1 - cos(0)) / 2 = 0 → shape at startX
  // At phase=π: (1 - cos(π)) / 2 = 1 → shape at startX + amplitude
  // At phase=2π: (1 - cos(2π)) / 2 = 0 → shape back at startX
  const posProgress = (1 - Math.cos(shape.phase)) / 2

  // Simple position update: startX already accounts for zone
  shape.container.x = startX + posProgress * amplitude
}

/**
 * Animate breathing opacity with custom easing
 * Uses shape-specific breathingMultiplier and opacity range
 */
function animateBreathing(shape: AnimatedShape, deltaTime: number): void {
  const { data } = shape

  // Apply mass multiplier - larger shapes breathe slower
  const massMultiplier = getMassMultiplier(data.sizeVh)
  // Use shape-specific breathingMultiplier
  const breathSpeed =
    (2 * Math.PI) / (data.duration * data.breathingMultiplier * massMultiplier)
  shape.breathingPhase += deltaTime * breathSpeed

  // Raw breath: 0 to 1 via sin wave
  const rawBreath = (Math.sin(shape.breathingPhase) + 1) / 2
  // Smoothstep-like easing
  const breathProgress = rawBreath * rawBreath * (3 - 2 * rawBreath)

  // Use shape-specific opacity range
  const opacityRange = data.opacityMax - data.opacityMin
  shape.container.alpha = data.opacityMin + breathProgress * opacityRange
}

/**
 * Animate a single shape for one frame
 * Returns true if shape is still active, false if should be removed
 */
export function animateShape(
  shape: AnimatedShape,
  deltaTime: number,
  viewport: Viewport
): boolean {
  // Handle fade-out for exiting shapes
  if (shape.isExiting) {
    return animateFadeOut(shape, deltaTime)
  }

  // Handle fade-in
  if (!shape.fadeInComplete) {
    animateFadeIn(shape, deltaTime)
    return true
  }

  // Animate position and breathing
  animatePosition(shape, deltaTime, viewport)
  animateBreathing(shape, deltaTime)

  return true
}

/**
 * Set shape to static position for reduced motion mode
 * Uses shape-specific opacity range
 * Position is at startX (beginning of animation track)
 */
export function setStaticPosition(
  shape: AnimatedShape,
  _viewport: Viewport
): void {
  const { data, startX } = shape
  // Use shape-specific opacity for static position (midpoint of range)
  const staticOpacity = (data.opacityMin + data.opacityMax) / 2
  shape.container.alpha = staticOpacity
  shape.fadeInComplete = true

  // Set to start position (startX already accounts for zone)
  shape.container.x = startX
}
