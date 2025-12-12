import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { AuroraText } from '../aurora-text'

/**
 * AuroraText Component Tests
 *
 * Note: Global mock sets useReducedMotion to return TRUE (reduced motion preferred).
 * This means animation classes are disabled by default.
 * Tests verify that the component correctly respects this accessibility setting.
 */

describe('AuroraText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('T040-test: Default rendering', () => {
    it('should render children text', () => {
      const { container } = render(<AuroraText>Hello World</AuroraText>)

      expect(container.textContent).toBe('Hello World')
    })

    it('should render as span by default', () => {
      const { container } = render(<AuroraText>Text</AuroraText>)

      const element = container.querySelector('span')
      expect(element).toBeInTheDocument()
    })

    it('should have gradient background', () => {
      const { container } = render(<AuroraText>Gradient</AuroraText>)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('bg-')
    })

    it('should have bg-clip-text for gradient effect', () => {
      const { container } = render(<AuroraText>Gradient</AuroraText>)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('bg-clip-text')
    })

    it('should NOT have aurora animation class when reduced motion is preferred', () => {
      // Global mock sets useReducedMotion = true
      const { container } = render(<AuroraText>Animated</AuroraText>)

      const element = container.firstChild as HTMLElement
      // Component correctly disables animation when reduced motion is preferred
      expect(element.className).not.toContain('animate-aurora')
    })
  })

  describe('T041-test: Polymorphic element (as prop)', () => {
    it('should render as h1 when as="h1"', () => {
      const { container } = render(<AuroraText as="h1">Heading</AuroraText>)

      const h1 = container.querySelector('h1')
      expect(h1).toBeInTheDocument()
      expect(h1?.textContent).toBe('Heading')
    })

    it('should render as h2 when as="h2"', () => {
      const { container } = render(<AuroraText as="h2">Heading 2</AuroraText>)

      const h2 = container.querySelector('h2')
      expect(h2).toBeInTheDocument()
    })

    it('should render as p when as="p"', () => {
      const { container } = render(<AuroraText as="p">Paragraph</AuroraText>)

      const p = container.querySelector('p')
      expect(p).toBeInTheDocument()
    })

    it('should render as h3, h4, h5, h6', () => {
      const { container: c3 } = render(<AuroraText as="h3">H3</AuroraText>)
      const { container: c4 } = render(<AuroraText as="h4">H4</AuroraText>)
      const { container: c5 } = render(<AuroraText as="h5">H5</AuroraText>)
      const { container: c6 } = render(<AuroraText as="h6">H6</AuroraText>)

      expect(c3.querySelector('h3')).toBeInTheDocument()
      expect(c4.querySelector('h4')).toBeInTheDocument()
      expect(c5.querySelector('h5')).toBeInTheDocument()
      expect(c6.querySelector('h6')).toBeInTheDocument()
    })
  })

  describe('T042-test: className merge', () => {
    it('should merge custom className with defaults', () => {
      const { container } = render(<AuroraText className="text-4xl font-bold">Custom</AuroraText>)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('text-4xl')
      expect(element.className).toContain('font-bold')
    })

    it('should preserve gradient classes when className provided', () => {
      const { container } = render(<AuroraText className="custom-class">Text</AuroraText>)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('custom-class')
      // Gradient classes should always be present
      expect(element.className).toContain('bg-clip-text')
    })

    it('should preserve gradient classes with custom className', () => {
      const { container } = render(<AuroraText className="uppercase">Text</AuroraText>)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('bg-clip-text')
    })
  })

  describe('T043-test: Reduced motion (static gradient)', () => {
    it('should not animate when prefers-reduced-motion is true (global mock)', () => {
      // Global mock returns true for useReducedMotion
      const { container } = render(<AuroraText>Static</AuroraText>)

      const element = container.firstChild as HTMLElement
      expect(element.className).not.toContain('animate-aurora')
    })

    it('should still have gradient styling without animation', () => {
      const { container } = render(<AuroraText>Static Gradient</AuroraText>)

      const element = container.firstChild as HTMLElement
      // Gradient should work even without animation
      expect(element.className).toContain('bg-clip-text')
      expect(element.className).toContain('bg-')
    })
  })

  describe('Additional tests', () => {
    it('should handle empty children', () => {
      const { container } = render(<AuroraText>{''}</AuroraText>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle React nodes as children', () => {
      const { container } = render(
        <AuroraText>
          <strong>Bold</strong> and <em>italic</em>
        </AuroraText>
      )

      expect(container.querySelector('strong')).toBeInTheDocument()
      expect(container.querySelector('em')).toBeInTheDocument()
    })

    it('should have violet drop shadow', () => {
      const { container } = render(<AuroraText>Shadow</AuroraText>)

      const element = container.firstChild as HTMLElement
      expect(element.className).toMatch(/drop-shadow|shadow/)
    })
  })
})
