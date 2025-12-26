'use client'

/**
 * Framer Motion exports for Next.js App Router
 *
 * This file re-exports only the Framer Motion components actually used in the project.
 * Limiting exports helps with tree-shaking and reduces bundle size.
 *
 * Note: LazyMotion was tested but caused FCP regressions due to strict mode
 * blocking render. Direct exports work better with Next.js code splitting.
 *
 * Usage:
 * ```tsx
 * import { motion, AnimatePresence } from '@/shared/ui'
 *
 * <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
 *   Content
 * </motion.div>
 * ```
 */

import type { ReactNode } from 'react'

// Core animation components
export { motion, AnimatePresence } from 'framer-motion'

// Types for component props
export type { MotionProps, Variants, Transition } from 'framer-motion'

/**
 * MotionProvider - No-op wrapper for backward compatibility
 * Kept to avoid breaking existing code that uses it.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
