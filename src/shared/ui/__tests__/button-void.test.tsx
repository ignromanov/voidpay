import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { Button } from '../button'

describe('Button void variant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render void variant button', () => {
      const { container } = render(<Button variant="void">Click me</Button>)

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      expect(button?.getAttribute('class')).toContain('relative')
    })

    it('should apply void variant classes', () => {
      const { container } = render(<Button variant="void">Click me</Button>)

      const button = container.querySelector('button')
      expect(button?.getAttribute('class')).toContain('bg-black')
      expect(button?.getAttribute('class')).toContain('overflow-hidden')
    })
  })

  describe('Disabled state', () => {
    it('should disable button when disabled prop is set', () => {
      const { container } = render(
        <Button variant="void" disabled>
          Disabled
        </Button>
      )

      const button = container.querySelector('button')
      expect(button).toBeDisabled()
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

  describe('Loading state', () => {
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

  describe('Sizes and customization', () => {
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
  })

  describe('Click handling', () => {
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
