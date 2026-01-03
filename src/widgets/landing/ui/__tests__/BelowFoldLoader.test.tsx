import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'

import { BelowFoldLoader } from '../BelowFoldLoader'

describe('BelowFoldLoader', () => {
  let observerCallback: IntersectionObserverCallback
  let mockObserve: ReturnType<typeof vi.fn>
  let mockDisconnect: ReturnType<typeof vi.fn>
  let mockUnobserve: ReturnType<typeof vi.fn>
  const originalIntersectionObserver = window.IntersectionObserver

  beforeEach(() => {
    mockObserve = vi.fn()
    mockDisconnect = vi.fn()
    mockUnobserve = vi.fn()

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string
      readonly thresholds: ReadonlyArray<number> = []

      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        observerCallback = callback
        this.rootMargin = options?.rootMargin ?? ''
      }

      observe = mockObserve
      disconnect = mockDisconnect
      unobserve = mockUnobserve
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
    }

    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver
    vi.restoreAllMocks()
  })

  describe('initial rendering', () => {
    it('renders skeleton by default when content is below viewport', () => {
      // Simulate element below viewport
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 2000,
        bottom: 2100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 2000,
        toJSON: () => ({}),
      })

      render(
        <BelowFoldLoader>
          <div data-testid="content">Content</div>
        </BelowFoldLoader>
      )

      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Loading content...')).toBeInTheDocument()
    })

    it('renders custom skeleton when provided', () => {
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 2000,
        bottom: 2100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 2000,
        toJSON: () => ({}),
      })

      render(
        <BelowFoldLoader skeleton={<div data-testid="custom-skeleton">Custom</div>}>
          <div data-testid="content">Content</div>
        </BelowFoldLoader>
      )

      expect(screen.getByTestId('custom-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })
  })

  describe('intersection observer behavior', () => {
    it('renders children when intersection is triggered', async () => {
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 2000,
        bottom: 2100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 2000,
        toJSON: () => ({}),
      })

      render(
        <BelowFoldLoader>
          <div data-testid="content">Content</div>
        </BelowFoldLoader>
      )

      // Trigger intersection
      act(() => {
        observerCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    it('disconnects observer after intersection', async () => {
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 2000,
        bottom: 2100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 2000,
        toJSON: () => ({}),
      })

      render(
        <BelowFoldLoader>
          <div data-testid="content">Content</div>
        </BelowFoldLoader>
      )

      act(() => {
        observerCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      })

      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  describe('already visible content', () => {
    it('immediately shows content if element is already in viewport', () => {
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        bottom: 200,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      })

      render(
        <BelowFoldLoader>
          <div data-testid="content">Content</div>
        </BelowFoldLoader>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })
  })

  describe('default skeleton', () => {
    it('has loading spinner', () => {
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 2000,
        bottom: 2100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 2000,
        toJSON: () => ({}),
      })

      const { container } = render(
        <BelowFoldLoader>
          <div>Content</div>
        </BelowFoldLoader>
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })
})
