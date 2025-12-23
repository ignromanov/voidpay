'use client'

/**
 * LandingContent - Client-side wrapper for landing page content
 * Feature: 012-landing-page
 *
 * Performance Strategy (optimized for LCP < 2.5s):
 * 1. Above-fold (immediate): HeroSection + SocialProofStrip
 *    - No Framer Motion imports (uses CSS animations)
 *    - Static gradient background (no motion dependency)
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
import { NetworkThemeProvider } from '../context/network-theme-context'
import { HeroSection } from '../hero-section/HeroSection'
import { SocialProofStrip } from '../social-proof'
import { BelowFoldLoader } from './BelowFoldLoader'

/**
 * Static background gradient - shown immediately, no JS required
 * Matches the visual style of animated background but without motion
 * z-[0] places it above body background but below animated NetworkBackground
 */
function StaticBackground() {
  return (
    <div className="fixed inset-0 z-[0] bg-zinc-950">
      {/* Gradient glow matching ethereum theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-indigo-600/5 blur-3xl" />
    </div>
  )
}

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
 * LazyAnimatedBackground - Loads NetworkBackground ONLY after mount
 * Dynamic import inside useEffect prevents webpack static analysis
 */
function LazyAnimatedBackground() {
  const [Component, setComponent] = useState<ComponentType<object> | null>(null)

  useEffect(() => {
    // Dynamic import INSIDE useEffect - webpack can't statically analyze this
    import('./AnimatedBackground')
      .then((m) => {
        setComponent(() => m.AnimatedBackground)
      })
      .catch((error) => {
        // Silent fallback - static background remains visible
        console.error('[LazyAnimatedBackground] Failed to load:', error)
      })
  }, [])

  if (!Component) return null
  return <Component />
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
  return (
    <NetworkThemeProvider defaultTheme="ethereum">
      {/* Static background - immediate, no motion (z-0) */}
      <StaticBackground />

      {/* Animated background - loads after mount via useEffect (z-1) */}
      <LazyAnimatedBackground />

      {/* Content wrapper - above all backgrounds (z-10) */}
      <div className="relative z-10">
        {/* Above-fold: Immediate render, no motion dependencies */}
        <HeroSection />
        <SocialProofStrip />

        {/* Below-fold: Intersection Observer triggers lazy load */}
        <BelowFoldLoader placeholderHeight="300vh" rootMargin="400px">
          <LazyBelowFold />
        </BelowFoldLoader>
      </div>
    </NetworkThemeProvider>
  )
}
