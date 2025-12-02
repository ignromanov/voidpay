/**
 * DemoSection Tests
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo)
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { DemoSection } from '../DemoSection'

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  }
})

// Mock next/link to render as a proper anchor
vi.mock('next/link', () => ({
  default: vi.fn(({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
}))

// Mock the Button component to avoid Radix Slot issues in tests
vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual('@/shared/ui')
  return {
    ...actual,
    Button: vi.fn(({ children, asChild, ...props }) => {
      if (asChild) {
        // For asChild with Link, children is the Link element
        // We need to extract the Link's children and href
        const linkElement = children as React.ReactElement<{ href: string; children: React.ReactNode }>
        return (
          <a href={linkElement.props.href} {...props}>
            {linkElement.props.children}
          </a>
        )
      }
      return <button {...props}>{children}</button>
    }),
  }
})

describe('DemoSection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('T027-test: Invoice paper rendering', () => {
    it('should render invoice preview card', () => {
      render(<DemoSection />)

      expect(screen.getByText('INVOICE')).toBeInTheDocument()
    })

    it('should display invoice description', () => {
      render(<DemoSection />)

      // First demo invoice description
      expect(screen.getByText('Web Development Services')).toBeInTheDocument()
    })

    it('should display line items', () => {
      render(<DemoSection />)

      expect(screen.getByText('Frontend Development')).toBeInTheDocument()
    })

    it('should display total amount with token', () => {
      render(<DemoSection />)

      expect(screen.getByText(/0\.5 ETH/)).toBeInTheDocument()
    })
  })

  describe('T028-test: Auto-rotation interval', () => {
    it('should rotate to next invoice after 10 seconds', () => {
      render(<DemoSection />)

      // Initially shows first invoice (Ethereum)
      expect(screen.getByText('Web Development Services')).toBeInTheDocument()

      // Fast-forward 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Should now show second invoice (Arbitrum)
      expect(screen.getByText('Design Consultation')).toBeInTheDocument()
    })

    it('should cycle back to first invoice after all shown', () => {
      render(<DemoSection />)

      // Fast-forward 30 seconds (3 rotations)
      act(() => {
        vi.advanceTimersByTime(30000)
      })

      // Should be back to first invoice
      expect(screen.getByText('Web Development Services')).toBeInTheDocument()
    })
  })

  describe('T029-test: Use This Template button on hover', () => {
    it('should show "Use This Template" button on hover', () => {
      render(<DemoSection />)

      const container = document.querySelector('[class*="max-w-md"]')
      expect(container).not.toBeNull()
      fireEvent.mouseEnter(container!)

      expect(screen.getByRole('link', { name: /use this template/i })).toBeInTheDocument()
    })

    it('should link to /create with template parameter', () => {
      render(<DemoSection />)

      const container = document.querySelector('[class*="max-w-md"]')
      expect(container).not.toBeNull()
      fireEvent.mouseEnter(container!)

      const link = screen.getByRole('link', { name: /use this template/i })
      expect(link).toHaveAttribute('href', '/create?template=demo-eth-001')
    })

    it('should hide button on mouse leave', () => {
      render(<DemoSection />)

      const container = document.querySelector('[class*="max-w-md"]')
      expect(container).not.toBeNull()

      fireEvent.mouseEnter(container!)
      expect(screen.getByRole('link', { name: /use this template/i })).toBeInTheDocument()

      fireEvent.mouseLeave(container!)
      expect(screen.queryByRole('link', { name: /use this template/i })).not.toBeInTheDocument()
    })
  })

  describe('Navigation dots', () => {
    it('should render 3 navigation dots', () => {
      render(<DemoSection />)

      const dots = screen.getAllByRole('button', { name: /view .* invoice/i })
      expect(dots).toHaveLength(3)
    })

    it('should navigate to specific invoice on dot click', () => {
      render(<DemoSection />)

      // Click on third dot (Optimism)
      const dots = screen.getAllByRole('button', { name: /view .* invoice/i })
      // Safe access - we test for 3 dots in previous test
      fireEvent.click(dots[2]!)

      expect(screen.getByText('Marketing Campaign')).toBeInTheDocument()
    })
  })

  describe('Network theme', () => {
    it('should display current network badge', () => {
      render(<DemoSection />)

      expect(screen.getByText('Ethereum')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on section', () => {
      render(<DemoSection />)

      const section = document.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'demo-heading')
    })

    it('should have aria-labels on navigation dots', () => {
      render(<DemoSection />)

      const dots = screen.getAllByRole('button')
      dots.forEach((dot) => {
        expect(dot).toHaveAttribute('aria-label')
      })
    })
  })
})
