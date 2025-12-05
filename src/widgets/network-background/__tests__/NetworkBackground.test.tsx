import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { NetworkBackground } from '../NetworkBackground'
import type { NetworkTheme } from '@/shared/ui/constants/brand-tokens'
import * as React from 'react'

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: ({ children, ...props }: React.ComponentProps<'div'>) => (
        <div {...props}>{children}</div>
      ),
    },
    useReducedMotion: vi.fn(() => false),
  }
})

describe('NetworkBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('T020-test: Default theme rendering', () => {
    it('should render with default ethereum theme', () => {
      const { container } = render(<NetworkBackground />)

      // Should render a container
      expect(container.firstChild).toBeInTheDocument()

      // Should have fixed positioning classes
      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('fixed')
    })

    it('should render with proper z-index for background layer', () => {
      const { container } = render(<NetworkBackground />)
      const element = container.firstChild as HTMLElement

      // Should have negative z-index or low z-index for background
      expect(element.className.includes('z-') || element.style.zIndex).toBeTruthy()
    })
  })

  describe('T021-test: Arbitrum theme (blue triangles)', () => {
    it('should apply arbitrum theme colors', () => {
      const { container } = render(<NetworkBackground theme="arbitrum" />)

      // Should contain shapes (div or svg elements)
      const shapes = container.querySelectorAll('[data-shape]')
      expect(shapes.length).toBeGreaterThan(0)
    })

    it('should render 8 shapes for arbitrum', () => {
      const { container } = render(<NetworkBackground theme="arbitrum" />)
      const shapes = container.querySelectorAll('[data-shape="triangle"]')

      // Arbitrum should have 8 triangles
      expect(shapes.length).toBe(8)
    })
  })

  describe('T022-test: Optimism theme (red circles)', () => {
    it('should apply optimism theme colors', () => {
      const { container } = render(<NetworkBackground theme="optimism" />)

      // Should contain shapes
      const shapes = container.querySelectorAll('[data-shape]')
      expect(shapes.length).toBeGreaterThan(0)
    })

    it('should render 8 shapes for optimism', () => {
      const { container } = render(<NetworkBackground theme="optimism" />)
      const shapes = container.querySelectorAll('[data-shape="circle"]')

      // Optimism should have 8 circles
      expect(shapes.length).toBe(8)
    })
  })

  describe('T023-test: Polygon theme (purple hexagons)', () => {
    it('should apply polygon theme colors', () => {
      const { container } = render(<NetworkBackground theme="polygon" />)

      // Should contain shapes
      const shapes = container.querySelectorAll('[data-shape]')
      expect(shapes.length).toBeGreaterThan(0)
    })

    it('should render 6 shapes for polygon', () => {
      const { container } = render(<NetworkBackground theme="polygon" />)
      const shapes = container.querySelectorAll('[data-shape="hexagon"]')

      // Polygon should have 6 hexagons
      expect(shapes.length).toBe(6)
    })
  })

  describe('T024-test: Ethereum theme (blue rhombus)', () => {
    it('should apply ethereum theme colors', () => {
      const { container } = render(<NetworkBackground theme="ethereum" />)

      // Should contain shapes
      const shapes = container.querySelectorAll('[data-shape]')
      expect(shapes.length).toBeGreaterThan(0)
    })

    it('should render 8 shapes for ethereum', () => {
      const { container } = render(<NetworkBackground theme="ethereum" />)
      const shapes = container.querySelectorAll('[data-shape="rhombus"]')

      // Ethereum should have 8 rhombus shapes
      expect(shapes.length).toBe(8)
    })
  })

  describe('T025-test: VoidPay theme (violet blobs)', () => {
    it('should apply voidpay theme colors', () => {
      const { container } = render(<NetworkBackground theme="voidpay" />)

      // Should contain shapes
      const shapes = container.querySelectorAll('[data-shape]')
      expect(shapes.length).toBeGreaterThan(0)
    })

    it('should render 10 shapes for voidpay', () => {
      const { container } = render(<NetworkBackground theme="voidpay" />)
      const shapes = container.querySelectorAll('[data-shape="blob"]')

      // VoidPay should have 10 blobs
      expect(shapes.length).toBe(10)
    })
  })

  describe('T027-test: Theme transition (AnimatePresence)', () => {
    it('should render with AnimatePresence for theme changes', () => {
      const { container, rerender } = render(<NetworkBackground theme="ethereum" />)

      // Initial render
      let shapes = container.querySelectorAll('[data-shape="rhombus"]')
      expect(shapes.length).toBe(8)

      // Change theme
      rerender(<NetworkBackground theme="arbitrum" />)

      // Should now have different shapes (AnimatePresence handles transition)
      shapes = container.querySelectorAll('[data-shape="triangle"]')
      expect(shapes.length).toBe(8)
    })

    it('should handle rapid theme changes', () => {
      const { container, rerender } = render(<NetworkBackground theme="ethereum" />)

      // Rapid theme changes
      rerender(<NetworkBackground theme="arbitrum" />)
      rerender(<NetworkBackground theme="optimism" />)
      rerender(<NetworkBackground theme="polygon" />)

      // Should end with polygon shapes
      const shapes = container.querySelectorAll('[data-shape="hexagon"]')
      expect(shapes.length).toBe(6)
    })
  })

  describe('Additional tests', () => {
    it('should merge custom className', () => {
      const { container } = render(<NetworkBackground className="custom-bg" />)
      const element = container.firstChild as HTMLElement

      expect(element.className).toContain('custom-bg')
    })

    it('should have proper overflow hidden for clipping', () => {
      const { container } = render(<NetworkBackground />)
      const element = container.firstChild as HTMLElement

      expect(element.className).toContain('overflow-hidden')
    })

    it('should render all theme variants without errors', () => {
      const themes: NetworkTheme[] = [
        'arbitrum',
        'optimism',
        'polygon',
        'ethereum',
        'voidpay',
      ]

      themes.forEach((theme) => {
        const { container } = render(<NetworkBackground theme={theme} />)
        expect(container.firstChild).toBeInTheDocument()
      })
    })
  })
})
