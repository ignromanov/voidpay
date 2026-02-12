'use client'

/**
 * useInvoiceScale — Dynamic responsive scaling for invoice preview
 *
 * Calculates optimal scale based on container size using ResizeObserver.
 * Base invoice: 794×1123px (A4 aspect ratio)
 *
 * Uses callback ref pattern to reliably attach ResizeObserver even for
 * Portal-mounted components (e.g., Radix Dialog with animations).
 *
 * @example
 * const { setContainerRef, scale, scaledWidth, scaledHeight } = useInvoiceScale({ preset: 'modal' })
 * return <div ref={setContainerRef}>...</div>
 */

import { useEffect, useState, useCallback, useRef } from 'react'

/** Base invoice dimensions (A4 at 96 DPI) */
export const INVOICE_BASE_WIDTH = 794
export const INVOICE_BASE_HEIGHT = 1123

/** Scale calculation constants */
const MIN_SCALE = 0.25
const HEIGHT_FRACTION = 0.95
const DEFAULT_INITIAL_SCALE = 0.45

/**
 * Preset configurations for common use cases
 *
 * - demo: Landing page demo section (fit both dimensions, 75vh height)
 * - editor: Create page editor (fit, slightly smaller max, full parent height)
 * - modal: Fullscreen modal (width-only, allow scroll, full parent height)
 */
export type ScalePreset = 'demo' | 'editor' | 'pay' | 'modal'

interface PresetConfig {
  maxScale: number
  minScale?: number
  /**
   * How to calculate scale:
   * - 'fit': fit both width and height (no scroll)
   * - 'width': scale by container width only (allow vertical scroll)
   * - 'viewport': scale by viewport width (container-independent, for w-fit parents)
   */
  scaleBy: 'fit' | 'width' | 'viewport'
  /** Scale before container is measured — drives the "grow in" animation */
  initialScale: number
  /** CSS class for container height */
  containerHeightClass: string
}

export const PRESET_CONFIGS: Record<ScalePreset, PresetConfig> = {
  // Demo: landing page, typical final ~0.55 → initial 0.45 (~82%)
  demo: { maxScale: 1, initialScale: 0.45, scaleBy: 'fit', containerHeightClass: 'min-h-[75vh]' },
  // Editor: create page, typical final ~0.65 → initial 0.55 (~85%)
  editor: { maxScale: 1.5, initialScale: 0.55, scaleBy: 'fit', containerHeightClass: 'h-full' },
  // Pay page: typical final ~0.70 → initial 0.58 (~83%)
  pay: { maxScale: 1.5, initialScale: 0.58, scaleBy: 'fit', containerHeightClass: 'h-full' },
  // Modal: always full-size invoice (scale=1), scroll when screen is smaller
  // Viewport-based scaleBy retained for w-fit parent compatibility
  modal: {
    maxScale: 1,
    minScale: 1,
    initialScale: 1,
    scaleBy: 'viewport',
    containerHeightClass: 'h-auto',
  },
}

export interface UseInvoiceScaleOptions {
  /**
   * Preset configuration for common use cases (recommended).
   * When provided, maxScale and scaleBy are ignored.
   */
  preset?: ScalePreset

  /**
   * Maximum allowed scale (default: 1)
   * Ignored when preset is provided.
   */
  maxScale?: number

  /**
   * Minimum allowed scale (default: 0.25)
   * Useful for ensuring readability on small screens.
   * Ignored when preset is provided.
   */
  minScale?: number

  /**
   * How to calculate scale:
   * - 'fit': fit both width and height (default)
   * - 'width': scale by width only, allow vertical scroll
   * - 'viewport': scale by viewport width (container-independent)
   *
   * Ignored when preset is provided.
   */
  scaleBy?: 'fit' | 'width' | 'viewport'
}

export interface UseInvoiceScaleResult {
  /** Callback ref — attach to container div */
  setContainerRef: (node: HTMLDivElement | null) => void
  /** Current scale factor */
  scale: number
  /** Invoice width after scaling */
  scaledWidth: number
  /** Invoice height after scaling */
  scaledHeight: number
}

