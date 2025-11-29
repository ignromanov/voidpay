'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { NETWORK_THEMES, type NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import { useReducedMotion } from '@/shared/ui/hooks/use-reduced-motion'
import { Shape } from './shapes'

export interface NetworkBackgroundProps {
  /** Network theme controlling colors and shapes */
  theme?: NetworkTheme
  /** Custom CSS classes for the container */
  className?: string
}

/**
 * NetworkBackground widget - Ambient animated background for network themes
 *
 * Renders floating shapes with network-specific colors and patterns.
 * Supports smooth theme transitions with AnimatePresence.
 * Respects prefers-reduced-motion accessibility setting.
 *
 * @component
 * @example
 * ```tsx
 * // Default ethereum theme
 * <NetworkBackground />
 *
 * // Arbitrum theme
 * <NetworkBackground theme="arbitrum" />
 *
 * // With custom styling
 * <NetworkBackground theme="polygon" className="opacity-50" />
 * ```
 */
export function NetworkBackground({ theme = 'ethereum', className }: NetworkBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()
  const themeConfig = NETWORK_THEMES[theme]

  // Generate shapes based on theme configuration
  const shapes = Array.from({ length: themeConfig.shapeCount }, (_, index) => ({
    id: `${theme}-${index}`,
    type: themeConfig.shape,
    color: index % 2 === 0 ? themeConfig.primary : themeConfig.secondary,
    size: 150 + index * 20,
    delay: index * 0.5,
    duration: 15 + index * 2,
    index,
  }))

  if (prefersReducedMotion) {
    // Static gradient overlay for reduced motion
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="relative h-full w-full"
        >
          {shapes.map((shape) => (
            <Shape
              key={shape.id}
              type={shape.type}
              color={shape.color}
              size={shape.size}
              delay={shape.delay}
              duration={shape.duration}
              index={shape.index}
            />
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
