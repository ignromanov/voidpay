'use client'

/**
 * Framer Motion exports with LazyMotion for bundle optimization
 *
 * Uses LazyMotion with domAnimation (lighter than full motion API).
 * Provides ~40% smaller bundle than full framer-motion.
 *
 * Performance Strategy:
 * - domAnimation: ~20KB (vs ~45KB full motion)
 * - Synchronous import: no render blocking waterfall
 *
 * Usage:
 * ```tsx
 * import { motion, AnimatePresence, MotionProvider } from '@/shared/ui'
 *
 * <MotionProvider>
 *   <motion.div animate={{ opacity: 1 }}>Content</motion.div>
 * </MotionProvider>
 * ```
 */

import { LazyMotion, domAnimation, m, AnimatePresence as FramerAnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * MotionProvider - Wraps content with lighter domAnimation features
 *
 * Uses synchronous domAnimation import to avoid render blocking.
 * Excludes heavier features like SVG morphing, layout animations, drag.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}

// Export m as motion for backward compatibility with existing components
export { m as motion }

// Re-export AnimatePresence
export { FramerAnimatePresence as AnimatePresence }

// Types for component props
export type { MotionProps, Variants, Transition } from 'framer-motion'
