import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SocialProofStrip } from '../SocialProofStrip'

describe('SocialProofStrip', () => {
  describe('Component Rendering', () => {
    it('should render the component', () => {
      const { container } = render(<SocialProofStrip />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })

    it('should render all 4 trust badges', () => {
      render(<SocialProofStrip />)

      expect(screen.getByText('Zero Data Storage')).toBeInTheDocument()
      expect(screen.getByText('Open Source')).toBeInTheDocument()
      expect(screen.getByText('Shutdown-Proof')).toBeInTheDocument()
      expect(screen.getByText('Multi-Chain')).toBeInTheDocument()
    })

    it('should render badge descriptions', () => {
      render(<SocialProofStrip />)

      expect(screen.getByText('No servers, no databases')).toBeInTheDocument()
      expect(screen.getByText('Verify the code yourself')).toBeInTheDocument()
      expect(screen.getByText('Deploy locally if we disappear')).toBeInTheDocument()
      expect(screen.getByText('ETH • Arbitrum • Optimism • Polygon')).toBeInTheDocument()
    })
  })

  describe('Link Behavior', () => {
    it('should render Open Source badge as a link', () => {
      render(<SocialProofStrip />)

      const link = screen.getByText('Open Source').closest('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://github.com/voidpay/voidpay')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render non-link badges as div elements', () => {
      render(<SocialProofStrip />)

      const zeroDataBadge = screen.getByText('Zero Data Storage').closest('div')
      expect(zeroDataBadge).toBeInTheDocument()
      expect(zeroDataBadge?.tagName).toBe('DIV')
    })
  })

  describe('Styling', () => {
    it('should have proper layout classes', () => {
      const { container } = render(<SocialProofStrip />)

      const section = container.querySelector('section')
      expect(section).toHaveClass('border-y', 'border-zinc-800/50')
    })

    it('should use grid layout for badges', () => {
      const { container } = render(<SocialProofStrip />)

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-4')
    })
  })

  describe('Icons', () => {
    it('should render icons with proper ARIA attributes', () => {
      const { container } = render(<SocialProofStrip />)

      const icons = container.querySelectorAll('[aria-hidden="true"]')
      expect(icons.length).toBe(4)
    })

    it('should render icons with proper styling', () => {
      const { container } = render(<SocialProofStrip />)

      const icons = container.querySelectorAll('.text-violet-400')
      expect(icons.length).toBe(4)
    })
  })

  describe('Accessibility', () => {
    it('should use semantic section element', () => {
      const { container } = render(<SocialProofStrip />)

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should have proper link accessibility for external links', () => {
      render(<SocialProofStrip />)

      const link = screen.getByText('Open Source').closest('a')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
