/**
 * useInvoiceScale Hook Tests
 * Tests for responsive invoice scaling logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useInvoiceScale,
  INVOICE_BASE_WIDTH,
  INVOICE_BASE_HEIGHT,
  PRESET_CONFIGS,
} from '../use-invoice-scale'

// Store mock ResizeObserver instance for triggering resize events
let resizeCallback: ResizeObserverCallback | null = null
let observedElements: Set<Element> = new Set()

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback
  }

  observe(element: Element) {
    observedElements.add(element)
  }

  unobserve(element: Element) {
    observedElements.delete(element)
  }

  disconnect() {
    observedElements.clear()
  }
}

beforeEach(() => {
  // Reset state
  resizeCallback = null
  observedElements = new Set()

  // Mock ResizeObserver
  vi.stubGlobal('ResizeObserver', MockResizeObserver)

  // Mock requestAnimationFrame to execute immediately
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })

  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useInvoiceScale', () => {
  describe('Constants', () => {
    it('exports correct base dimensions', () => {
      expect(INVOICE_BASE_WIDTH).toBe(794)
      expect(INVOICE_BASE_HEIGHT).toBe(1123)
    })

    it('exports preset configs', () => {
      expect(PRESET_CONFIGS.demo).toBeDefined()
      expect(PRESET_CONFIGS.editor).toBeDefined()
      expect(PRESET_CONFIGS.modal).toBeDefined()
    })
  })

  describe('Preset configurations', () => {
    it('demo preset has fit scaling', () => {
      expect(PRESET_CONFIGS.demo.scaleBy).toBe('fit')
      expect(PRESET_CONFIGS.demo.maxScale).toBe(1)
    })

    it('editor preset has fit scaling with lower max', () => {
      expect(PRESET_CONFIGS.editor.scaleBy).toBe('fit')
      expect(PRESET_CONFIGS.editor.maxScale).toBe(0.85)
    })

    it('modal preset has width-only scaling', () => {
      expect(PRESET_CONFIGS.modal.scaleBy).toBe('width')
      expect(PRESET_CONFIGS.modal.minScale).toBe(0.8)
    })
  })

  describe('Initial state', () => {
    it('returns initial scale of 0.45', () => {
      const { result } = renderHook(() => useInvoiceScale())

      expect(result.current.scale).toBe(0.45)
    })

    it('returns scaled dimensions based on initial scale', () => {
      const { result } = renderHook(() => useInvoiceScale())

      expect(result.current.scaledWidth).toBe(INVOICE_BASE_WIDTH * 0.45)
      expect(result.current.scaledHeight).toBe(INVOICE_BASE_HEIGHT * 0.45)
    })

    it('returns setContainerRef callback', () => {
      const { result } = renderHook(() => useInvoiceScale())

      expect(typeof result.current.setContainerRef).toBe('function')
    })
  })

  describe('Container ref handling', () => {
    it('accepts null container', () => {
      const { result } = renderHook(() => useInvoiceScale())

      act(() => {
        result.current.setContainerRef(null)
      })

      // Should not throw
      expect(result.current.scale).toBe(0.45)
    })

    it('attaches ResizeObserver when container is set', () => {
      const container = document.createElement('div')
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 800, height: 600 }),
      })

      const { result } = renderHook(() => useInvoiceScale())

      act(() => {
        result.current.setContainerRef(container)
      })

      expect(observedElements.has(container)).toBe(true)
    })
  })

  describe('Scale calculation', () => {
    it('calculates scale based on container width', () => {
      const container = document.createElement('div')
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 800, height: 1200 }),
      })

      const { result } = renderHook(() => useInvoiceScale({ scaleBy: 'width', maxScale: 1 }))

      act(() => {
        result.current.setContainerRef(container)
      })

      // Scale should be calculated (800 / 794 ≈ 1.007, capped at 1)
      expect(result.current.scale).toBeGreaterThan(0)
      expect(result.current.scale).toBeLessThanOrEqual(1)
    })

    it('respects maxScale limit', () => {
      const container = document.createElement('div')
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 2000, height: 2000 }), // Very large container
      })

      const { result } = renderHook(() => useInvoiceScale({ maxScale: 0.5 }))

      act(() => {
        result.current.setContainerRef(container)
      })

      expect(result.current.scale).toBeLessThanOrEqual(0.5)
    })

    it('respects minScale limit', () => {
      const container = document.createElement('div')
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 100, height: 100 }), // Very small container
      })

      const { result } = renderHook(() => useInvoiceScale({ minScale: 0.3 }))

      act(() => {
        result.current.setContainerRef(container)
      })

      // Scale should be at least minScale (0.3)
      expect(result.current.scale).toBeGreaterThanOrEqual(0.3)
    })
  })

  describe('Preset usage', () => {
    it('uses preset config when provided', () => {
      const container = document.createElement('div')
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 800, height: 600 }),
      })

      const { result } = renderHook(() => useInvoiceScale({ preset: 'demo' }))

      act(() => {
        result.current.setContainerRef(container)
      })

      // Demo preset should be applied
      expect(result.current.scale).toBeDefined()
    })

    it('editor preset limits scale', () => {
      const container = document.createElement('div')
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 2000, height: 2000 }),
      })

      const { result } = renderHook(() => useInvoiceScale({ preset: 'editor' }))

      act(() => {
        result.current.setContainerRef(container)
      })

      // Editor preset has maxScale of 0.85
      expect(result.current.scale).toBeLessThanOrEqual(0.85)
    })
  })

  describe('Cleanup', () => {
    it('disconnects ResizeObserver on unmount', () => {
      const container = document.createElement('div')
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 800, height: 600 }),
      })

      const { result, unmount } = renderHook(() => useInvoiceScale())

      act(() => {
        result.current.setContainerRef(container)
      })

      unmount()

      expect(observedElements.size).toBe(0)
    })
  })

  describe('Scaled dimensions', () => {
    it('updates scaled dimensions when scale changes', () => {
      const container = document.createElement('div')
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 600, height: 800 }),
      })

      const { result } = renderHook(() => useInvoiceScale())

      act(() => {
        result.current.setContainerRef(container)
      })

      // Check that dimensions are calculated correctly
      expect(result.current.scaledWidth).toBe(INVOICE_BASE_WIDTH * result.current.scale)
      expect(result.current.scaledHeight).toBe(INVOICE_BASE_HEIGHT * result.current.scale)
    })
  })
})
