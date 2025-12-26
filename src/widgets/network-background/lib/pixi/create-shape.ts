import { Graphics, GraphicsContext, BlurFilter } from 'pixi.js'
import type { ShapeData } from '../generate-shapes'
import type { AnimatedShape, Viewport, ShapeDimensions, AnimationParams } from './types'
import {
  SHAPE_ASPECT_RATIOS,
  SVG_VIEWBOX_SIZES,
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
 * Calculate animation parameters using shape-specific startPercent and amplitudePercent
 * Movement: from startX toward center by amplitude, then back
 *
 * Left zone: starts off-screen left, moves RIGHT toward center
 * Right zone: starts off-screen right, moves LEFT toward center
 */
export function calculateAnimationParams(
  data: ShapeData,
  dimensions: ShapeDimensions,
  viewport: Viewport
): AnimationParams {
  const { width } = dimensions
  const { width: vw } = viewport

  // Calculate amplitude from shape-specific amplitudePercent
  // Positive for left zone (move right), negative for right zone (move left)
  const baseAmplitude = (data.amplitudePercent / 100) * vw
  const amplitude = data.zone === 'left' ? baseAmplitude : -baseAmplitude

  // Calculate start position based on zone and startPercent
  let startX: number
  if (data.zone === 'left') {
    // Left zone: startPercent relative to left edge (negative = off-screen left)
    // Example: startPercent = -10 → starts at -10% of viewport width
    startX = (data.startPercent / 100) * vw
  } else {
    // Right zone: startPercent is offset beyond right edge (negative = off-screen right)
    // Example: startPercent = -10 → starts 10% beyond right edge
    startX = vw - width - (data.startPercent / 100) * vw
  }

  const yPos = (data.topPercent / 100) * viewport.height

  return { startX, amplitude, yPos }
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
  // Use shape-specific blur parameters
  graphics.filters = [new BlurFilter({ strength: data.blurStrength, quality: data.blurQuality })]

  // Set initial position at startX (shape starts here, animates toward center)
  graphics.x = animParams.startX
  graphics.y = animParams.yPos

  // Start invisible for fade-in
  graphics.alpha = 0

  return {
    container: graphics,
    data,
    phase: 0,
    // Start at 0 so (1 - cos(0)) / 2 = 0, shape at startX
    breathingPhase: -Math.PI / 2,
    startX: animParams.startX,
    amplitude: animParams.amplitude,
    fadeInProgress: 0,
    fadeInComplete: false,
    fadeOutProgress: 0,
    fadeOutStartAlpha: -1, // Sentinel: -1 means "not captured yet"
    isExiting: false,
  }
}
