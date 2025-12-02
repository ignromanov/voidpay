'use client'

/**
 * Interval hook for periodic callbacks
 * Feature: 012-landing-page
 */

import { useEffect, useRef } from 'react'

/**
 * Hook for running a callback at specified intervals
 * @param callback - Function to call on each interval
 * @param delay - Interval in milliseconds, null to pause
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
