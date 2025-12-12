import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Briefcase } from 'lucide-react'
import { AudienceSection } from '../AudienceSection'
import { AudienceCard } from '../AudienceCard'

describe('AudienceSection', () => {
  describe('Component Rendering', () => {
    it('should render the component', () => {
      const { container } = render(<AudienceSection />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })

    it('should render section heading "Built For"', () => {
      render(<AudienceSection />)
      expect(screen.getByText('Built For')).toBeInTheDocument()
    })

    it('should render section description', () => {
      render(<AudienceSection />)
      expect(
        screen.getByText(/Whether you're a solo creator, a DAO treasurer, or running an agency/)
      ).toBeInTheDocument()
    })

    it('should render all 3 audience cards', () => {
      render(<AudienceSection />)

      expect(screen.getByText('Freelancers')).toBeInTheDocument()
      expect(screen.getByText('DAOs')).toBeInTheDocument()
      expect(screen.getByText('Agencies')).toBeInTheDocument()
    })
  })

  describe('Audience Cards Content', () => {
    it('should render freelancers card with correct headline', () => {
      render(<AudienceSection />)
      expect(screen.getByText('Get paid without giving up privacy')).toBeInTheDocument()
    })

    it('should render DAOs card with correct headline', () => {
      render(<AudienceSection />)
      expect(screen.getByText('Pay contributors. Keep it private.')).toBeInTheDocument()
    })

    it('should render agencies card with correct headline', () => {
      render(<AudienceSection />)
      expect(screen.getByText('Professional invoices, zero infrastructure')).toBeInTheDocument()
    })

    it('should render freelancers card description', () => {
      render(<AudienceSection />)
      expect(screen.getByText(/Your PayPal can freeze your funds/)).toBeInTheDocument()
    })

    it('should render DAOs card description', () => {
      render(<AudienceSection />)
      expect(screen.getByText(/No treasury doxx, no recipient exposure/)).toBeInTheDocument()
    })

    it('should render agencies card description', () => {
      render(<AudienceSection />)
      expect(screen.getByText(/No SaaS subscriptions. No server setup./)).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('should use grid layout for cards', () => {
      const { container } = render(<AudienceSection />)

      const grid = container.querySelector('.grid-cols-1.md\\:grid-cols-3')
      expect(grid).toBeInTheDocument()
    })

    it('should have proper spacing and padding', () => {
      const { container } = render(<AudienceSection />)

      const section = container.querySelector('section')
      expect(section).toHaveClass('py-32')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      const { container } = render(<AudienceSection />)

      const section = container.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'audience-section-heading')
    })

    it('should have proper heading hierarchy', () => {
      render(<AudienceSection />)

      const heading = screen.getByText('Built For')
      expect(heading.tagName).toBe('H2')
      expect(heading).toHaveAttribute('id', 'audience-section-heading')
    })
  })
})

describe('AudienceCard', () => {
  const defaultProps = {
    icon: Briefcase,
    title: 'Test Title',
    headline: 'Test Headline',
    description: 'Test Description',
    shouldAnimate: false,
  }

  describe('Component Rendering', () => {
    it('should render the card', () => {
      const { container } = render(<AudienceCard {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render title', () => {
      render(<AudienceCard {...defaultProps} />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should render headline', () => {
      render(<AudienceCard {...defaultProps} />)
      expect(screen.getByText('Test Headline')).toBeInTheDocument()
    })

    it('should render description', () => {
      render(<AudienceCard {...defaultProps} />)
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })
  })

  describe('Icon Rendering', () => {
    it('should render icon with ARIA hidden', () => {
      const { container } = render(<AudienceCard {...defaultProps} />)

      const icon = container.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('should apply default icon color', () => {
      const { container } = render(<AudienceCard {...defaultProps} />)

      const icon = container.querySelector('[aria-hidden="true"]')
      expect(icon).toHaveClass('text-violet-500')
    })

    it('should apply custom icon color', () => {
      const { container } = render(
        <AudienceCard {...defaultProps} iconColor="text-emerald-500" />
      )

      const icon = container.querySelector('[aria-hidden="true"]')
      expect(icon).toHaveClass('text-emerald-500')
    })
  })

  describe('Styling', () => {
    it('should have proper card styling', () => {
      const { container } = render(<AudienceCard {...defaultProps} />)

      const card = container.firstChild
      expect(card).toHaveClass('rounded-3xl', 'border', 'border-zinc-800/50')
    })

    it('should have gradient background', () => {
      const { container } = render(<AudienceCard {...defaultProps} />)

      const card = container.firstChild
      expect(card).toHaveClass('bg-gradient-to-b')
    })

    it('should have hover effects', () => {
      const { container } = render(<AudienceCard {...defaultProps} />)

      const card = container.firstChild
      expect(card).toHaveClass('hover:border-zinc-700', 'hover:shadow-lg')
    })
  })

  describe('Heading Hierarchy', () => {
    it('should render headline as h3', () => {
      render(<AudienceCard {...defaultProps} />)

      const headline = screen.getByText('Test Headline')
      expect(headline.tagName).toBe('H3')
    })

    it('should have proper heading size', () => {
      render(<AudienceCard {...defaultProps} />)

      const headline = screen.getByText('Test Headline')
      expect(headline).toHaveClass('text-xl')
    })
  })
})
