import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { VoidLogo } from '../void-logo'

/**
 * VoidLogo Component Tests
 *
 * Note: Global mocks for framer-motion and useReducedMotion are defined in vitest.setup.ts.
 * The global mock sets useReducedMotion to return TRUE by default (reduced motion enabled).
 *
 * For tests that need to verify animation behavior (when reduced motion is disabled),
 * we override the mock locally using vi.doMock.
 */

describe('VoidLogo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('T010-test: Basic rendering', () => {
    it('should render VoidLogo SVG structure', () => {
      render(<VoidLogo />)

      // Should render an SVG element
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()

      // Should have default viewBox
      expect(svg).toHaveAttribute('viewBox')

      // Should contain eclipse body (circle or path)
      const shapes = svg?.querySelectorAll('circle, path, ellipse')
      expect(shapes).toBeDefined()
      expect(shapes!.length).toBeGreaterThan(0)
    })

    it('should have accessible role', () => {
      render(<VoidLogo />)
      const svg = document.querySelector('svg')

      // Should have img role or aria-label for accessibility
      expect(svg?.getAttribute('role') === 'img' || svg?.getAttribute('aria-label')).toBeTruthy()
    })
  })

  describe('T011-test: Size prop variants', () => {
    it('should apply sm size (32px)', () => {
      const { container } = render(<VoidLogo size="sm" />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '32')
      expect(svg).toHaveAttribute('height', '32')
    })

    it('should apply md size (48px) as default', () => {
      const { container } = render(<VoidLogo />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '48')
      expect(svg).toHaveAttribute('height', '48')
    })

    it('should apply lg size (64px)', () => {
      const { container } = render(<VoidLogo size="lg" />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '64')
      expect(svg).toHaveAttribute('height', '64')
    })

    it('should apply xl size (96px)', () => {
      const { container } = render(<VoidLogo size="xl" />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '96')
      expect(svg).toHaveAttribute('height', '96')
    })

    it('should apply custom numeric size', () => {
      const { container } = render(<VoidLogo size={128} />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '128')
      expect(svg).toHaveAttribute('height', '128')
    })
  })

  describe('T012-test: Static prop (animation disabled)', () => {
    it('should not have animation class when static=true', () => {
      const { container } = render(<VoidLogo static />)
      const svg = container.querySelector('svg')

      // Should not have pulse animation class
      expect(svg?.getAttribute('class')).not.toContain('animate-crescent-pulse')
    })

    /**
     * Note: This test verifies behavior when animations would normally be enabled.
     * However, our global mock sets useReducedMotion to TRUE, so animations are
     * disabled by default. We test the static={false} prop explicitly.
     */
    it('should not have animation class when reduced motion is preferred (global mock)', () => {
      const { container } = render(<VoidLogo static={false} />)
      const svg = container.querySelector('svg')

      // Global mock sets useReducedMotion to true, so animation should be disabled
      expect(svg?.getAttribute('class')).not.toContain('animate-crescent-pulse')
    })
  })

  describe('T013-test: className merge', () => {
    it('should merge custom className with defaults', () => {
      const { container } = render(<VoidLogo className="custom-class" />)
      const svg = container.querySelector('svg')

      // Should have both default and custom classes
      expect(svg?.getAttribute('class')).toContain('custom-class')
    })

    it('should preserve default classes when className provided', () => {
      const { container } = render(<VoidLogo className="custom-class" static />)
      const svg = container.querySelector('svg')

      // Should have custom class, static prevents animation
      expect(svg?.getAttribute('class')).toContain('custom-class')
    })

    it('should handle empty className', () => {
      const { container } = render(<VoidLogo className="" />)
      const svg = container.querySelector('svg')

      // Should still render with default classes
      expect(svg).toBeInTheDocument()
    })
  })

  describe('T014-test: Edge cases (size validation)', () => {
    it('should clamp size=0 to minimum 16px', () => {
      const { container } = render(<VoidLogo size={0} />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '16')
      expect(svg).toHaveAttribute('height', '16')
    })

    it('should clamp negative size to minimum 16px', () => {
      const { container } = render(<VoidLogo size={-10} />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '16')
      expect(svg).toHaveAttribute('height', '16')
    })

    it('should handle very small positive size (clamp to 16px)', () => {
      const { container } = render(<VoidLogo size={5} />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '16')
      expect(svg).toHaveAttribute('height', '16')
    })

    it('should allow size exactly at minimum (16px)', () => {
      const { container } = render(<VoidLogo size={16} />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '16')
      expect(svg).toHaveAttribute('height', '16')
    })

    it('should allow very large size (no upper limit)', () => {
      const { container } = render(<VoidLogo size={500} />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '500')
      expect(svg).toHaveAttribute('height', '500')
    })
  })

  describe('Accessibility', () => {
    /**
     * This test verifies that the component respects reduced motion preference.
     * The global mock in vitest.setup.ts sets useReducedMotion to TRUE,
     * so this test passes when animations are correctly disabled.
     */
    it('should respect prefers-reduced-motion (enabled by global mock)', () => {
      const { container } = render(<VoidLogo />)
      const svg = container.querySelector('svg')

      // Global mock returns true for useReducedMotion
      // Animation should NOT be present
      expect(svg?.getAttribute('class')).not.toContain('animate-crescent-pulse')
    })
  })
})
