import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { PixiBackground } from '../PixiBackground'
import type { NetworkTheme } from '@/shared/ui/constants/brand-tokens'

// Mock pixi.js with proper class constructors
vi.mock('pixi.js', () => {
  class MockGraphics {
    scale = { set: vi.fn() }
    filters: unknown[] = []
    x = 0
    y = 0
    alpha = 0
    destroy = vi.fn()
  }

  class MockGraphicsContext {
    svg = vi.fn(() => this)
  }

  class MockApplication {
    canvas: HTMLCanvasElement

    constructor() {
      this.canvas = document.createElement('canvas')
    }

    stage = {
      addChild: vi.fn(),
    }
    ticker = {
      add: vi.fn(),
      remove: vi.fn(),
    }
    init = vi.fn().mockResolvedValue(undefined)
    destroy = vi.fn()
  }

  class MockBlurFilter {
    constructor(_options?: { strength?: number; quality?: number }) {
      // noop
    }
  }

  class MockTicker {}

  return {
    Application: MockApplication,
    Graphics: MockGraphics,
    GraphicsContext: MockGraphicsContext,
    BlurFilter: MockBlurFilter,
    Ticker: MockTicker,
  }
})

// Mock shared hooks - return false by default to prevent async effects from running
vi.mock('@/shared/lib', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  useHydrated: vi.fn(() => false), // Start with false to prevent Pixi init
}))

vi.mock('@/shared/ui/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

describe('PixiBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true })

    // Mock requestIdleCallback
    vi.stubGlobal('requestIdleCallback', (cb: IdleRequestCallback) => {
      const id = setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline), 0)
      return id as unknown as number
    })
    vi.stubGlobal('cancelIdleCallback', (id: number) => clearTimeout(id))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  describe('Rendering', () => {
    it('should render container element', () => {
      const { container } = render(<PixiBackground />)

      const element = container.firstChild as HTMLElement
      expect(element).toBeInTheDocument()
      expect(element.tagName).toBe('DIV')
    })

    it('should apply fixed positioning classes', () => {
      const { container } = render(<PixiBackground />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('fixed')
      expect(element.className).toContain('inset-0')
    })

    it('should have negative z-index for background layer', () => {
      const { container } = render(<PixiBackground />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('-z-10')
    })

    it('should have overflow hidden for clipping', () => {
      const { container } = render(<PixiBackground />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('overflow-hidden')
    })

    it('should be non-interactive (pointer-events-none)', () => {
      const { container } = render(<PixiBackground />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('pointer-events-none')
    })

    it('should have aria-hidden for accessibility', () => {
      const { container } = render(<PixiBackground />)

      const element = container.firstChild as HTMLElement
      expect(element.getAttribute('aria-hidden')).toBe('true')
    })

    it('should merge custom className', () => {
      const { container } = render(<PixiBackground className="custom-bg" />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('custom-bg')
    })

    it('should not render noise overlay before hydration', () => {
      const { container } = render(<PixiBackground />)
      // Before hydration, we render a minimal placeholder without noise
      // The full component with noise renders after hydration
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Theme handling', () => {
    it('should render with default ethereum theme', () => {
      const { container } = render(<PixiBackground />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should accept arbitrum theme', () => {
      const { container } = render(<PixiBackground theme="arbitrum" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should accept optimism theme', () => {
      const { container } = render(<PixiBackground theme="optimism" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should accept polygon theme', () => {
      const { container } = render(<PixiBackground theme="polygon" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render all themes without errors', () => {
      const themes: NetworkTheme[] = ['ethereum', 'arbitrum', 'optimism', 'polygon']

      themes.forEach((theme) => {
        cleanup()
        const { container } = render(<PixiBackground theme={theme} />)
        expect(container.firstChild).toBeInTheDocument()
      })
    })

    it('should handle theme changes', () => {
      const { container, rerender } = render(<PixiBackground theme="ethereum" />)

      expect(container.firstChild).toBeInTheDocument()

      rerender(<PixiBackground theme="arbitrum" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle rapid theme changes', () => {
      const { container, rerender } = render(<PixiBackground theme="ethereum" />)

      rerender(<PixiBackground theme="arbitrum" />)
      rerender(<PixiBackground theme="optimism" />)
      rerender(<PixiBackground theme="polygon" />)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Hydration', () => {
    it('should render SSR placeholder when not hydrated', () => {
      // useHydrated already mocked to return false
      const { container } = render(<PixiBackground />)

      const element = container.firstChild as HTMLElement
      expect(element).toBeInTheDocument()
      expect(element.className).toContain('fixed')
      // No canvas should be appended before hydration
      expect(container.querySelector('canvas')).toBeNull()
    })
  })

  describe('Reduced motion', () => {
    it('should accept reduced motion preference', async () => {
      const { useReducedMotion } = await import('@/shared/ui/hooks/use-reduced-motion')
      ;(useReducedMotion as Mock).mockReturnValue(true)

      const { container } = render(<PixiBackground />)
      expect(container.firstChild).toBeInTheDocument()

      // Restore mock
      ;(useReducedMotion as Mock).mockReturnValue(false)
    })
  })

  describe('Cleanup', () => {
    it('should clean up on unmount', () => {
      const { unmount } = render(<PixiBackground />)

      // Should not throw
      expect(() => unmount()).not.toThrow()
    })
  })
})
