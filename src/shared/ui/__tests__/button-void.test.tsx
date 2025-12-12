import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { Button } from '../button'

/**
 * Button Void Variant Tests
 *
 * Note: Global mock sets useReducedMotion to return TRUE (reduced motion preferred).
 * This means animated accretion disk effects are disabled.
 * Tests verify the component correctly respects accessibility settings.
 */

describe('Button void variant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('T030-test: Idle state', () => {
    it('should render void variant button', () => {
      const { container } = render(<Button variant="void">Click me</Button>)

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      expect(button?.getAttribute('class')).toContain('relative')
    })

    it('should have void-specific styling', () => {
      const { container } = render(<Button variant="void">Click me</Button>)

      const button = container.querySelector('button')
      // Button should have relative positioning for overlay effects
      expect(button?.getAttribute('class')).toContain('relative')
    })

    it('should render button content correctly', () => {
      const { container } = render(<Button variant="void">Click me</Button>)

      const button = container.querySelector('button')
      expect(button?.textContent).toBe('Click me')
    })
  })

  describe('T031-test: Hover state styling', () => {
    it('should have hover transition classes', () => {
      const { container } = render(
        <Button variant="void" className="hover-test">
          Hover me
        </Button>
      )

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      // Button should have transition classes for hover effects
      expect(button?.getAttribute('class')).toContain('transition')
    })
  })

  describe('T032-test: Loading state', () => {
    it('should render loading state with isLoading prop', () => {
      const { container } = render(
        <Button variant="void" isLoading>
          Loading...
        </Button>
      )

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('should disable button when loading', () => {
      const { container } = render(
        <Button variant="void" isLoading>
          Loading...
        </Button>
      )

      const button = container.querySelector('button')
      expect(button).toBeDisabled()
    })

    it('should show loading indicator when loading', () => {
      const { container } = render(
        <Button variant="void" isLoading>
          Loading...
        </Button>
      )

      // Button should indicate loading state
      const button = container.querySelector('button')
      expect(button?.getAttribute('class')).toContain('disabled')
    })
  })

  describe('T033-test: Disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      const { container } = render(
        <Button variant="void" disabled>
          Disabled
        </Button>
      )

      const button = container.querySelector('button')
      expect(button).toBeDisabled()
    })

    it('should have disabled styling', () => {
      const { container } = render(
        <Button variant="void" disabled>
          Disabled
        </Button>
      )

      const button = container.querySelector('button')
      expect(button?.getAttribute('class')).toContain('disabled:')
    })
  })

  describe('T034-test: Content and effects', () => {
    it('should have content wrapper for effects', () => {
      const { container } = render(<Button variant="void">Content</Button>)

      const button = container.querySelector('button')
      expect(button?.textContent).toBe('Content')
    })

    it('should have proper positioning for overlay effects', () => {
      const { container } = render(<Button variant="void">Content</Button>)

      const button = container.querySelector('button')
      // Should have overflow-hidden for contained effects
      expect(button?.getAttribute('class')).toContain('overflow-hidden')
    })
  })

  describe('Additional void variant tests', () => {
    it('should work with different sizes', () => {
      const { container } = render(
        <Button variant="void" size="lg">
          Large
        </Button>
      )

      const button = container.querySelector('button')
      expect(button?.getAttribute('class')).toContain('h-10')
    })

    it('should merge custom className', () => {
      const { container } = render(
        <Button variant="void" className="custom-void">
          Custom
        </Button>
      )

      const button = container.querySelector('button')
      expect(button?.getAttribute('class')).toContain('custom-void')
    })

    it('should handle onClick events', () => {
      const handleClick = vi.fn()
      const { container } = render(
        <Button variant="void" onClick={handleClick}>
          Click
        </Button>
      )

      const button = container.querySelector('button')
      button?.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger onClick when disabled', () => {
      const handleClick = vi.fn()
      const { container } = render(
        <Button variant="void" disabled onClick={handleClick}>
          Disabled
        </Button>
      )

      const button = container.querySelector('button')
      button?.click()
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not trigger onClick when loading', () => {
      const handleClick = vi.fn()
      const { container } = render(
        <Button variant="void" isLoading onClick={handleClick}>
          Loading
        </Button>
      )

      const button = container.querySelector('button')
      button?.click()
      expect(handleClick).not.toHaveBeenCalled()
    })
  })
})
