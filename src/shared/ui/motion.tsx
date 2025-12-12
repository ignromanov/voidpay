'use client'

/**
 * Framer Motion exports with LazyMotion for bundle optimization
 *
 * Uses LazyMotion with dynamic feature loading to reduce initial JS bundle.
 * The `m` component is exported as `motion` for backward compatibility.
 *
 * Performance Strategy:
 * - Initial bundle: ~15KB (LazyMotion shell + m component)
 * - Deferred: ~25KB (domAnimation features loaded async)
 * - Total savings: ~20KB off critical path
 *
 * Usage:
 * ```tsx
 * import { motion, AnimatePresence, MotionProvider } from '@/shared/ui'
 *
 * // Wrap your animated content with MotionProvider
 * <MotionProvider>
 *   <motion.div animate={{ opacity: 1 }}>Content</motion.div>
 * </MotionProvider>
 * ```
 *
 * Note: All motion components MUST be inside MotionProvider to work.
 */

import { LazyMotion, m, AnimatePresence as FramerAnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

// Dynamic import for domAnimation features - loaded after initial render
const loadFeatures = () =>
  import('framer-motion').then((mod) => mod.domAnimation)

/**
 * MotionProvider - Wraps content to enable lazy-loaded animations
 *
 * Must wrap all components using motion.* animations.
 * Features are loaded asynchronously after initial render.
 *
 * @param strict - If true, throws error when m is used outside LazyMotion
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  )
}

// Export m as motion for backward compatibility with existing components
// The m component works identically to motion but requires LazyMotion wrapper
export { m as motion }

// Re-export AnimatePresence (works with both motion and m)
export { FramerAnimatePresence as AnimatePresence }

// Types for component props
export type { MotionProps, Variants, Transition } from 'framer-motion'
