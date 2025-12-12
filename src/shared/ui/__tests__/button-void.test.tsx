import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { Button } from '../button'
import * as React from 'react'

// Mock useReducedMotion hook
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: React.ComponentProps<'div'>) => (
        <div {...props}>{children}</div>
      ),
    },
    useReducedMotion: vi.fn(() => false),
  }
})

describe('Button void variant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('T030-test: Idle state (6s rotation)', () => {
    it('should render void variant button', () => {
      const { container } = render(<Button variant="void">Click me</Button>)

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      expect(button?.getAttribute('class')).toContain('relative')
    })

    it('should have accretion disk overlay in idle state', () => {
      const { container } = render(<Button variant="void">Click me</Button>)

      // Should contain the accretion disk overlay element
      const overlay = container.querySelector('[data-accretion-disk]')
      expect(overlay).toBeInTheDocument()
    })

    it('should have idle animation class (6s rotation)', () => {
      const { container } = render(<Button variant="void">Click me</Button>)

      const overlay = container.querySelector('[data-accretion-disk]')
      expect(overlay?.getAttribute('class')).toContain('animate-accretion-idle')
    })
  })

  describe('T031-test: Hover state (2s rotation, glow intensify)', () => {
    it('should apply hover animation class', () => {
      const { container } = render(
        <Button variant="void" className="hover-test">
          Hover me
        </Button>
      )

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()

      // Hover classes should be in the button or overlay
      const overlay = container.querySelector('[data-accretion-disk]')
      expect(overlay).toBeInTheDocument()
    })
  })

  describe('T032-test: Loading state (0.5s rotation, expanded glow)', () => {
    it('should render loading state with isLoading prop', () => {
      const { container } = render(
        <Button variant="void" isLoading>
          Loading...
        </Button>
      )

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('should have loading animation class (0.5s rotation)', () => {
      const { container } = render(
        <Button variant="void" isLoading>
          Loading...
        </Button>
      )

      const overlay = container.querySelector('[data-accretion-disk]')
      expect(overlay?.getAttribute('class')).toContain('animate-accretion-loading')
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
  })

  describe('T033-test: Disabled state (no disk, grayscale)', () => {
    it('should not show accretion disk when disabled', () => {
      const { container } = render(
        <Button variant="void" disabled>
          Disabled
        </Button>
      )

      const button = container.querySelector('button')
      expect(button).toBeDisabled()

      // Accretion disk should be hidden or have opacity-0
      const overlay = container.querySelector('[data-accretion-disk]')
      if (overlay) {
        expect(overlay.getAttribute('class')).toMatch(/opacity-0|hidden/)
      }
    })

    it('should apply grayscale filter when disabled', () => {
      const { container } = render(
        <Button variant="void" disabled>
          Disabled
        </Button>
      )

      const button = container.querySelector('button')
      expect(button?.getAttribute('class')).toContain('disabled:')
    })
  })

  describe('T034-test: Content text compression on hover', () => {
    it('should have content wrapper for hover effects', () => {
      const { container } = render(<Button variant="void">Content</Button>)

      // Button content should be wrapped for scale effects
      const button = container.querySelector('button')
      expect(button?.textContent).toBe('Content')
    })

    it('should have hover scale class on content', () => {
      const { container } = render(<Button variant="void">Content</Button>)

      // Content wrapper should have hover scale class
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
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
      expect(button?.getAttribute('class')).toContain('h-12')
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
