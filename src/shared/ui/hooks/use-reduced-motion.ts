'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect user's reduced motion preference
 *
 * Pure JavaScript implementation without Framer Motion dependency.
 * Uses window.matchMedia to detect prefers-reduced-motion media query.
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
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // SSR-safe check for window
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes (user can toggle system preference)
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}
