'use client'

import { cn } from '@/shared/lib'
import { motion } from '@/shared/ui/motion'
import type { ShapeType } from '@/shared/ui/constants/brand-tokens'

/**
 * Position zone for shapes - left or right side of screen
 */
export type ShapeZone = 'left' | 'right'

export type ShapeConfig = {
  type: ShapeType
  color: string
  zone: ShapeZone
  /** Size as percentage of viewport height (0.5 = 50vh) */
  sizeVh: number
  /** Vertical position as percentage (0-100) */
  topPercent: number
  /** Animation duration in seconds */
  duration: number
  /** Animation delay in seconds */
  delay: number
  /** Disable animations for reduced motion */
  reducedMotion?: boolean
  /** Additional CSS classes (for responsive hiding, etc.) */
  className?: string
}

/**
 * Aspect ratios for each shape type to match real logo proportions
 * width:height ratio (1 = square, >1 = wide, <1 = tall)
 */
const SHAPE_ASPECT_RATIOS: Record<ShapeType, number> = {
  rhombus: 0.61,  // Ethereum: 784/1277 from SVG viewBox
  triangle: 1.0,  // Arbitrum: square hexagon badge
  hexagon: 1.1,   // Polygon: 178/161 from SVG viewBox
  circle: 1,      // Optimism: perfect circle
  blob: 1.1,      // VoidPay: slightly wide blob
}

/**
 * Ethereum logo SVG - Diamond/Octahedron shape
 * Source: assets/logos/ethereum-eth-logo.svg (viewBox 784.37 x 1277.39)
 * Original colors: #343434, #8C8C8C, #3C3C3B, #141414, #393939 (grayscale)
 */
function EthereumSvg({ color, opacity }: { color: string; opacity: number }) {
  // Use color prop to tint the grayscale logo
  // Original is grayscale, we apply theme color with varying opacity
  return (
    <svg
      viewBox="0 0 784.37 1277.39"
      fill="none"
      className="w-full h-full"
      style={{ opacity }}
    >
      {/* #343434 - Top right face (dark) */}
      <polygon fill={color} fillOpacity={1} points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54" />
      {/* #8C8C8C - Top left face (light) */}
      <polygon fill={color} fillOpacity={0.65} points="392.07,0 0,650.54 392.07,882.29 392.07,472.33" />
      {/* #3C3C3B - Bottom right face (dark) */}
      <polygon fill={color} fillOpacity={0.95} points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89" />
      {/* #8C8C8C - Bottom left face (light) */}
      <polygon fill={color} fillOpacity={0.65} points="392.07,1277.38 392.07,956.52 0,724.89" />
      {/* #141414 - Middle right (darkest) */}
      <polygon fill={color} fillOpacity={0.35} points="392.07,882.29 784.13,650.54 392.07,472.33" />
      {/* #393939 - Middle left */}
      <polygon fill={color} fillOpacity={0.5} points="0,650.54 392.07,882.29 392.07,472.33" />
    </svg>
  )
}

/**
 * Arbitrum logo SVG - Hexagon with stylized "A"
 * Source: assets/logos/arbitrum-arb-logo.svg (viewBox 2500 x 2500)
 * Colors: #213147 (bg), #12AAFF (cyan accents), #FFFFFF (white strokes)
 */
function ArbitrumSvg({ color, opacity }: { color: string; opacity: number }) {
  // Use theme color for visibility on dark backgrounds with screen blend mode
  // Original Arbitrum colors don't work well with mix-blend-mode: screen
  return (
    <svg
      viewBox="0 0 2500 2500"
      fill="none"
      className="w-full h-full"
      style={{ opacity }}
    >
      {/* Main hexagon background - uses theme color for visibility */}
      <path
        fill={color}
        fillOpacity={1}
        d="M226,760v980c0,63,33,120,88,152l849,490c54,31,121,31,175,0l849-490c54-31,88-89,88-152V760c0-63-33-120-88-152l-849-490c-54-31-121-31-175,0L314,608c-54,31-87,89-87,152H226z"
      />
      {/* Cyan accent lower - lighter for depth */}
      <path
        fill={color}
        fillOpacity={0.7}
        d="M1435,1440l-121,332c-3,9-3,19,0,29l208,571l241-139l-289-793C1467,1422,1442,1422,1435,1440z"
      />
      {/* Cyan accent upper - lighter for depth */}
      <path
        fill={color}
        fillOpacity={0.7}
        d="M1678,882c-7-18-32-18-39,0l-121,332c-3,9-3,19,0,29l341,935l241-139L1678,883V882z"
      />
      {/* Small triangle detail */}
      <polygon
        fill={color}
        fillOpacity={0.5}
        points="642,2179 727,1947 897,2088 738,2234"
      />
      {/* White stroke left - adds definition */}
      <path
        fill="white"
        fillOpacity={0.6}
        d="M1172,644H939c-17,0-33,11-39,27L401,2039l241,139l550-1507c5-14-5-28-19-28L1172,644z"
      />
      {/* White stroke right - adds definition */}
      <path
        fill="white"
        fillOpacity={0.6}
        d="M1580,644h-233c-17,0-33,11-39,27L738,2233l241,139l620-1701c5-14-5-28-19-28V644z"
      />
    </svg>
  )
}

/**
 * Polygon logo SVG - Interlocked hexagonal nodes
 * Source: assets/logos/polygon-matic-logo.svg (viewBox 178 x 161)
 */
