'use client'

/**
 * Framer Motion exports for Next.js App Router
 *
 * This file re-exports Framer Motion components with 'use client' directive.
 * All Framer Motion components must be used in client components.
 *
 * Usage:
 * ```tsx
 * import { motion, AnimatePresence } from '@/shared/ui/primitives/motion'
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
 */

export {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useInView,
  useDragControls,
  useAnimationControls,
  useReducedMotion,
  LayoutGroup,
  Reorder,
  type MotionProps,
  type Variants,
  type Transition,
} from 'framer-motion'
