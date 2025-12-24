'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Application, Graphics, GraphicsContext, Ticker, BlurFilter } from 'pixi.js'

import { cn, useHydrated } from '@/shared/lib'
import { NETWORK_THEMES, type NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import { useReducedMotion } from '@/shared/ui/hooks/use-reduced-motion'
import type { ShapeType } from '@/shared/ui/constants/brand-tokens'

// ============================================================================
// Types
// ============================================================================

type ShapeZone = 'left' | 'right'

interface ShapeData {
  type: ShapeType
  color: string
  zone: ShapeZone
  sizeVh: number
  topPercent: number
  duration: number
  delay: number
  hideOnMobile?: boolean
}

interface AnimatedShape {
  container: Graphics
  data: ShapeData
  phase: number
  breathingPhase: number
  startOffset: number
  amplitude: number
  fadeInProgress: number // 0 to 1 for initial fade-in
  fadeInComplete: boolean
}

export interface PixiBackgroundProps {
  theme?: NetworkTheme
  className?: string
}

// ============================================================================
// Aspect Ratios (from original)
// ============================================================================

const SHAPE_ASPECT_RATIOS: Record<ShapeType, number> = {
  rhombus: 1,                  // Ethereum: simple diamond in 100x100 viewBox
  triangle: 1.0,               // Arbitrum: square hexagon badge
  hexagon: 178 / 161,          // Polygon: exact viewBox ratio (≈1.106)
  circle: 1,                   // Optimism: perfect circle
  blob: 1.1,                   // VoidPay: slightly wide blob
}

/**
 * SVG viewBox dimensions for each shape type (width, height)
 * Used for calculating scale factor when rendering as Graphics
 */
const SVG_VIEWBOX_SIZES: Record<ShapeType, { width: number; height: number }> = {
  rhombus: { width: 100, height: 100 },         // Ethereum: simple diamond
  triangle: { width: 2500, height: 2500 },       // Arbitrum
  hexagon: { width: 178, height: 161 },          // Polygon
  circle: { width: 500, height: 500 },           // Optimism
  blob: { width: 200, height: 200 },             // VoidPay
}

// ============================================================================
// SVG Generators (matching original logos)
// ============================================================================

function generateEthereumSvg(color: string): string {
  // Diamond shape matching original CSS clip-path: polygon(50% 0%, 85% 45%, 50% 100%, 15% 45%)
  // Simple 4-point diamond that blurs beautifully (not the complex multi-polygon ETH logo)
  return `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="${color}" points="50,0 85,45 50,100 15,45"/>
  </svg>`
}

function generateArbitrumSvg(color: string): string {
  return `<svg viewBox="0 0 2500 2500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" fill-opacity="1" d="M226,760v980c0,63,33,120,88,152l849,490c54,31,121,31,175,0l849-490c54-31,88-89,88-152V760c0-63-33-120-88-152l-849-490c-54-31-121-31-175,0L314,608c-54,31-87,89-87,152H226z"/>
    <path fill="${color}" fill-opacity="0.7" d="M1435,1440l-121,332c-3,9-3,19,0,29l208,571l241-139l-289-793C1467,1422,1442,1422,1435,1440z"/>
    <path fill="${color}" fill-opacity="0.7" d="M1678,882c-7-18-32-18-39,0l-121,332c-3,9-3,19,0,29l341,935l241-139L1678,883V882z"/>
    <polygon fill="${color}" fill-opacity="0.5" points="642,2179 727,1947 897,2088 738,2234"/>
    <path fill="white" fill-opacity="0.6" d="M1172,644H939c-17,0-33,11-39,27L401,2039l241,139l550-1507c5-14-5-28-19-28L1172,644z"/>
    <path fill="white" fill-opacity="0.6" d="M1580,644h-233c-17,0-33,11-39,27L738,2233l241,139l620-1701c5-14-5-28-19-28V644z"/>
  </svg>`
}

function generatePolygonSvg(color: string): string {
  return `<svg viewBox="0 0 178 161" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" fill-opacity="1" d="M66.8,54.7l-16.7-9.7L0,74.1v58l50.1,29l50.1-29V41.9L128,25.8l27.8,16.1v32.2L128,90.2l-16.7-9.7v25.8l16.7,9.7l50.1-29V29L128,0L77.9,29v90.2l-27.8,16.1l-27.8-16.1V86.9l27.8-16.1l16.7,9.7V54.7z"/>
  </svg>`
}

function generateOptimismSvg(color: string): string {
  return `<svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="250" cy="250" r="250" fill="${color}" fill-opacity="1"/>
  </svg>`
}

function generateVoidPaySvg(color: string): string {
  return `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" fill-opacity="1" d="M100,20 C140,20 170,40 180,80 C190,120 180,160 140,180 C100,200 50,190 30,150 C10,110 20,60 60,35 C80,22 90,20 100,20Z"/>
    <ellipse cx="100" cy="100" rx="35" ry="40" fill="black" fill-opacity="0.4"/>
  </svg>`
}

const SVG_GENERATORS: Record<ShapeType, (color: string) => string> = {
  rhombus: generateEthereumSvg,
  triangle: generateArbitrumSvg,
  hexagon: generatePolygonSvg,
  circle: generateOptimismSvg,
  blob: generateVoidPaySvg,
}

// ============================================================================
// Shape Generation (matches original layout)
// ============================================================================

function generateShapes(themeConfig: (typeof NETWORK_THEMES)[NetworkTheme]): ShapeData[] {
  return [
    // Primary: Large shape top-left
    {
      type: themeConfig.shape,
      color: themeConfig.primary,
      zone: 'left' as ShapeZone,
      sizeVh: 0.5,
      topPercent: 8,
      duration: 20,
      delay: 0,
    },
    // Secondary: Large shape right side (hidden on mobile)
    {
      type: themeConfig.shape,
      color: themeConfig.secondary,
      zone: 'right' as ShapeZone,
      sizeVh: 0.6,
      topPercent: 20,
      duration: 25,
      delay: 2,
      hideOnMobile: true,
    },
    // Accent: Small shape bottom-left
    {
      type: themeConfig.shape,
      color: themeConfig.primary,
      zone: 'left' as ShapeZone,
      sizeVh: 0.25,
      topPercent: 65,
      duration: 15,
      delay: 4,
    },
  ]
}

// ============================================================================
// Deferred Animation Hook
// ============================================================================

function useDeferredAnimation(): boolean {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(() => setShouldAnimate(true), {
        timeout: 3000,
      })
      return () => cancelIdleCallback(idleId)
    } else {
      const timeoutId = setTimeout(() => setShouldAnimate(true), 2000)
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
  // Cache GraphicsContext per shape type + color (parsed once, reused many times)
  const contextCacheRef = useRef<Map<string, GraphicsContext>>(new Map())

  const prefersReducedMotion = useReducedMotion()
  const hydrated = useHydrated()
  const shouldAnimate = useDeferredAnimation()
  const themeConfig = NETWORK_THEMES[theme]

  const disableAnimation = prefersReducedMotion || !shouldAnimate

  // Initialize PixiJS Application
  const initPixi = useCallback(async () => {
    if (!containerRef.current || appRef.current) return

    const app = new Application()

    await app.init({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
      preference: 'webgl',
    })

    app.canvas.style.position = 'absolute'
    app.canvas.style.top = '0'
    app.canvas.style.left = '0'
    app.canvas.style.width = '100%'
    app.canvas.style.height = '100%'

    containerRef.current.appendChild(app.canvas)
    appRef.current = app

    return app
  }, [])

  /**
   * Get or create a cached GraphicsContext for the given SVG
   * Per PixiJS 8.x docs: GraphicsContext.svg() parses SVG once,
   * then Graphics(context) reuses it without re-parsing
   */
  const getOrCreateContext = useCallback((type: ShapeType, color: string): GraphicsContext => {
    const cacheKey = `${type}-${color}`

    const cached = contextCacheRef.current.get(cacheKey)
    if (cached) return cached

    // Generate SVG string and parse into GraphicsContext (parsed once!)
    const svgGenerator = SVG_GENERATORS[type]
    const svgString = svgGenerator(color)
    const context = new GraphicsContext().svg(svgString)

    contextCacheRef.current.set(cacheKey, context)
    return context
  }, [])

  // Create and position shapes using Graphics.svg() per PixiJS 8.x docs
  const createShapes = useCallback((app: Application, themeConfig: (typeof NETWORK_THEMES)[NetworkTheme]) => {
    // Clear existing shapes (but keep cached contexts for reuse!)
    shapesRef.current.forEach(shape => {
      shape.container.destroy()
    })
    shapesRef.current = []
    app.stage.removeChildren()

    const shapesData = generateShapes(themeConfig)
    const isMobile = window.innerWidth < 768
    const vw = window.innerWidth
    const vh = window.innerHeight

    for (const data of shapesData) {
      // Skip mobile-hidden shapes
      if (data.hideOnMobile && isMobile) continue

      // Calculate target size with aspect ratio (matching original)
      const aspectRatio = SHAPE_ASPECT_RATIOS[data.type]
      const baseSize = Math.min(data.sizeVh * vh, vw * 1.5)
      const targetWidth = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio
      const targetHeight = aspectRatio <= 1 ? baseSize : baseSize / aspectRatio

      // Get cached GraphicsContext (SVG parsed once, reused!)
      const context = getOrCreateContext(data.type, data.color)

      // Create Graphics from cached context
      const graphics = new Graphics(context)

      // Scale to target size (Graphics uses intrinsic SVG viewBox dimensions)
      const viewBox = SVG_VIEWBOX_SIZES[data.type]
      const scaleX = targetWidth / viewBox.width
      const scaleY = targetHeight / viewBox.height
      graphics.scale.set(scaleX, scaleY)

      // Apply blur filter
      graphics.filters = [new BlurFilter({ strength: 12, quality: 4 })]

      // Calculate animation parameters (matching original exactly)
      const isSmall = data.sizeVh < 0.3
      const amplitudeScale = 1 - data.sizeVh * 0.3
      const baseAmplitude = 12
      const amplitude = isSmall ? 24 : baseAmplitude * amplitudeScale

      // Starting position (matching original)
      const baseStart = data.zone === 'left' ? (isSmall ? 4 : -4) : -8
      const startOffset = (baseStart / 100) * vw

      // Position shape
      const yPos = (data.topPercent / 100) * vh

      if (data.zone === 'left') {
        graphics.x = startOffset
      } else {
        graphics.x = vw - targetWidth + startOffset
      }
      graphics.y = yPos

      // Start invisible for fade-in animation
      graphics.alpha = 0

      app.stage.addChild(graphics)

      shapesRef.current.push({
        container: graphics,
        data,
        phase: 0, // Start at 0, animation begins after fade-in
        breathingPhase: 0,
        startOffset,
        amplitude: (amplitude / 100) * vw,
        fadeInProgress: 0,
        fadeInComplete: false,
      })
    }
  }, [getOrCreateContext])

  // Animation loop (matching original Framer Motion behavior)
  const animate = useCallback((ticker: Ticker) => {
    const deltaTime = ticker.deltaMS / 1000
    const vw = window.innerWidth

    // Opacity constants (shared across fade-in and breathing)
    const opacityMin = 0.08
    const opacityMax = 0.25
    const opacityRange = opacityMax - opacityMin

    shapesRef.current.forEach((shape) => {
      const { container, data, amplitude } = shape

      // Fade-in animation (matches original: 1.5s duration, delay * 0.3)
      // IMPORTANT: Fade to opacityMin, not 1, to avoid flash when breathing starts
      if (!shape.fadeInComplete) {
        const fadeInDuration = 1.5
        const fadeInDelay = data.delay * 0.3

        shape.fadeInProgress += deltaTime

        if (shape.fadeInProgress >= fadeInDelay) {
          const fadeProgress = Math.min((shape.fadeInProgress - fadeInDelay) / fadeInDuration, 1)
          // easeOut curve, target is opacityMin instead of 1
          const easedProgress = 1 - Math.pow(1 - fadeProgress, 3)
          container.alpha = easedProgress * opacityMin

          if (fadeProgress >= 1) {
            shape.fadeInComplete = true
            // Start breathing from opacityMin (no jump!)
            container.alpha = opacityMin
          }
        }
        return // Don't animate position/breathing until fade-in completes
      }

      // Position animation (matching original: mirror, easeInOut)
      // duration * 1.4 for position
      const posSpeed = (2 * Math.PI) / (data.duration * 1.4)
      shape.phase += deltaTime * posSpeed

      // Use sin for mirror effect (goes start -> end -> start)
      const posProgress = Math.sin(shape.phase)
      const posOffset = shape.startOffset + posProgress * amplitude

      // Apply position based on zone
      if (data.zone === 'left') {
        container.x = posOffset
      } else {
        const aspectRatio = SHAPE_ASPECT_RATIOS[data.type]
        const baseSize = Math.min(data.sizeVh * window.innerHeight, vw * 1.5)
        const width = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio
        container.x = vw - width + posOffset
      }

      // Breathing animation (matching original: custom easing)
      // duration * 1.2 for breathing
      const breathSpeed = (2 * Math.PI) / (data.duration * 1.2)
      shape.breathingPhase += deltaTime * breathSpeed

      // Original uses [opacityMin, opacityMax, opacityMin] cycle
      // We simulate this with sin wave
      // Apply custom easing similar to [0.22, 0.61, 0.36, 1]
      const rawBreath = (Math.sin(shape.breathingPhase) + 1) / 2
      // Smoothstep-like easing
      const breathProgress = rawBreath * rawBreath * (3 - 2 * rawBreath)

      container.alpha = opacityMin + breathProgress * opacityRange
    })
  }, [])

  // Setup and cleanup
  useEffect(() => {
    if (!hydrated) return

    let mounted = true

    const setup = async () => {
      const app = await initPixi()
      if (!app || !mounted) return

      createShapes(app, themeConfig)

      // Setup animation
      if (!disableAnimation) {
        const callback = (ticker: Ticker) => animate(ticker)
        tickerCallbackRef.current = callback
        app.ticker.add(callback)
      } else {
        // Set static positions for reduced motion
        const staticOpacity = (0.08 + 0.25) / 2
        shapesRef.current.forEach((shape) => {
          shape.container.alpha = staticOpacity
          shape.fadeInComplete = true

          // Set to middle position
          const staticPos = (shape.startOffset + shape.amplitude) / 2
          if (shape.data.zone === 'left') {
            shape.container.x = staticPos
          } else {
            const vw = window.innerWidth
            const aspectRatio = SHAPE_ASPECT_RATIOS[shape.data.type]
            const baseSize = Math.min(shape.data.sizeVh * window.innerHeight, vw * 1.5)
            const width = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio
            shape.container.x = vw - width + staticPos
          }
        })
      }
    }

    setup()

    // Handle resize
    const handleResize = () => {
      if (appRef.current) {
        createShapes(appRef.current, themeConfig)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      mounted = false
      window.removeEventListener('resize', handleResize)

      if (appRef.current) {
        if (tickerCallbackRef.current) {
          appRef.current.ticker.remove(tickerCallbackRef.current)
        }
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
      shapesRef.current = []
      // Clear cached GraphicsContext on unmount
      contextCacheRef.current.clear()
    }
  }, [hydrated, themeConfig, disableAnimation, initPixi, createShapes, animate])

  // Handle theme changes
  useEffect(() => {
    if (appRef.current && hydrated) {
      createShapes(appRef.current, themeConfig)
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
