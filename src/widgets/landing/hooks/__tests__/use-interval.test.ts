/**
 * useInterval Hook Tests
 * Tests for periodic callback execution
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInterval } from '../use-interval'

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls callback at specified interval', () => {
    const callback = vi.fn()

    renderHook(() => useInterval(callback, 1000))

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('does not call callback when delay is null', () => {
    const callback = vi.fn()

    renderHook(() => useInterval(callback, null))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('clears interval on unmount', () => {
    const callback = vi.fn()

    const { unmount } = renderHook(() => useInterval(callback, 1000))

    act(() => {
      vi.advanceTimersByTime(500)
    })

    unmount()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('updates callback without resetting interval', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const { rerender } = renderHook(({ cb }) => useInterval(cb, 1000), {
      initialProps: { cb: callback1 },
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    rerender({ cb: callback2 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledTimes(1)
  })

  it('resets interval when delay changes', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 as number | null },
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    rerender({ delay: 2000 })

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('pauses when delay changes to null', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 as number | null },
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    rerender({ delay: null })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('resumes when delay changes from null to number', () => {
    const callback = vi.fn()

    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: null as number | null },
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(callback).not.toHaveBeenCalled()

    rerender({ delay: 500 })

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
