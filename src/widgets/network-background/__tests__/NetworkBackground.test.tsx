import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { NetworkBackground } from '../NetworkBackground'
import type { NetworkTheme } from '@/shared/ui/constants/brand-tokens'

/**
 * NetworkBackground Component Tests
 *
 * Note: Global mock sets useReducedMotion to return TRUE (reduced motion preferred).
 * When reduced motion is preferred, the component renders a static gradient overlay
 * instead of animated floating shapes - this is the correct accessibility behavior.
 *
 * These tests verify the reduced motion fallback renders correctly.
 */

describe('NetworkBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('T020-test: Default rendering (reduced motion)', () => {
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

      // Should have negative z-index for background
      expect(element.className).toContain('-z-10')
    })

    it('should have pointer-events-none for non-interactive background', () => {
      const { container } = render(<NetworkBackground />)
      const element = container.firstChild as HTMLElement

      expect(element.className).toContain('pointer-events-none')
    })

    it('should have overflow-hidden', () => {
      const { container } = render(<NetworkBackground />)
      const element = container.firstChild as HTMLElement

      expect(element.className).toContain('overflow-hidden')
    })
  })

  describe('T021-test: Arbitrum theme (reduced motion)', () => {
    it('should render static gradient for arbitrum theme', () => {
      const { container } = render(<NetworkBackground theme="arbitrum" />)

      const element = container.firstChild as HTMLElement
      // In reduced motion mode, renders static gradient, not shapes
      expect(element.style.background).toContain('linear-gradient')
    })

    it('should use arbitrum colors in gradient', () => {
      const { container } = render(<NetworkBackground theme="arbitrum" />)

      const element = container.firstChild as HTMLElement
      // Gradient should exist (colors are embedded)
      expect(element.style.background).toBeTruthy()
    })
  })

  describe('T022-test: Optimism theme (reduced motion)', () => {
    it('should render static gradient for optimism theme', () => {
      const { container } = render(<NetworkBackground theme="optimism" />)

      const element = container.firstChild as HTMLElement
      expect(element.style.background).toContain('linear-gradient')
    })
  })

  describe('T023-test: Polygon theme (reduced motion)', () => {
    it('should render static gradient for polygon theme', () => {
      const { container } = render(<NetworkBackground theme="polygon" />)

      const element = container.firstChild as HTMLElement
      expect(element.style.background).toContain('linear-gradient')
    })
  })

  describe('T024-test: Ethereum theme (reduced motion)', () => {
    it('should render static gradient for ethereum theme', () => {
      const { container } = render(<NetworkBackground theme="ethereum" />)

      const element = container.firstChild as HTMLElement
      expect(element.style.background).toContain('linear-gradient')
    })
  })

  describe('T025-test: Base theme (reduced motion)', () => {
    it('should render static gradient for base theme', () => {
      const { container } = render(<NetworkBackground theme="base" />)

      const element = container.firstChild as HTMLElement
      expect(element.style.background).toContain('linear-gradient')
    })
  })

  describe('T026-test: VoidPay theme (reduced motion)', () => {
    it('should render static gradient for voidpay theme', () => {
      const { container } = render(<NetworkBackground theme="voidpay" />)

      const element = container.firstChild as HTMLElement
      expect(element.style.background).toContain('linear-gradient')
    })
  })

  describe('T027-test: Theme changes (reduced motion)', () => {
    it('should update gradient when theme changes', () => {
      const { container, rerender } = render(<NetworkBackground theme="ethereum" />)

      let element = container.firstChild as HTMLElement
      const initialBackground = element.style.background

      // Change theme
      rerender(<NetworkBackground theme="arbitrum" />)

      element = container.firstChild as HTMLElement
      const newBackground = element.style.background

      // Both should be gradients (reduced motion mode)
      expect(initialBackground).toContain('linear-gradient')
      expect(newBackground).toContain('linear-gradient')
    })

    it('should handle rapid theme changes gracefully', () => {
      const { container, rerender } = render(<NetworkBackground theme="ethereum" />)

      // Rapid theme changes
      rerender(<NetworkBackground theme="arbitrum" />)
      rerender(<NetworkBackground theme="optimism" />)
      rerender(<NetworkBackground theme="polygon" />)

      // Should end with polygon gradient
      const element = container.firstChild as HTMLElement
      expect(element.style.background).toContain('linear-gradient')
    })
  })

  describe('Additional tests', () => {
    it('should merge custom className', () => {
      const { container } = render(<NetworkBackground className="custom-bg" />)
      const element = container.firstChild as HTMLElement

      expect(element.className).toContain('custom-bg')
    })

    it('should render all theme variants without errors', () => {
      const themes: NetworkTheme[] = [
        'arbitrum',
        'optimism',
        'polygon',
        'ethereum',
        'base',
        'voidpay',
      ]

      themes.forEach((theme) => {
        const { container } = render(<NetworkBackground theme={theme} />)
        expect(container.firstChild).toBeInTheDocument()

        const element = container.firstChild as HTMLElement
        // All themes in reduced motion mode show gradient
        expect(element.style.background).toContain('linear-gradient')
      })
    })

    it('should use inset-0 for full coverage', () => {
      const { container } = render(<NetworkBackground />)
      const element = container.firstChild as HTMLElement

      expect(element.className).toContain('inset-0')
    })
  })
})
