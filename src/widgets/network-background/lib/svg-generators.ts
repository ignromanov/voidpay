import type { ShapeType } from '@/shared/ui/constants/brand-tokens'

/**
 * Generates Ethereum diamond SVG with 4 faces for 3D depth effect
 * Based on authentic logo geometry with gap between top and bottom
 */
function generateEthereumSvg(color: string): string {
  return `<svg viewBox="0 0 784 1277" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="${color}" fill-opacity="0.65" points="392,0 0,651 392,882"/>
    <polygon fill="${color}" fill-opacity="1" points="392,0 784,651 392,882"/>
    <polygon fill="${color}" fill-opacity="0.65" points="392,957 0,725 392,1277"/>
    <polygon fill="${color}" fill-opacity="0.95" points="392,957 784,725 392,1277"/>
  </svg>`
}

/**
 * Generates Arbitrum hexagon badge SVG with stylized "A"
 */
function generateArbitrumSvg(color: string): string {
  return `<svg viewBox="0 0 2500 2500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" fill-opacity="1" d="M226,760v980c0,63,33,120,88,152l849,490c54,31,121,31,175,0l849-490c54-31,88-89,88-152V760c0-63-33-120-88-152l-849-490c-54-31-121-31-175,0L314,608c-54,31-87,89-87,152H226z"/>
    <path fill="${color}" fill-opacity="0.7" d="M1435,1440l-121,332c-3,9-3,19,0,29l208,571l241-139l-289-793C1467,1422,1442,1422,1435,1440z"/>
    <path fill="${color}" fill-opacity="0.7" d="M1678,882c-7-18-32-18-39,0l-121,332c-3,9-3,19,0,29l341,935l241-139L1678,883V882z"/>
    <polygon fill="${color}" fill-opacity="0.5" points="642,2179 727,1947 897,2088 738,2234"/>
    <path fill="white" fill-opacity="0.6" d="M1172,644H939c-17,0-33,11-39,27L401,2039l241,139l550-1507c5-14-5-28-19-28L1172,644z"/>
    <path fill="white" fill-opacity="0.6" d="M1580,644h-233c-17,0-33,11-39,27L738,2233l241,139l620-1701c5-14-5-28-19-28V644z"/>
  </svg>`
}

/**
 * Generates Polygon interlocked hexagonal nodes SVG
 */
function generatePolygonSvg(color: string): string {
  return `<svg viewBox="0 0 178 161" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" fill-opacity="1" d="M66.8,54.7l-16.7-9.7L0,74.1v58l50.1,29l50.1-29V41.9L128,25.8l27.8,16.1v32.2L128,90.2l-16.7-9.7v25.8l16.7,9.7l50.1-29V29L128,0L77.9,29v90.2l-27.8,16.1l-27.8-16.1V86.9l27.8-16.1l16.7,9.7V54.7z"/>
  </svg>`
}

/**
 * Generates Optimism circle SVG
 */
function generateOptimismSvg(color: string): string {
  return `<svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="250" cy="250" r="250" fill="${color}" fill-opacity="1"/>
  </svg>`
}

/**
 * Generates VoidPay organic blob with inner void
 */
function generateVoidPaySvg(color: string): string {
  return `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" fill-opacity="1" d="M100,20 C140,20 170,40 180,80 C190,120 180,160 140,180 C100,200 50,190 30,150 C10,110 20,60 60,35 C80,22 90,20 100,20Z"/>
    <ellipse cx="100" cy="100" rx="35" ry="40" fill="black" fill-opacity="0.4"/>
  </svg>`
}

/**
 * Map of shape types to their SVG generator functions
 */
export const SVG_GENERATORS: Record<ShapeType, (color: string) => string> = {
  rhombus: generateEthereumSvg,
  triangle: generateArbitrumSvg,
  hexagon: generatePolygonSvg,
  circle: generateOptimismSvg,
  blob: generateVoidPaySvg,
}

/**
 * Generate SVG string for a given shape type and color
 */
export function generateSvg(type: ShapeType, color: string): string {
  return SVG_GENERATORS[type](color)
}
