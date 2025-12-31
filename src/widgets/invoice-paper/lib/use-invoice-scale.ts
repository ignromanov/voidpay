'use client'

/**
 * useInvoiceScale — Dynamic responsive scaling for invoice preview
 *
 * Calculates optimal scale based on container size using RAF-throttled updates.
 * Base invoice: 794×1123px (A4 aspect ratio)
 */

import { useLayoutEffect, useEffect, useRef, useState, useCallback } from 'react'

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

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
   * Fraction of container height to use for scaling
   * @default 0.95
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
 * Calculates responsive scale for invoice paper based on container size.
 * Uses RAF-throttled resize handling for smooth performance.
 *
 * Note: Container must have explicit dimensions (e.g., minHeight) to avoid
 * circular dependency where container size depends on scale.
 */
export function useInvoiceScale(options: UseInvoiceScaleOptions = {}): UseInvoiceScaleResult {
  const { scaleMultiplier = 1, minScale = 0.25, maxScale = 1, heightFraction = 0.95 } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.45)

  // Refs to avoid stale closures in RAF callback
  const isScheduledRef = useRef(false)
  const lastScaleRef = useRef(0.45)

  const calculateScale = useCallback(
    (width: number, height: number): number => {
      if (width === 0 || height === 0) return minScale

      const paddingX = width < 768 ? 16 : 24
      const availableWidth = Math.max(width - paddingX, 280)
      const targetHeight = Math.max(height * heightFraction, 300)

      const widthRatio = availableWidth / INVOICE_BASE_WIDTH
      const heightRatio = targetHeight / INVOICE_BASE_HEIGHT

      const baseScale = Math.min(widthRatio, heightRatio)
      const multipliedScale = baseScale * scaleMultiplier

      return Math.min(Math.max(multipliedScale, minScale), maxScale)
    },
    [scaleMultiplier, minScale, maxScale, heightFraction]
  )

  useIsomorphicLayoutEffect(() => {
    let rafId: number | null = null

    const updateSize = (width: number, height: number) => {
      if (isScheduledRef.current) return
      isScheduledRef.current = true
      rafId = requestAnimationFrame(() => {
        const newScale = calculateScale(width, height)
        // Only update if scale actually changed (avoid unnecessary re-renders)
        if (Math.abs(newScale - lastScaleRef.current) > 0.001) {
          lastScaleRef.current = newScale
          setScale(newScale)
        }
        isScheduledRef.current = false
      })
    }

    // Initial measurement using the container itself
    const container = containerRef.current
    if (container) {
      const rect = container.getBoundingClientRect()
      updateSize(rect.width, rect.height)
    } else {
      // Fallback to viewport if container not mounted
      updateSize(window.innerWidth, window.innerHeight)
    }

    // Observe container for size changes
    let observer: ResizeObserver | null = null
    if (container) {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          updateSize(entry.contentRect.width, entry.contentRect.height)
        }
      })
      observer.observe(container)
    }

    // Window resize as fallback
    const handleResize = () => {
      const container = containerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        updateSize(rect.width, rect.height)
      }
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
