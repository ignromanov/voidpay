/**
 * useDemoRotation Hook Tests
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo)
 */

import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { useDemoRotation } from '../use-demo-rotation'

describe('useDemoRotation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('T030-test: Hook state management', () => {
    it('should initialize with activeIndex 0', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3 })
      )
      
      expect(result.current.activeIndex).toBe(0)
    })

    it('should start as not paused by default', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3 })
      )
      
      expect(result.current.isPaused).toBe(false)
    })

    it('should start paused when autoStart is false', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, autoStart: false })
      )
      
      expect(result.current.isPaused).toBe(true)
    })
  })

  describe('next()', () => {
    it('should increment activeIndex', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, autoStart: false })
      )
      
      act(() => {
        result.current.next()
      })
      
      expect(result.current.activeIndex).toBe(1)
    })

    it('should wrap around to 0 when at last item', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, autoStart: false })
      )
      
      act(() => {
        result.current.next()
        result.current.next()
        result.current.next()
      })
      
      expect(result.current.activeIndex).toBe(0)
    })
  })

  describe('prev()', () => {
    it('should decrement activeIndex', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, autoStart: false })
      )
      
      act(() => {
        result.current.next()
        result.current.prev()
      })
      
      expect(result.current.activeIndex).toBe(0)
    })

    it('should wrap around to last item when at 0', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, autoStart: false })
      )
      
      act(() => {
        result.current.prev()
      })
      
      expect(result.current.activeIndex).toBe(2)
    })
  })

  describe('goTo()', () => {
    it('should set activeIndex to specified value', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, autoStart: false })
      )
      
      act(() => {
        result.current.goTo(2)
      })
      
      expect(result.current.activeIndex).toBe(2)
    })

    it('should ignore invalid indices (negative)', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, autoStart: false })
      )
      
      act(() => {
        result.current.goTo(-1)
      })
      
      expect(result.current.activeIndex).toBe(0)
    })

    it('should ignore invalid indices (out of bounds)', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, autoStart: false })
      )
      
      act(() => {
        result.current.goTo(10)
      })
      
      expect(result.current.activeIndex).toBe(0)
    })
  })

  describe('pause() and resume()', () => {
    it('should pause rotation', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3 })
      )
      
      act(() => {
        result.current.pause()
      })
      
      expect(result.current.isPaused).toBe(true)
    })

    it('should resume rotation', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, autoStart: false })
      )
      
      act(() => {
        result.current.resume()
      })
      
      expect(result.current.isPaused).toBe(false)
    })
  })

  describe('Auto-rotation', () => {
    it('should auto-rotate at specified interval', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, interval: 1000 })
      )
      
      expect(result.current.activeIndex).toBe(0)
      
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      expect(result.current.activeIndex).toBe(1)
    })

    it('should not auto-rotate when paused', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, interval: 1000, autoStart: false })
      )
      
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      
      expect(result.current.activeIndex).toBe(0)
    })

    it('should resume auto-rotation after resume()', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3, interval: 1000 })
      )

      // Pause immediately
      act(() => {
        result.current.pause()
      })

      // Time passes while paused
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Should still be at 0 since paused
      expect(result.current.activeIndex).toBe(0)

      // Resume
      act(() => {
        result.current.resume()
      })

      // Now advance time after resuming
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.activeIndex).toBe(1)
    })

    it('should use default 10s interval', () => {
      const { result } = renderHook(() =>
        useDemoRotation({ itemCount: 3 })
      )
      
      act(() => {
        vi.advanceTimersByTime(9999)
      })
      
      expect(result.current.activeIndex).toBe(0)
      
      act(() => {
        vi.advanceTimersByTime(1)
      })
      
      expect(result.current.activeIndex).toBe(1)
    })
  })
})
