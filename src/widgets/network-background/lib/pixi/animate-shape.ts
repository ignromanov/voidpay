import type { AnimatedShape, Viewport } from './types'
import {
  ANIMATION,
  SHAPE_ASPECT_RATIOS,
} from '../constants'

const { OPACITY_MIN, OPACITY_MAX, FADE_IN_DURATION_S, FADE_OUT_DURATION_S, FADE_DELAY_MULTIPLIER } =
  ANIMATION
const OPACITY_RANGE = OPACITY_MAX - OPACITY_MIN

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
 * Fades to OPACITY_MIN to avoid flash when breathing starts
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
  shape.container.alpha = easedProgress * OPACITY_MIN

  if (fadeProgress >= 1) {
    shape.fadeInComplete = true
    shape.container.alpha = OPACITY_MIN
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
 * Animate position oscillation (mirror effect with easeInOut)
 */
function animatePosition(
  shape: AnimatedShape,
  deltaTime: number,
  viewport: Viewport
): void {
  const { data, amplitude, startOffset } = shape
  const { width: vw, height: vh } = viewport

  // Position speed based on duration * multiplier * mass
  // Larger shapes (higher mass) move slower
  const massMultiplier = getMassMultiplier(data.sizeVh)
  const posSpeed = (2 * Math.PI) / (data.duration * ANIMATION.POSITION_MULTIPLIER * massMultiplier)
  shape.phase += deltaTime * posSpeed

  // sin for mirror effect: oscillates -1 to 1
  const posProgress = Math.sin(shape.phase)

  // Calculate shape width for right zone positioning
  const aspectRatio = SHAPE_ASPECT_RATIOS[data.type]
  const baseSize = Math.min(data.sizeVh * vh, vw * 1.5)
  const width = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio

  // Apply position based on zone
  // Both zones move toward center when posProgress > 0
  if (data.zone === 'left') {
    shape.container.x = startOffset + posProgress * amplitude
  } else {
    // Invert direction so positive posProgress moves LEFT (toward center)
    shape.container.x = vw - width + startOffset - posProgress * amplitude
  }
}

/**
 * Animate breathing opacity with custom easing
 */
function animateBreathing(shape: AnimatedShape, deltaTime: number): void {
  // Apply mass multiplier - larger shapes breathe slower
  const massMultiplier = getMassMultiplier(shape.data.sizeVh)
  const breathSpeed =
    (2 * Math.PI) / (shape.data.duration * ANIMATION.BREATHING_MULTIPLIER * massMultiplier)
  shape.breathingPhase += deltaTime * breathSpeed

  // Raw breath: 0 to 1 via sin wave
  const rawBreath = (Math.sin(shape.breathingPhase) + 1) / 2
  // Smoothstep-like easing
  const breathProgress = rawBreath * rawBreath * (3 - 2 * rawBreath)

  shape.container.alpha = OPACITY_MIN + breathProgress * OPACITY_RANGE
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
 */
export function setStaticPosition(
  shape: AnimatedShape,
  viewport: Viewport
): void {
  const staticOpacity = (OPACITY_MIN + OPACITY_MAX) / 2
  shape.container.alpha = staticOpacity
  shape.fadeInComplete = true

  const { data, startOffset } = shape
  const { width: vw, height: vh } = viewport

  // Set to center of oscillation
  if (data.zone === 'left') {
    shape.container.x = startOffset
  } else {
    const aspectRatio = SHAPE_ASPECT_RATIOS[data.type]
    const baseSize = Math.min(data.sizeVh * vh, vw * 1.5)
    const width = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio
    shape.container.x = vw - width + startOffset
  }
}
