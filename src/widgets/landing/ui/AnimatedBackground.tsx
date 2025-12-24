'use client'

/**
 * AnimatedBackground - High-performance WebGL animated network background
 * Feature: 012-landing-page (Performance Optimization)
 *
 * Uses PixiJS (WebGPU/WebGL2) for 10-20x faster rendering compared to DOM-based
 * Framer Motion animations. PixiJS renders all shapes in a single GPU draw call
 * instead of manipulating individual DOM elements.
 *
 * Loading strategy:
 * 1. StaticBackground renders immediately (no canvas)
 * 2. PixiBackground initializes WebGL context after hydration
 * 3. Shapes fade in when browser is idle (requestIdleCallback)
 *
 * Performance benefits:
 * - Single canvas element vs. multiple motion.div
 * - GPU-accelerated rendering via WebGPU (Safari 18+, Chrome 113+)
 * - No React reconciliation overhead for animations
 * - Batch rendering of all shapes
 *
 * FSD Note: Widget-to-widget import (@/widgets/network-background) is intentional.
 */

import { PixiBackground } from '@/widgets/network-background'
import { useNetworkTheme } from '../context/network-theme-context'

export function AnimatedBackground() {
  const { theme } = useNetworkTheme()

  return (
    <PixiBackground
      theme={theme}
      className="fixed inset-0 z-[1]"
    />
  )
}
