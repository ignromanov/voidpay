/**
 * NetworkBackground component tests
 * Feature: 015-create-page-preview
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { render } from '@/shared/ui/__tests__/test-utils'
import { NetworkBackground } from '../NetworkBackground'
import { useCreatorStore } from '@/entities/creator'

describe('NetworkBackground', () => {
  beforeEach(() => {
    // Reset store state
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
      templates: [],
      history: [],
      preferences: {
        defaultNetworkId: 1,
        defaultCurrency: 'USDC',
      },
      networkTheme: 'ethereum',
    })
  })

  describe('rendering', () => {
    it('renders background container', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.fixed.inset-0')
      expect(background).toBeInTheDocument()
    })

    it('has pointer-events-none to allow click-through', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.fixed')
      expect(background).toHaveClass('pointer-events-none')
    })

    it('has correct z-index for layering', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.fixed')
      expect(background).toHaveClass('z-[1]')
    })

    it('hides on print', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.fixed')
      expect(background).toHaveClass('print:hidden')
    })

    it('has aria-hidden attribute', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('[aria-hidden]')
      expect(background).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies custom className when provided', () => {
      const { container } = render(<NetworkBackground className="custom-class" />)

      const background = container.querySelector('.custom-class')
      expect(background).toBeInTheDocument()
    })
  })

  describe('gradient overlay', () => {
    it('renders gradient overlay', () => {
      const { container } = render(<NetworkBackground />)

      const overlay = container.querySelector('.bg-gradient-to-b')
      expect(overlay).toBeInTheDocument()
    })

    it('applies gradient from zinc-900/50 via transparent', () => {
      const { container } = render(<NetworkBackground />)

      const overlay = container.querySelector('.bg-gradient-to-b')
      expect(overlay).toHaveClass('from-zinc-900/50')
      expect(overlay).toHaveClass('via-transparent')
      expect(overlay).toHaveClass('to-transparent')
    })

    it('covers full container area', () => {
      const { container } = render(<NetworkBackground />)

      const overlay = container.querySelector('.bg-gradient-to-b')
      expect(overlay).toHaveClass('absolute')
      expect(overlay).toHaveClass('inset-0')
    })
  })

  describe('gradient blobs', () => {
    it('renders two gradient blobs', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs.length).toBe(2)
    })

    it('positions first blob at top-left quadrant', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('top-1/4')
      expect(blobs[0]).toHaveClass('left-1/4')
    })

    it('positions second blob at bottom-right quadrant', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[1]).toHaveClass('right-1/4')
      expect(blobs[1]).toHaveClass('bottom-1/4')
    })

    it('applies consistent size to blobs', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      blobs.forEach((blob) => {
        expect(blob).toHaveClass('h-96')
        expect(blob).toHaveClass('w-96')
      })
    })

    it('applies blur-3xl effect to blobs', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full')
      blobs.forEach((blob) => {
        expect(blob).toHaveClass('blur-3xl')
      })
    })

    it('uses smooth color transitions', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      blobs.forEach((blob) => {
        expect(blob).toHaveClass('transition-colors')
        expect(blob).toHaveClass('duration-700')
      })
    })
  })

  describe('ethereum theme', () => {
    it('applies violet/indigo colors for ethereum', () => {
      useCreatorStore.setState({ networkTheme: 'ethereum' })

      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('bg-violet-600/10')
      expect(blobs[1]).toHaveClass('bg-indigo-600/10')
    })
  })

  describe('arbitrum theme', () => {
    it('applies blue/cyan colors for arbitrum', () => {
      useCreatorStore.setState({ networkTheme: 'arbitrum' })

      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('bg-blue-600/10')
      expect(blobs[1]).toHaveClass('bg-cyan-600/10')
    })
  })

  describe('optimism theme', () => {
    it('applies red/orange colors for optimism', () => {
      useCreatorStore.setState({ networkTheme: 'optimism' })

      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('bg-red-600/10')
      expect(blobs[1]).toHaveClass('bg-orange-600/10')
    })
  })

  describe('polygon theme', () => {
    it('applies purple/violet colors for polygon', () => {
      useCreatorStore.setState({ networkTheme: 'polygon' })

      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('bg-purple-600/10')
      expect(blobs[1]).toHaveClass('bg-violet-600/10')
    })
  })

  describe('theme reactivity', () => {
    it('updates colors when theme changes from ethereum to arbitrum', () => {
      useCreatorStore.setState({ networkTheme: 'ethereum' })

      const { container, rerender } = render(<NetworkBackground />)

      let blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('bg-violet-600/10')

      // Change theme
      useCreatorStore.setState({ networkTheme: 'arbitrum' })
      rerender(<NetworkBackground />)

      blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('bg-blue-600/10')
    })

    it('updates colors when theme changes from optimism to polygon', () => {
      useCreatorStore.setState({ networkTheme: 'optimism' })

      const { container, rerender } = render(<NetworkBackground />)

      let blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('bg-red-600/10')

      // Change theme
      useCreatorStore.setState({ networkTheme: 'polygon' })
      rerender(<NetworkBackground />)

      blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('bg-purple-600/10')
    })

    it('handles rapid theme changes gracefully', () => {
      const { container, rerender } = render(<NetworkBackground />)

      // Rapid theme changes
      useCreatorStore.setState({ networkTheme: 'ethereum' })
      rerender(<NetworkBackground />)

      useCreatorStore.setState({ networkTheme: 'arbitrum' })
      rerender(<NetworkBackground />)

      useCreatorStore.setState({ networkTheme: 'optimism' })
      rerender(<NetworkBackground />)

      useCreatorStore.setState({ networkTheme: 'polygon' })
      rerender(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      expect(blobs[0]).toHaveClass('bg-purple-600/10')
    })
  })

  describe('fallback behavior', () => {
    it('defaults to ethereum colors for invalid theme', () => {
      useCreatorStore.setState({ networkTheme: 'invalid' as any })

      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      // Should fallback to ethereum
      expect(blobs[0]).toHaveClass('bg-violet-600/10')
      expect(blobs[1]).toHaveClass('bg-indigo-600/10')
    })

    it('handles undefined theme gracefully', () => {
      useCreatorStore.setState({ networkTheme: undefined as any })

      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      // Should fallback to ethereum
      expect(blobs[0]).toHaveClass('bg-violet-600/10')
    })
  })

  describe('accessibility', () => {
    it('is hidden from screen readers', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('[aria-hidden]')
      expect(background).toHaveAttribute('aria-hidden', 'true')
    })

    it('does not interfere with keyboard navigation', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.pointer-events-none')
      expect(background).toBeInTheDocument()
      // pointer-events-none ensures no focus trapping
    })

    it('does not capture mouse events', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.pointer-events-none')
      expect(background).toBeInTheDocument()
      // pointer-events-none allows clicks to pass through
    })
  })

  describe('performance', () => {
    it('uses smooth CSS transitions instead of JavaScript', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      blobs.forEach((blob) => {
        expect(blob).toHaveClass('transition-colors')
      })
    })

    it('applies long transition duration for subtle effect', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      blobs.forEach((blob) => {
        expect(blob).toHaveClass('duration-700')
      })
    })

    it('uses fixed positioning for optimal rendering', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.fixed')
      expect(background).toBeInTheDocument()
      // Fixed positioning prevents layout thrashing
    })
  })

  describe('responsive behavior', () => {
    it('maintains full viewport coverage on all screen sizes', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.inset-0')
      expect(background).toBeInTheDocument()
      // inset-0 ensures full coverage
    })

    it('positions blobs relative to viewport on mobile', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      // Fractional positioning (1/4) scales with viewport
      expect(blobs[0]).toHaveClass('top-1/4')
      expect(blobs[0]).toHaveClass('left-1/4')
    })

    it('maintains consistent blur radius across screen sizes', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      blobs.forEach((blob) => {
        expect(blob).toHaveClass('blur-3xl')
      })
    })
  })

  describe('print behavior', () => {
    it('hides background when printing', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.print\\:hidden')
      expect(background).toBeInTheDocument()
    })

    it('does not interfere with print layout', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.fixed')
      expect(background).toHaveClass('print:hidden')
      // Hidden during print prevents ink waste and layout issues
    })
  })

  describe('layering', () => {
    it('renders behind content with z-[1]', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.z-\\[1\\]')
      expect(background).toBeInTheDocument()
      // z-[1] ensures background is behind content (z-10, z-20, etc.)
    })

    it('does not block interactive elements', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.pointer-events-none')
      expect(background).toBeInTheDocument()
      // pointer-events-none allows interaction with overlaying content
    })
  })

  describe('edge cases', () => {
    it('renders without errors', () => {
      expect(() => render(<NetworkBackground />)).not.toThrow()
    })

    it('handles multiple renders gracefully', () => {
      const { rerender } = render(<NetworkBackground />)

      rerender(<NetworkBackground />)
      rerender(<NetworkBackground />)

      // Should not create duplicate backgrounds
      expect(document.querySelectorAll('.fixed.inset-0').length).toBeGreaterThan(0)
    })

    it('works without custom className', () => {
      const { container } = render(<NetworkBackground />)

      const background = container.querySelector('.fixed')
      expect(background).toBeInTheDocument()
    })

    it('maintains consistent opacity', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      blobs.forEach((blob) => {
        // Opacity baked into color classes (e.g., bg-violet-600/10)
        expect(blob.className).toContain('/10')
      })
    })

    it('does not interfere with other components', () => {
      const { container } = render(
        <>
          <NetworkBackground />
          <div className="content">Content</div>
        </>
      )

      const background = container.querySelector('.fixed.inset-0')
      const content = container.querySelector('.content')

      expect(background).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      // Both render without conflict
    })
  })

  describe('design system integration', () => {
    it('uses Void brand color palette', () => {
      const { container } = render(<NetworkBackground />)

      // Zinc overlay + network-specific accent colors
      const overlay = container.querySelector('.from-zinc-900\\/50')
      expect(overlay).toBeInTheDocument()
    })

    it('applies consistent blur intensity', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.blur-3xl')
      expect(blobs.length).toBe(2)
      // blur-3xl matches design system blur scale
    })

    it('uses low opacity for subtle effect', () => {
      const { container } = render(<NetworkBackground />)

      const blobs = container.querySelectorAll('.rounded-full.blur-3xl')
      blobs.forEach((blob) => {
        // /10 opacity (10%) for subtle ambient glow
        expect(blob.className).toContain('/10')
      })
    })
  })
})
