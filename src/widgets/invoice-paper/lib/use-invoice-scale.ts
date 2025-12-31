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
const INITIAL_SCALE = 0.45

/**
 * Preset configurations for common use cases
 *
 * - demo: Landing page demo section (fit both dimensions, 75vh height)
 * - editor: Create page editor (fit, slightly smaller max, full parent height)
 * - modal: Fullscreen modal (width-only, allow scroll, full parent height)
 */
export type ScalePreset = 'demo' | 'editor' | 'modal'

interface PresetConfig {
  maxScale: number
  scaleBy: 'fit' | 'width'
  /** CSS class for container height */
  containerHeightClass: string
}

export const PRESET_CONFIGS: Record<ScalePreset, PresetConfig> = {
  demo: { maxScale: 1, scaleBy: 'fit', containerHeightClass: 'min-h-[75vh]' },
  editor: { maxScale: 0.85, scaleBy: 'fit', containerHeightClass: 'h-full' },
  modal: { maxScale: 1, scaleBy: 'width', containerHeightClass: 'h-full' },
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
   * How to calculate scale:
   * - 'fit': fit both width and height (default)
   * - 'width': scale by width only, allow vertical scroll
   *
   * Ignored when preset is provided.
   */
  scaleBy?: 'fit' | 'width'
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
  const { maxScale = 1, scaleBy = 'fit' } = config

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(INITIAL_SCALE)

  // Ref to track last scale for avoiding unnecessary updates
  const lastScaleRef = useRef(INITIAL_SCALE)

  // Memoized scale calculation
  const calculateScale = useCallback(
    (width: number, height: number): number => {
      if (width === 0 || height === 0) return MIN_SCALE

      const paddingX = width < 768 ? 16 : 24
      const availableWidth = Math.max(width - paddingX, 280)
      const targetHeight = Math.max(height * HEIGHT_FRACTION, 300)

      const widthRatio = availableWidth / INVOICE_BASE_WIDTH
      const heightRatio = targetHeight / INVOICE_BASE_HEIGHT

      // 'width' mode: scale by width only (allow vertical scroll)
      // 'fit' mode: fit both dimensions (no scroll needed)
      const baseScale = scaleBy === 'width' ? widthRatio : Math.min(widthRatio, heightRatio)

      return Math.min(Math.max(baseScale, MIN_SCALE), maxScale)
    },
    [maxScale, scaleBy]
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
    window.addEventListener('resize', handleResize)

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
