'use client'

/**
 * AnimatedBackground - Deferred animated network background
 * Feature: 012-landing-page (Performance Optimization)
 *
 * This component wraps NetworkBackground and is loaded via dynamic import
 * to defer Framer Motion from the initial bundle.
 *
 * Loading strategy:
 * 1. StaticBackground renders immediately (no motion)
 * 2. This component loads after initial hydration
 * 3. NetworkBackground fades in over static background
 *
 * FSD Note: Widget-to-widget import (@/widgets/network-background) is intentional.
 * NetworkBackground is NOT exported from shared/ui barrel to prevent Framer Motion
 * bundle inclusion on pages that don't need animations. This is a documented
 * performance optimization - see src/shared/ui/index.ts for details.
 */

import { NetworkBackground } from '@/widgets/network-background'
import { useNetworkTheme } from '../context/network-theme-context'

export function AnimatedBackground() {
  const { theme } = useNetworkTheme()

  return (
    <NetworkBackground
      theme={theme}
      className="fixed inset-0 z-[1] animate-[fadeIn_1s_ease-out]"
    />
  )
}
