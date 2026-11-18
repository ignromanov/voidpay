import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@/shared/lib/test-utils'
import { useCooldown } from '../use-cooldown'

describe('useCooldown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 when cooldownUntil is undefined', () => {
    const { result } = renderHook(() => useCooldown(undefined))
    expect(result.current).toBe(0)
  })

  it('counts down remaining seconds and stops at 0', () => {
    const now = Date.now()
    const { result } = renderHook(() => useCooldown(now + 2500))
    expect(result.current).toBe(3)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toBe(2)

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(result.current).toBe(0)
  })

  it('resets to 0 when cooldownUntil becomes undefined', () => {
    const now = Date.now()
    const { result, rerender } = renderHook(
      ({ until }: { until: number | undefined }) => useCooldown(until),
      { initialProps: { until: (now + 5000) as number | undefined } },
    )
    expect(result.current).toBe(5)

    rerender({ until: undefined })
    expect(result.current).toBe(0)
  })
})
