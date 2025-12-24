'use client'

import { useEffect, useState } from 'react'

import { cn, useHydrated } from '@/shared/lib'
import { AnimatePresence, motion } from '@/shared/ui/motion'
import { NETWORK_THEMES, type NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import { useReducedMotion } from '@/shared/ui/hooks/use-reduced-motion'
import { Shape, type ShapeConfig, type ShapeZone } from './shapes'

export interface NetworkBackgroundProps {
  /** Network theme controlling colors and shapes (defaults to ethereum) */
  theme?: NetworkTheme
  /** Custom CSS classes for the container */
  className?: string
}

/**
 * Hook to defer animation start until browser is idle
 * Prevents shape animations from blocking LCP and TBT
 */
function useDeferredAnimation(): boolean {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    // Use requestIdleCallback to start animations when browser is idle
    // This prevents blocking the main thread during initial render
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(() => setShouldAnimate(true), {
        timeout: 3000, // Start within 3s even if not idle
      })
      return () => cancelIdleCallback(idleId)
    } else {
      // Safari fallback - wait 2 seconds after mount
      const timeoutId = setTimeout(() => setShouldAnimate(true), 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [])

  return shouldAnimate
}

/**
 * Generate shapes with asymmetric layout:
 * - Primary: Large shape top-left (dominant, 70% vh)
 * - Secondary: Smaller shape bottom-right (45% vh)
 * - Accent: Small shape mid-right (25% vh)
 */
function generateShapes(themeConfig: (typeof NETWORK_THEMES)[NetworkTheme]): ShapeConfig[] {
  const shapes: ShapeConfig[] = []

  // Primary: Large shape top-left (anchor point, below header)
  // Vertical range: 8% to ~58% (offset for ~64px header)
  shapes.push({
    type: themeConfig.shape,
    color: themeConfig.primary,
    zone: 'left' as ShapeZone,
    sizeVh: 0.5, // 50% of viewport height
    topPercent: 8,
    duration: 20,
    delay: 0,
  })

  // Secondary: Large shape right side (diagonal balance)
  // Vertical range: 20% to ~80%
  // Hidden on mobile (<768px) - too wide for narrow viewport
  shapes.push({
    type: themeConfig.shape,
    color: themeConfig.secondary,
    zone: 'right' as ShapeZone,
    sizeVh: 0.6, // 60% of viewport height
    topPercent: 20,
    duration: 25,
    delay: 2,
    className: 'hidden md:block',
  })

  // Accent: Small shape bottom-left (subtle, fills empty corner)
  // Vertical range: 65% to ~90%
  shapes.push({
    type: themeConfig.shape,
    color: themeConfig.primary,
    zone: 'left' as ShapeZone,
    sizeVh: 0.25, // 25% of viewport height
    topPercent: 65,
    duration: 15,
    delay: 4,
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
  const hydrated = useHydrated()
  const shouldAnimate = useDeferredAnimation()
  const themeConfig = NETWORK_THEMES[theme]
  const shapes = generateShapes(themeConfig)

  // Render nothing on SSR to avoid flash - shapes appear after hydration
  if (!hydrated) {
    return (
      <div
        className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
        aria-hidden="true"
      />
    )
  }

  // Combine reduced motion preference with deferred animation state
  // Shapes will be static until browser is idle
  const disableAnimation = prefersReducedMotion || !shouldAnimate

  return (
    <div className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="relative h-full w-full"
        >
          {shapes.map((shape, index) => (
            <Shape key={`${theme}-${index}`} {...shape} reducedMotion={disableAnimation} />
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