/**
 * Calculates responsive scale for invoice paper based on container size.
 *
 * Uses callback ref pattern to guarantee ResizeObserver attachment even for:
 * - Portal-mounted components (Radix Dialog)
 * - Components with mount animations (zoom-in, fade-in)
 * - Late-mounting children
 */
export function useInvoiceScale(options: UseInvoiceScaleOptions = {}): UseInvoiceScaleResult {
  // Resolve preset or use individual options
  const config = options.preset ? PRESET_CONFIGS[options.preset] : options
  const { maxScale = 1, minScale = MIN_SCALE, scaleBy = 'fit' } = config
  const startScale = 'initialScale' in config ? config.initialScale : DEFAULT_INITIAL_SCALE

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(startScale)

  // Ref to track last scale for avoiding unnecessary updates
  const lastScaleRef = useRef(startScale)

  // Memoized scale calculation
  const calculateScale = useCallback(
    (containerWidth: number, containerHeight: number): number => {
      let effectiveWidth: number

      if (scaleBy === 'viewport') {
        // Viewport mode: use window.innerWidth with modal layout constraints
        // Coupled to InvoicePreviewModal.tsx CSS:
        //   Mobile (< 640px): w-screen, p-4 → 32px total horizontal padding
        //   sm+ (≥ 640px): sm:max-w-[95vw], sm:p-6 → 48px total horizontal padding
        const vw = typeof window !== 'undefined' ? window.innerWidth : containerWidth
        const isSmall = vw < 640
        const maxWidth = isSmall ? vw : vw * 0.95
        const totalPadding = isSmall ? 32 : 48
        effectiveWidth = Math.max(maxWidth - totalPadding, 280)
      } else {
        // Container-based modes: contentRect already excludes CSS padding
        // paddingX = additional safety margin inside the content area
        const paddingX = containerWidth < 768 ? 16 : 24
        effectiveWidth = Math.max(containerWidth - paddingX, 280)
      }

      if (effectiveWidth === 0 || containerHeight === 0) return minScale

      const targetHeight = Math.max(containerHeight * HEIGHT_FRACTION, 300)

      const widthRatio = effectiveWidth / INVOICE_BASE_WIDTH
      const heightRatio = targetHeight / INVOICE_BASE_HEIGHT

      // 'viewport'/'width' mode: scale by width only (allow vertical scroll)
      // 'fit' mode: fit both dimensions (no scroll needed)
      const baseScale = scaleBy === 'fit' ? Math.min(widthRatio, heightRatio) : widthRatio

      return Math.min(Math.max(baseScale, minScale), maxScale)
    },
    [maxScale, minScale, scaleBy]
  )

  // Callback ref — called when DOM node mounts/unmounts
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node)
  }, [])

  // Effect runs when container becomes available (after Portal mount, after animation)
  useEffect(() => {
    if (!container) return

    let rafId: number | null = null
    let retryCount = 0
    const MAX_RETRIES = 20 // ~320ms at 60fps, enough for animations

    const updateScale = (width: number, height: number) => {
      // Cancel any pending RAF
      if (rafId !== null) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        const newScale = calculateScale(width, height)
        // Only update if scale actually changed (avoid unnecessary re-renders)
        if (Math.abs(newScale - lastScaleRef.current) > 0.001) {
          lastScaleRef.current = newScale
          setScale(newScale)
        }
      })
    }

    // Initial measurement with retry for animations/Portal mounting
    const attemptMeasure = () => {
      const rect = container.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        updateScale(rect.width, rect.height)
        return true
      }
      // Retry if dimensions not ready (animation in progress)
      if (retryCount < MAX_RETRIES) {
        retryCount++
        rafId = requestAnimationFrame(attemptMeasure)
        return false
      }
      return false
    }
    attemptMeasure()

    // ResizeObserver for ongoing size changes
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          updateScale(width, height)
        }
      }
    })
    observer.observe(container)

    // Window resize as additional fallback
    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        updateScale(rect.width, rect.height)
      }
    }
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [container, calculateScale])

  return {
    setContainerRef,
    scale,
    scaledWidth: INVOICE_BASE_WIDTH * scale,
    scaledHeight: INVOICE_BASE_HEIGHT * scale,
  }
}