function PolygonSvg({ color, opacity }: { color: string; opacity: number }) {
  return (
    <svg
      viewBox="0 0 178 161"
      fill="none"
      className="w-full h-full"
      style={{ opacity }}
    >
      <path
        fill={color}
        fillOpacity={1}
        d="M66.8,54.7l-16.7-9.7L0,74.1v58l50.1,29l50.1-29V41.9L128,25.8l27.8,16.1v32.2L128,90.2l-16.7-9.7v25.8l16.7,9.7l50.1-29V29L128,0L77.9,29v90.2l-27.8,16.1l-27.8-16.1V86.9l27.8-16.1l16.7,9.7V54.7z"
      />
    </svg>
  )
}

/**
 * Optimism logo SVG - Circle with "OP" text
 * Source: assets/logos/optimism-ethereum-op-logo.svg (viewBox 500 x 500)
 * For background shape, we only use the circle, not the text
 */
function OptimismSvg({ color, opacity }: { color: string; opacity: number }) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      className="w-full h-full"
      style={{ opacity }}
    >
      <circle cx="250" cy="250" r="250" fill={color} fillOpacity={1} />
    </svg>
  )
}

/**
 * VoidPay logo - Organic blob with inner void
 * Custom shape representing the VoidPay brand
 */
function VoidPaySvg({ color, opacity }: { color: string; opacity: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className="w-full h-full"
      style={{ opacity }}
    >
      {/* Outer organic blob */}
      <path
        fill={color}
        fillOpacity={1}
        d="M100,20 C140,20 170,40 180,80 C190,120 180,160 140,180 C100,200 50,190 30,150 C10,110 20,60 60,35 C80,22 90,20 100,20Z"
      />
      {/* Inner void (darker center) */}
      <ellipse
        cx="100"
        cy="100"
        rx="35"
        ry="40"
        fill="black"
        fillOpacity={0.4}
      />
    </svg>
  )
}

/**
 * Map shape types to their SVG components
 */
const SHAPE_COMPONENTS: Record<ShapeType, React.FC<{ color: string; opacity: number }>> = {
  rhombus: EthereumSvg,
  triangle: ArbitrumSvg,
  hexagon: PolygonSvg,
  circle: OptimismSvg,
  blob: VoidPaySvg,
}

/**
 * Renders individual animated shape for NetworkBackground
 *
 * Shapes are positioned in left/right zones with constraints:
 * - No more than 20% of shape extends beyond screen edges (top/bottom/sides)
 * - Shapes don't enter the central area of the screen
 * - Slow horizontal drift animation
 * - Uses inline SVG for accurate logo representation
 */
export function Shape({ type, color, zone, sizeVh, topPercent, duration, delay, reducedMotion, className }: ShapeConfig) {
  // Amplitude scales with size - smaller shapes move MORE (lighter, floatier)
  // Large shapes move less (visual mass), small shapes drift further
  const isSmall = sizeVh < 0.3
  const amplitudeScale = 1 - sizeVh * 0.3
  const baseAmplitude = 12
  // Small shapes: fixed amplitude to reach ~20% from left edge (-4 + 24 = 20)
  const amplitude = isSmall ? 24 : baseAmplitude * amplitudeScale

  // Position drift from edge - small left objects start visible, large ones start off-screen
  const baseStart = zone === 'left' ? (isSmall ? 4 : -4) : -8
  const start = baseStart
  const end = start + amplitude

  // Static position for reduced motion
  const staticPos = (start + end) / 2

  // Breathing: very subtle fade for background feel
  const opacityMin = 0.08
  const opacityMax = 0.25
  const midOpacity = (opacityMin + opacityMax) / 2

  // Desync opacity from position - breathing is slower
  const breathingDuration = duration * 1.2

  // Size constraint: use vh for desktop, but cap at 150vw on mobile
  const aspectRatio = SHAPE_ASPECT_RATIOS[type]
  const baseSize = `min(${sizeVh * 100}vh, 150vw)`
  // Width and height based on aspect ratio
  const width = aspectRatio >= 1 ? baseSize : `calc(${baseSize} * ${aspectRatio})`
  const height = aspectRatio <= 1 ? baseSize : `calc(${baseSize} / ${aspectRatio})`

  const ShapeComponent = SHAPE_COMPONENTS[type]

  // Use left for left zone, right for right zone
  const positionProp = zone === 'left' ? 'left' : 'right'

  return (
    // OUTER: fade-in container (runs once)
    // Handles smooth appearance from invisible to visible
    <motion.div
      className={cn('absolute', className)}
      data-shape={type}
      style={{
        width,
        height,
        top: `${topPercent}%`,
        [positionProp]: 0, // Anchor point for inner positioning
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.5,
        delay: delay * 0.3,
        ease: 'easeOut',
      }}
    >
      {/* INNER: breathing + drift (runs forever) */}
      {/* Position uses left/right %, opacity oscillates between min and max */}
      <motion.div
        className="absolute inset-0"
        style={{
          filter: 'blur(12px)',
        }}
        initial={{
          [positionProp]: reducedMotion ? `${staticPos}%` : `${start}%`,
          opacity: opacityMin,
        }}
        animate={
          reducedMotion
            ? { [positionProp]: `${staticPos}%`, opacity: midOpacity }
            : {
                [positionProp]: [`${start}%`, `${end}%`],
                opacity: [opacityMin, opacityMax, opacityMin],
              }
        }
        transition={
          reducedMotion
            ? { duration: 0.5 }
            : {
                [positionProp]: {
                  duration: duration * 1.4,
                  repeat: Infinity,
                  repeatType: 'mirror' as const,
                  ease: 'easeInOut' as const,
                },
                opacity: {
                  duration: breathingDuration,
                  repeat: Infinity,
                  ease: [0.22, 0.61, 0.36, 1] as const,
                },
              }
        }
      >
        <ShapeComponent color={color} opacity={1} />
      </motion.div>
    </motion.div>
  )
}
