import { useEffect, useRef, useState } from 'react'

/**
 * Countdown hook — ticks every 500ms from cooldownUntil to 0.
 */
export function useCooldown(cooldownUntil: number | undefined): number {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!cooldownUntil) {
      setSeconds(0)
      return
    }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
      setSeconds(remaining)
      if (remaining === 0 && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    update()
    intervalRef.current = setInterval(update, 500)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [cooldownUntil])

  return seconds
}
