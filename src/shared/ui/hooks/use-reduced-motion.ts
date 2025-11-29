'use client'

import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

/**
 * Hook to detect user's reduced motion preference
 *
 * Wraps Framer Motion's useReducedMotion hook for consistent usage
 * across all brand components. Respects system accessibility settings.
 *
 * @returns {boolean} true if user prefers reduced motion, false otherwise
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = useReducedMotion()
 *
 *   return (
 *     <div className={cn(
 *       'transition-all',
 *       !prefersReducedMotion && 'animate-pulse'
 *     )}>
 *       Content
 *     </div>
 *   )
 * }
 * ```
 *
 * @see https://www.framer.com/motion/use-reduced-motion/
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false
}
