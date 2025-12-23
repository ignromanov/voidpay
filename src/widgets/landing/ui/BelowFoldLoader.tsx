'use client'

/**
 * BelowFoldLoader - Intersection Observer based lazy loader
 * Feature: 012-landing-page (Performance Optimization)
 *
 * This component defers loading of below-fold content until the user
 * scrolls close to it. This significantly reduces initial JS bundle:
 * - Framer Motion (~50KB) only loads when needed
 * - Below-fold sections only hydrate when visible
 *
 * Strategy:
 * - Uses rootMargin to trigger load before content is visible
 * - Shows skeleton placeholder during loading
 * - Once loaded, stays loaded (no unloading on scroll away)
 */

import { useState, useEffect, useRef, type ReactNode } from 'react'

type BelowFoldLoaderProps = {
  /** Content to render once visible */
  children: ReactNode
  /** Height of placeholder skeleton (default: 100vh) */
  placeholderHeight?: string
  /** How far before visible to start loading (default: 200px) */
  rootMargin?: string
  /** Optional skeleton content instead of default */
  skeleton?: ReactNode
}

/**
 * Default skeleton placeholder
 * Matches approximate height of below-fold sections
 */
function DefaultSkeleton({ height }: { height: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: height }}
      aria-busy="true"
      aria-label="Loading content..."
    >
      {/* Subtle loading indicator */}
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-violet-500" />
    </div>
  )
}

export function BelowFoldLoader({
  children,
  placeholderHeight = '100vh',
  rootMargin = '200px',
  skeleton,
}: BelowFoldLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger) return undefined

    // Skip Intersection Observer if user has scrolled past (e.g., browser back)
    const rect = trigger.getBoundingClientRect()
    if (rect.top < window.innerHeight) {
      setShouldLoad(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold: 0,
      }
    )

    observer.observe(trigger)

    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={triggerRef}>
      {shouldLoad ? (
        children
      ) : (
        skeleton ?? <DefaultSkeleton height={placeholderHeight} />
      )}
    </div>
  )
}
