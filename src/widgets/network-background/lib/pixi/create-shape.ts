import { Graphics, GraphicsContext, BlurFilter } from 'pixi.js'
import type { ShapeData } from '../generate-shapes'
import type { AnimatedShape, Viewport, ShapeDimensions, AnimationParams } from './types'
import {
  SHAPE_ASPECT_RATIOS,
  SVG_VIEWBOX_SIZES,
  BLUR,
  ANIMATION,
  POSITION,
} from '../constants'
import { generateSvg } from '../svg-generators'

/**
 * Calculate shape dimensions based on viewport and aspect ratio
 */
export function calculateShapeDimensions(
  data: ShapeData,
  viewport: Viewport
): ShapeDimensions {
  const aspectRatio = SHAPE_ASPECT_RATIOS[data.type]
  const baseSize = Math.min(data.sizeVh * viewport.height, viewport.width * 1.5)
  const width = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio
  const height = aspectRatio <= 1 ? baseSize : baseSize / aspectRatio

  const viewBox = SVG_VIEWBOX_SIZES[data.type]
  const scaleX = width / viewBox.width
  const scaleY = height / viewBox.height

  return { width, height, scaleX, scaleY }
}

/**
 * Calculate animation parameters with boundary constraints
 * Ensures at least 50% of shape remains visible at oscillation extremes
 */
export function calculateAnimationParams(
  data: ShapeData,
  dimensions: ShapeDimensions,
  viewport: Viewport
): AnimationParams {
  const { width } = dimensions
  const { width: vw } = viewport

  // Boundary constraints: at least 50% visible
  const minX = -width / 2
  const maxX = vw - width / 2

  // Calculate base amplitude
  const isSmall = data.sizeVh < ANIMATION.SMALL_SHAPE_THRESHOLD
  const amplitudeScale = 1 - data.sizeVh * 0.3
  const baseAmplitudePercent = isSmall
    ? ANIMATION.SMALL_AMPLITUDE_PERCENT
    : ANIMATION.BASE_AMPLITUDE_PERCENT * amplitudeScale
  let amplitude = (baseAmplitudePercent / 100) * vw

  // Calculate center position based on zone
  let centerX: number
  if (data.zone === 'left') {
    const baseCenter = isSmall
      ? POSITION.LEFT_SMALL_CENTER_PERCENT
      : POSITION.LEFT_LARGE_CENTER_PERCENT
    centerX = (baseCenter / 100) * vw
    // Bound amplitude for left zone
    const maxAmpLeft = centerX - minX
    const maxAmpRight = maxX - centerX
    amplitude = Math.min(amplitude, maxAmpLeft, maxAmpRight)
  } else {
    centerX = vw - width + (POSITION.RIGHT_OFFSET_PERCENT / 100) * vw
    // Bound amplitude for right zone
    const maxAmpLeft = centerX - minX
    const maxAmpRight = maxX - centerX
    amplitude = Math.min(amplitude, maxAmpLeft, maxAmpRight)
  }

  const yPos = (data.topPercent / 100) * viewport.height

  return { centerX, amplitude, yPos }
}

/**
 * Get or create a cached GraphicsContext for the given shape
 * Per PixiJS 8.x docs: GraphicsContext.svg() parses SVG once,
 * then Graphics(context) reuses it without re-parsing
 */
export function getOrCreateContext(
  type: ShapeData['type'],
  color: string,
  cache: Map<string, GraphicsContext>
): GraphicsContext {
  const cacheKey = `${type}-${color}`

  const cached = cache.get(cacheKey)
  if (cached) return cached

  const svgString = generateSvg(type, color)
  const context = new GraphicsContext().svg(svgString)

  cache.set(cacheKey, context)
  return context
}

/**
 * Create a PixiJS Graphics shape with proper scaling and filters
 */
export function createPixiShape(
  data: ShapeData,
  viewport: Viewport,
  contextCache: Map<string, GraphicsContext>
): AnimatedShape {
  const dimensions = calculateShapeDimensions(data, viewport)
  const animParams = calculateAnimationParams(data, dimensions, viewport)
  const context = getOrCreateContext(data.type, data.color, contextCache)

  const graphics = new Graphics(context)
  graphics.scale.set(dimensions.scaleX, dimensions.scaleY)
  graphics.filters = [new BlurFilter({ strength: BLUR.STRENGTH, quality: BLUR.QUALITY })]

  // Calculate start offset (center position relative to zone anchor)
  const startOffset =
    data.zone === 'left'
      ? animParams.centerX
      : animParams.centerX - (viewport.width - dimensions.width)

  // Set initial position
  if (data.zone === 'left') {
    graphics.x = startOffset
  } else {
    graphics.x = viewport.width - dimensions.width + startOffset
  }
  graphics.y = animParams.yPos

  // Start invisible for fade-in
  graphics.alpha = 0

  return {
    container: graphics,
    data,
    phase: 0,
    // Start at -π/2 so sin(phase) = -1, giving rawBreath = 0 and alpha = OPACITY_MIN
    // This ensures smooth transition from fade-in (ends at OPACITY_MIN) to breathing
    breathingPhase: -Math.PI / 2,
    startOffset,
    amplitude: animParams.amplitude,
    fadeInProgress: 0,
    fadeInComplete: false,
    fadeOutProgress: 0,
    fadeOutStartAlpha: -1, // Sentinel: -1 means "not captured yet"
    isExiting: false,
  }
}
