'use client'

/**
 * Demo rotation hook for cycling through invoice examples
 * Feature: 012-landing-page
 */

import { useCallback, useState } from 'react'

import { useInterval } from './use-interval'

const DEFAULT_ROTATION_INTERVAL = 10_000 // 10 seconds per spec

export type UseDemoRotationOptions = {
  itemCount: number
  interval?: number
  autoStart?: boolean
}

export type UseDemoRotationReturn = {
  activeIndex: number
  next: () => void
  prev: () => void
  goTo: (index: number) => void
  pause: () => void
  resume: () => void
  isPaused: boolean
}

/**
 * Hook for managing demo invoice rotation state
 */
export function useDemoRotation({
  itemCount,
  interval = DEFAULT_ROTATION_INTERVAL,
  autoStart = true,
}: UseDemoRotationOptions): UseDemoRotationReturn {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(!autoStart)

  const next = useCallback(() => {
    setActiveIndex((current) => (current + 1) % itemCount)
  }, [itemCount])

  const prev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + itemCount) % itemCount)
  }, [itemCount])

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < itemCount) {
        setActiveIndex(index)
      }
    },
    [itemCount]
  )

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  // Auto-rotate when not paused
  useInterval(next, isPaused ? null : interval)

  return {
    activeIndex,
    next,
    prev,
    goTo,
    pause,
    resume,
    isPaused,
  }
}
