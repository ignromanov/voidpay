'use client'

/**
 * LandingContent - Client-side wrapper for landing page content
 * Feature: 012-landing-page
 *
 * Background: Uses NetworkBackground from layout.tsx (unified across all pages).
 * Sets 'ethereum' theme on mount via useCreatorStore.
 *
 * Performance Strategy (optimized for LCP < 2.5s):
 * 1. Above-fold (immediate): HeroSection + SocialProofStrip
 *    - No Framer Motion imports (uses CSS animations)
 *    - Synchronous hydration
 *
 * 2. Below-fold (deferred with useEffect + dynamic import):
 *    - Loads ONLY after component mounts on client
 *    - Framer Motion not included in initial bundle
 *    - Uses Intersection Observer for scroll-triggered loading
 *
 * Critical: Dynamic imports MUST be inside useEffect/callbacks to prevent
 * webpack from statically analyzing and bundling them.
 */

import { useState, useEffect, type ComponentType } from 'react'
import { useCreatorStore } from '@/entities/creator'
import { HeroSection } from '../hero-section/HeroSection'
import { SocialProofStrip } from '../social-proof'
import { BelowFoldLoader } from './BelowFoldLoader'

/**
 * SEO-friendly placeholder for below-fold content.
 */
function BelowFoldPlaceholder() {
  return (
    <div className="space-y-32 py-20">
      <section className="container mx-auto px-4">
        <h2 className="sr-only">How VoidPay Works</h2>
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-900/30" />
      </section>
      <section className="container mx-auto px-4">
        <h2 className="sr-only">Interactive Demo</h2>
        <div className="h-[600px] animate-pulse rounded-2xl bg-zinc-900/30" />
      </section>
      <section className="container mx-auto px-4">
        <div className="h-80 animate-pulse rounded-2xl bg-zinc-900/30" />
      </section>
    </div>
  )
}

/**
 * LazyBelowFold - Loads below-fold sections ONLY when triggered
 */
function LazyBelowFold() {
  const [Component, setComponent] = useState<ComponentType<object> | null>(null)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    import('./BelowFoldSections')
      .then((m) => {
        setComponent(() => m.BelowFoldSections)
      })
      .catch((error) => {
        console.error('[LazyBelowFold] Failed to load below-fold content:', error)
        setLoadError(error instanceof Error ? error : new Error(String(error)))
      })
  }, [])

  if (loadError) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">Failed to load content.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  if (!Component) return <BelowFoldPlaceholder />
  return <Component />
}

export function LandingContent() {
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)

  // Set ethereum theme on mount (landing page uses default ethereum branding)
  useEffect(() => {
    setNetworkTheme('ethereum')
  }, [setNetworkTheme])

  // Preload bundles after initial paint for smoother scrolling
  useEffect(() => {
    // Use requestIdleCallback for preloading (setTimeout fallback for Safari)
    const preload = () => {
      // Preload below-fold sections bundle
      import('./BelowFoldSections').catch(() => {
        // Silent - just a preload, actual error handling in LazyBelowFold
      })

      // Prefetch /create route (main CTA destination)
      if ('connection' in navigator) {
        const connection = navigator.connection as { saveData?: boolean }
        // Skip prefetch on slow connections or data saver mode
        if (connection?.saveData) return
      }

      // Use link prefetch for route (works with Next.js)
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = '/create'
      link.as = 'document'
      document.head.appendChild(link)
    }

    // requestIdleCallback with 2s timeout (fallback to setTimeout for Safari)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preload, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    } else {
      const id = setTimeout(preload, 100)
      return () => clearTimeout(id)
    }
  }, [])

  return (
    <>
      {/* Content wrapper - above NetworkBackground from layout (z-10) */}
      <div className="relative z-10">
        {/* Above-fold: Immediate render, no motion dependencies */}
        <HeroSection />
        <SocialProofStrip />

        {/* Below-fold: Intersection Observer triggers lazy load */}
        <BelowFoldLoader placeholderHeight="300vh" rootMargin="400px">
          <LazyBelowFold />
        </BelowFoldLoader>
      </div>
    </>
  )
}
