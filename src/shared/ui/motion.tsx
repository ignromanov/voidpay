'use client'

/**
 * Framer Motion exports for Next.js App Router
 *
 * This file re-exports only the Framer Motion components actually used in the project.
 * Limiting exports helps with tree-shaking and reduces bundle size.
 *
 * Usage:
 * ```tsx
 * import { motion, AnimatePresence } from '@/shared/ui'
 *
 * export function MyComponent() {
 *   return (
 *     <motion.div
 *       initial={{ opacity: 0 }}
 *       animate={{ opacity: 1 }}
 *       exit={{ opacity: 0 }}
 *     >
 *       Content
 *     </motion.div>
 *   )
 * }
 * ```
 *
 * Note: Only import what you need. Add new exports here if required.
 */

// Core animation components - these are the only ones currently used
export { motion, AnimatePresence } from 'framer-motion'

// Types for component props
export type { MotionProps, Variants, Transition } from 'framer-motion'
