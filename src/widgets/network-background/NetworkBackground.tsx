'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'
import { NETWORK_THEMES, type NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import { useReducedMotion } from '@/shared/ui/hooks/use-reduced-motion'
import { Shape, type ShapeConfig, type ShapeZone } from './shapes'

export interface NetworkBackgroundProps {
  /** Network theme controlling colors and shapes */
  theme?: NetworkTheme
  /** Custom CSS classes for the container */
  className?: string
}

/**
 * Generate 2 large shapes positioned on left and right sides
 * Shapes are large (60-70% of viewport height) and drift slowly
 * Max 20% extends beyond screen edges (top/bottom)
 */
function generateShapes(themeConfig: (typeof NETWORK_THEMES)[NetworkTheme]): ShapeConfig[] {
  const shapes: ShapeConfig[] = []

  // Left side shape - large, upper area
  shapes.push({
    type: themeConfig.shape,
    color: themeConfig.primary,
    zone: 'left' as ShapeZone,
    sizeVh: 0.65, // 65% of viewport height
    topPercent: 10, // Upper area
    duration: 25,
    delay: 0,
  })

  // Right side shape - large, lower area
  shapes.push({
    type: themeConfig.shape,
    color: themeConfig.secondary,
    zone: 'right' as ShapeZone,
    sizeVh: 0.7, // 70% of viewport height
    topPercent: 20, // Middle-lower area
    duration: 30,
    delay: 0,
  })

  return shapes
}

/**
 * NetworkBackground widget - Ambient animated background for network themes
 *
 * Renders 2-3 large floating shapes on left/right sides of the screen.
 * Shapes are network-specific (rhombus for ETH, triangle for ARB, circle for OP).
 * Supports smooth theme transitions with AnimatePresence.
 * Respects prefers-reduced-motion accessibility setting.
 *
 * Layout constraints:
 * - Shapes positioned on left/right edges only (not center)
 * - No more than 40% of shape extends beyond screen edges
 * - Large shapes (50-70% of viewport height)
 * - Slow horizontal drift animation
 */
export function NetworkBackground({ theme = 'ethereum', className }: NetworkBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const themeConfig = NETWORK_THEMES[theme]
  const shapes = generateShapes(themeConfig)

  // Only enable animations after hydration to prevent SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show static gradient on SSR only
  if (!mounted) {
    return (
      <div
        className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
        style={{
          background: `linear-gradient(135deg, ${themeConfig.primary}15, ${themeConfig.secondary}10)`,
        }}
      />
    )
  }

  return (
    <div className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className="relative h-full w-full"
        >
          {shapes.map((shape, index) => (
            <Shape key={`${theme}-${index}`} {...shape} reducedMotion={prefersReducedMotion} />
          ))}

          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Vignette layer */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
