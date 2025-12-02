'use client'

import { motion } from 'framer-motion'
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
}

/**
 * Clip paths for network-inspired shapes:
 * - ethereum/rhombus: Diamond crystal shape (ETH logo inspired)
 * - arbitrum/triangle: Stylized A shape (ARB logo inspired)
 * - optimism/circle: Simple circle (OP logo inspired)
 */
const CLIP_PATHS: Record<ShapeType, string | undefined> = {
  // Ethereum diamond - tall crystal shape like ETH logo (sharp top & bottom, wide middle)
  rhombus: 'polygon(50% 0%, 85% 45%, 50% 100%, 15% 45%)',
  // Arbitrum triangle - stylized A shape
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  // Hexagon for Polygon
  hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  // Circle and blob use border-radius
  circle: undefined,
  blob: undefined,
}

/**
 * Renders individual animated shape for NetworkBackground
 *
 * Shapes are positioned in left/right zones with constraints:
 * - No more than 20% of shape extends beyond screen edges (top/bottom/sides)
 * - Shapes don't enter the central area of the screen
 * - Slow horizontal drift animation
 */
export function Shape({ type, color, zone, sizeVh, topPercent, duration, delay }: ShapeConfig) {
  // Calculate horizontal position based on zone
  // Max 20% off-screen, staying away from center
  const getHorizontalPosition = () => {
    if (zone === 'left') {
      // Left zone: -20% to 5% (shape 80-100% visible, away from center)
      return { start: -15, end: 0 }
    } else {
      // Right zone: 55% to 75% (shape 80-100% visible, away from center)
      return { start: 55, end: 70 }
    }
  }

  const { start, end } = getHorizontalPosition()
  const driftDirection = [start, end, start]

  const clipPath = CLIP_PATHS[type]
  const isRounded = type === 'circle'
  const isBlob = type === 'blob'

  return (
    <motion.div
      className="absolute mix-blend-screen"
      style={{
        width: `${sizeVh * 100}vh`,
        height: `${sizeVh * 100}vh`,
        top: `${topPercent}%`,
        filter: 'blur(60px)',
      }}
      initial={{
        left: `${start}%`,
        opacity: 0,
      }}
      animate={{
        left: driftDirection.map(v => `${v}%`),
        opacity: [0.12, 0.22, 0.12],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        data-shape={type}
        className="h-full w-full"
        style={{
          backgroundColor: color,
          clipPath: clipPath,
          borderRadius: isRounded ? '50%' : isBlob ? '30% 70% 70% 30% / 30% 30% 70% 70%' : undefined,
        }}
      />
    </motion.div>
  )
}
