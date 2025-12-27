'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Application, GraphicsContext, Ticker } from 'pixi.js'

import { cn, useHydrated } from '@/shared/lib'
import { NETWORK_THEMES, type NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import { useReducedMotion } from '@/shared/ui/hooks/use-reduced-motion'

import {
  ANIMATION_DEFAULTS,
  PIXI_CONFIG,
  BREAKPOINTS,
  generateShapes,
  createPixiShape,
  animateShape,
  setStaticPosition,
  type AnimatedShape,
} from './lib'

// ============================================================================
// Types
// ============================================================================

export interface PixiBackgroundProps {
  theme?: NetworkTheme
  className?: string
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to defer animation start until browser is idle
 * Prevents shape animations from blocking LCP and TBT
 */
function useDeferredAnimation(): boolean {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(() => setShouldAnimate(true), {
        timeout: ANIMATION_DEFAULTS.IDLE_CALLBACK_TIMEOUT_MS,
      })
      return () => cancelIdleCallback(idleId)
    } else {
      const timeoutId = setTimeout(
        () => setShouldAnimate(true),
        ANIMATION_DEFAULTS.SAFARI_FALLBACK_TIMEOUT_MS
      )
      return () => clearTimeout(timeoutId)
    }
  }, [])

  return shouldAnimate
}

// ============================================================================
// Main Component
// ============================================================================

export function PixiBackground({ theme = 'ethereum', className }: PixiBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const shapesRef = useRef<AnimatedShape[]>([])
  const tickerCallbackRef = useRef<((ticker: Ticker) => void) | null>(null)
  const contextCacheRef = useRef<Map<string, GraphicsContext>>(new Map())

  // Crossfade transition refs
  const exitingShapesRef = useRef<AnimatedShape[]>([])
  const prevThemeRef = useRef<NetworkTheme>(theme)
  const themeTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const themeConfigRef = useRef(NETWORK_THEMES[theme])

  const prefersReducedMotion = useReducedMotion()
  const hydrated = useHydrated()
  const shouldAnimate = useDeferredAnimation()
  const themeConfig = NETWORK_THEMES[theme]

  // Keep ref in sync with current theme config
  themeConfigRef.current = themeConfig

  const disableAnimation = prefersReducedMotion || !shouldAnimate

  // Initialize PixiJS Application
  const initPixi = useCallback(async () => {
    if (!containerRef.current || appRef.current) return

    const app = new Application()

    await app.init({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, PIXI_CONFIG.MAX_RESOLUTION),
      autoDensity: true,
      preference: PIXI_CONFIG.PREFERENCE,
    })

    // Limit FPS to 20 for GPU optimization (animations are slow, 30fps is sufficient)
    app.ticker.maxFPS = 20

    app.canvas.style.position = 'absolute'
    app.canvas.style.top = '0'
    app.canvas.style.left = '0'
    app.canvas.style.width = '100%'
    app.canvas.style.height = '100%'

    containerRef.current.appendChild(app.canvas)
    appRef.current = app

    return app
  }, [])

  // Create and position shapes
  const createShapes = useCallback(
    (app: Application, config: (typeof NETWORK_THEMES)[NetworkTheme]) => {
      // Clear existing shapes (but keep cached contexts)
      shapesRef.current.forEach((shape) => shape.container.destroy())
      shapesRef.current = []

      const shapesData = generateShapes(config)
      const isMobile = window.innerWidth < BREAKPOINTS.MOBILE
      const viewport = { width: window.innerWidth, height: window.innerHeight }

      for (const data of shapesData) {
        if (data.hideOnMobile && isMobile) continue

        const animatedShape = createPixiShape(data, viewport, contextCacheRef.current)
        app.stage.addChild(animatedShape.container)
        shapesRef.current.push(animatedShape)
      }
    },
    []
  )

  // Animation loop
  const animate = useCallback((ticker: Ticker) => {
    const deltaTime = ticker.deltaMS / 1000
    const viewport = { width: window.innerWidth, height: window.innerHeight }

    // Animate active shapes
    shapesRef.current.forEach((shape) => animateShape(shape, deltaTime, viewport))

    // Animate exiting shapes and remove completed ones
    exitingShapesRef.current = exitingShapesRef.current.filter((shape) => {
      const stillAnimating = animateShape(shape, deltaTime, viewport)
      if (!stillAnimating) {
        shape.container.destroy()
      }
      return stillAnimating
    })
  }, [])

  // Setup and cleanup - runs once when hydrated
  useEffect(() => {
    if (!hydrated) return

    let mounted = true
    // Capture ref value for cleanup (required by react-hooks/exhaustive-deps)
    const contextCache = contextCacheRef.current

    const setup = async () => {
      const app = await initPixi()
      if (!app || !mounted) return

      // Use ref for initial theme config (prevents re-running effect on theme change)
      createShapes(app, themeConfigRef.current)

      if (!disableAnimation) {
        const callback = (ticker: Ticker) => animate(ticker)
        tickerCallbackRef.current = callback
        app.ticker.add(callback)
      } else {
        const viewport = { width: window.innerWidth, height: window.innerHeight }
        shapesRef.current.forEach((shape) => setStaticPosition(shape, viewport))
      }
    }

    setup()

    const handleResize = () => {
      if (appRef.current) {
        // Use ref for current theme config
        createShapes(appRef.current, themeConfigRef.current)
      }
    }
    window.addEventListener('resize', handleResize)

    // Pause animations when tab is hidden (saves GPU when in background)
    const handleVisibilityChange = () => {
      if (!appRef.current) return
      if (document.hidden) {
        appRef.current.ticker.stop()
      } else {
        appRef.current.ticker.start()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mounted = false
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      if (appRef.current) {
        if (tickerCallbackRef.current) {
          appRef.current.ticker.remove(tickerCallbackRef.current)
        }
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
      shapesRef.current = []
      exitingShapesRef.current.forEach((shape) => shape.container.destroy())
      exitingShapesRef.current = []
      contextCache.clear()
    }
    // Note: themeConfigRef used instead of themeConfig to prevent re-runs on theme change
  }, [hydrated, disableAnimation, initPixi, createShapes, animate])

  // Handle theme changes with crossfade
  useEffect(() => {
    if (!appRef.current || !hydrated) return
    if (theme === prevThemeRef.current) return

    prevThemeRef.current = theme

    if (themeTransitionTimeoutRef.current) {
      clearTimeout(themeTransitionTimeoutRef.current)
    }

    // Mark current shapes as exiting
    shapesRef.current.forEach((shape) => {
      shape.isExiting = true
    })

    // Move to exiting array
    exitingShapesRef.current.push(...shapesRef.current)
    shapesRef.current = []

    // Create new shapes (start invisible, will fade-in)
    createShapes(appRef.current, themeConfig)

    return () => {
      if (themeTransitionTimeoutRef.current) {
        clearTimeout(themeTransitionTimeoutRef.current)
        themeTransitionTimeoutRef.current = null
      }
    }
  }, [theme, themeConfig, hydrated, createShapes])

  // SSR placeholder
  if (!hydrated) {
    return (
      <div
        className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
