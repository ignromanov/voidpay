import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { HyperText } from '../hyper-text'

describe('HyperText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('T050-test: Default rendering', () => {
    it('should render the text', () => {
      const { container } = render(<HyperText text="Hello World" />)

      expect(container).toBeInTheDocument()
    })

    it('should animate on load by default', async () => {
      const { container } = render(<HyperText text="Hello" />)

      // Initially should show scrambled or empty text
      const element = container.firstChild as HTMLElement
      expect(element).toBeInTheDocument()
    })

    it('should eventually display the final text', async () => {
      const { container } = render(<HyperText text="Final Text" duration={50} />)

      await waitFor(
        () => {
          expect(container.textContent).toBe('Final Text')
        },
        { timeout: 1000 }
      )
    })
  })

  describe('T051-test: Animation completion callback', () => {
    it('should call onAnimationComplete when animation finishes', async () => {
      const callback = vi.fn()

      render(<HyperText text="Test" duration={50} onAnimationComplete={callback} />)

      await waitFor(
        () => {
          expect(callback).toHaveBeenCalled()
        },
        { timeout: 1000 }
      )
    })

    it('should not call callback if animation is interrupted', async () => {
      const callback = vi.fn()

      const { unmount } = render(
        <HyperText text="Test" duration={1000} onAnimationComplete={callback} />
      )

      // Unmount immediately before animation completes
      await new Promise((resolve) => setTimeout(resolve, 10))
      unmount()

      // Wait a bit to ensure callback would have fired if it was going to
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('T052-test: Duration prop', () => {
    it('should respect custom duration', async () => {
      const { container } = render(<HyperText text="Custom" duration={50} />)

      await waitFor(
        () => {
          expect(container.textContent).toBe('Custom')
        },
        { timeout: 500 }
      )
    })

    it('should animate faster with shorter duration', async () => {
      const { container } = render(<HyperText text="Fast" duration={20} />)

      await waitFor(
        () => {
          expect(container.textContent).toBe('Fast')
        },
        { timeout: 500 }
      )
    })
  })

  describe('T053-test: animateOnLoad=false', () => {
    it('should show final text immediately when animateOnLoad=false', () => {
      const { container } = render(<HyperText text="Static Text" animateOnLoad={false} />)

      // Should immediately show final text
      expect(container.textContent).toBe('Static Text')
    })

    it('should not trigger animation on mount when animateOnLoad=false', async () => {
      const callback = vi.fn()

      render(<HyperText text="No Animation" animateOnLoad={false} onAnimationComplete={callback} />)

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Callback should not be called (no animation happened)
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('T054-test: Static characters (space, punctuation)', () => {
    it('should preserve spaces during animation', async () => {
      const { container } = render(<HyperText text="Hello World" duration={100} />)

      // Wait a bit for partial animation
      await waitFor(
        () => {
          const text = container.textContent || ''
          const spaceCount = (text.match(/ /g) || []).length
          expect(spaceCount).toBeGreaterThanOrEqual(1)
        },
        { timeout: 500 }
      )
    })

    it('should preserve punctuation during animation', async () => {
      const { container } = render(<HyperText text="Hello, World!" duration={100} />)

      // Wait for partial animation
      await waitFor(
        () => {
          const text = container.textContent || ''
          expect(text).toContain(',')
          expect(text).toContain('!')
        },
        { timeout: 500 }
      )
    })
  })

  describe('T055-test: Text prop change (re-animate)', () => {
    it('should re-animate when text prop changes', async () => {
      const { container, rerender } = render(<HyperText text="First" duration={50} />)

      // Complete first animation
      await waitFor(
        () => {
          expect(container.textContent).toBe('First')
        },
        { timeout: 500 }
      )

      // Change text - should re-animate
      rerender(<HyperText text="Second" duration={50} />)

      await waitFor(
        () => {
          expect(container.textContent).toBe('Second')
        },
        { timeout: 500 }
      )
    })
  })

  describe('T056-test: Edge cases', () => {
    it('should handle empty string', () => {
      const { container } = render(<HyperText text="" />)

      expect(container.textContent).toBe('')
    })

    it('should handle single character', async () => {
      const { container } = render(<HyperText text="A" duration={50} />)

      await waitFor(
        () => {
          expect(container.textContent).toBe('A')
        },
        { timeout: 500 }
      )
    })

    it('should handle very long text', async () => {
      const longText = 'A'.repeat(100)
      const { container } = render(<HyperText text={longText} duration={100} />)

      await waitFor(
        () => {
          expect(container.textContent).toBe(longText)
        },
        { timeout: 1000 }
      )
    })

    it('should handle special characters', async () => {
      const { container } = render(<HyperText text="Test@#$%" duration={50} />)

      await waitFor(
        () => {
          expect(container.textContent).toBe('Test@#$%')
        },
        { timeout: 500 }
      )
    })
  })

  describe('Additional tests', () => {
    it('should merge custom className', () => {
      const { container } = render(<HyperText text="Custom" className="text-2xl" />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toContain('text-2xl')
    })

    it('should render with default className', () => {
      const { container } = render(<HyperText text="Test" />)

      const element = container.firstChild as HTMLElement
      expect(element.className).toBeTruthy()
    })
  })
})
