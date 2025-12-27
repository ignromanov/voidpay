/**
 * useInvoiceScale - Responsive scaling for invoice paper display
 * Feature: 012-landing-page
 */

import { useEffect, useRef, useState } from 'react'

import { INVOICE_WIDTH, INVOICE_HEIGHT } from '../constants'

interface UseInvoiceScaleResult {
  containerRef: React.RefObject<HTMLDivElement | null>
  scale: number
  scaledHeight: number
}

/**
 * Calculates responsive scale for invoice paper based on viewport size.
 * Uses RAF-throttled resize handling for performance.
 */
export function useInvoiceScale(): UseInvoiceScaleResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.45)

  useEffect(() => {
    let rafId: number | null = null
    let isScheduled = false

    // Calculate scale from dimensions (pure function)
    const calculateScale = (width: number, height: number): number => {
      if (width === 0 || height === 0) return 0.45
      const paddingX = width < 768 ? 24 : 48
      const availableWidth = Math.max(width - paddingX, 280)
      const targetHeight = Math.max(height * 0.75, 400)
      const widthRatio = availableWidth / INVOICE_WIDTH
      const heightRatio = targetHeight / INVOICE_HEIGHT
      const ratio = Math.min(widthRatio, heightRatio)
      return Math.min(Math.max(ratio, 0.25), 0.85)
    }

    // Throttled update using requestAnimationFrame
    const updateSize = (width: number, height: number) => {
      if (isScheduled) return
      isScheduled = true
      rafId = requestAnimationFrame(() => {
        const newScale = calculateScale(width, height)
        setScale(newScale)
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
          updateSize(entry.contentRect.width, window.innerHeight)
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
  }, [])

  return {
    containerRef,
    scale,
    scaledHeight: INVOICE_HEIGHT * scale,
  }
}
