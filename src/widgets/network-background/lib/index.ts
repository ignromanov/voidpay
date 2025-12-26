// Constants
export {
  SHAPE_CONFIG,
  ANIMATION_DEFAULTS,
  PIXI_CONFIG,
  BREAKPOINTS,
  SHAPE_ASPECT_RATIOS,
  SVG_VIEWBOX_SIZES,
} from './constants'
export type { ShapeConfig } from './constants'

// SVG Generators
export { SVG_GENERATORS, generateSvg } from './svg-generators'

// Shape Generation
export type { ShapeZone, ShapeData } from './generate-shapes'
export { generateShapes } from './generate-shapes'

// PixiJS Modules
export type { AnimatedShape, Viewport, ShapeDimensions, AnimationParams } from './pixi'
export {
  calculateShapeDimensions,
  calculateAnimationParams,
  getOrCreateContext,
  createPixiShape,
  animateShape,
  setStaticPosition,
} from './pixi'
