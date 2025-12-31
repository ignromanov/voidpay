'use client'

/**
 * useInvoiceScale — Dynamic responsive scaling for invoice preview
 *
 * Calculates optimal scale based on viewport size using RAF-throttled updates.
 * Base invoice: 794×1123px (A4 aspect ratio)
 */

import { useEffect, useRef, useState, useCallback } from 'react'

/** Base invoice dimensions (A4 at 96 DPI) */
export const INVOICE_BASE_WIDTH = 794
export const INVOICE_BASE_HEIGHT = 1123

export interface UseInvoiceScaleOptions {
  /**
   * Multiplier for the calculated scale (e.g., 2 for modal view)
   * @default 1
   */
  scaleMultiplier?: number
  /**
   * Minimum allowed scale
   * @default 0.25
   */
  minScale?: number
  /**
   * Maximum allowed scale
   * @default 1
   */
  maxScale?: number
  /**
   * Fraction of viewport height to target
   * @default 0.75
   */
  heightFraction?: number
}

export interface UseInvoiceScaleResult {
  containerRef: React.RefObject<HTMLDivElement | null>
  scale: number
  scaledWidth: number
  scaledHeight: number
}

/**
 * Calculates responsive scale for invoice paper based on container/viewport size.
 * Uses RAF-throttled resize handling for smooth performance.
 */
export function useInvoiceScale(options: UseInvoiceScaleOptions = {}): UseInvoiceScaleResult {
  const { scaleMultiplier = 1, minScale = 0.25, maxScale = 1, heightFraction = 0.75 } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.45)

  const calculateScale = useCallback(
    (width: number, height: number): number => {
      if (width === 0 || height === 0) return minScale

      const paddingX = width < 768 ? 24 : 48
      const availableWidth = Math.max(width - paddingX, 280)
      const targetHeight = Math.max(height * heightFraction, 400)

      const widthRatio = availableWidth / INVOICE_BASE_WIDTH
      const heightRatio = targetHeight / INVOICE_BASE_HEIGHT

      const baseScale = Math.min(widthRatio, heightRatio)
      const multipliedScale = baseScale * scaleMultiplier

      return Math.min(Math.max(multipliedScale, minScale), maxScale)
    },
    [scaleMultiplier, minScale, maxScale, heightFraction]
  )

  useEffect(() => {
    let rafId: number | null = null
    let isScheduled = false
    let lastScale = 0.45

    const updateSize = (width: number, height: number) => {
      if (isScheduled) return
      isScheduled = true
      rafId = requestAnimationFrame(() => {
        const newScale = calculateScale(width, height)
        // Only update if scale actually changed (avoid unnecessary re-renders)
        if (Math.abs(newScale - lastScale) > 0.001) {
          lastScale = newScale
          setScale(newScale)
        }
        isScheduled = false
      })
    }

    // Initial measurement
    updateSize(window.innerWidth, window.innerHeight)

    // Window resize handler (throttled)
    const handleResize = () => {
      updateSize(window.innerWidth, window.innerHeight)
    }

    // Container resize observer (throttled)
    const container = containerRef.current
    let observer: ResizeObserver | null = null
    if (container) {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Use container's actual dimensions, not window height
          updateSize(entry.contentRect.width, entry.contentRect.height)
        }
      })
      observer.observe(container)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      observer?.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [calculateScale])

  return {
    containerRef,
    scale,
    scaledWidth: INVOICE_BASE_WIDTH * scale,
    scaledHeight: INVOICE_BASE_HEIGHT * scale,
  }
}
