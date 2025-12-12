/**
 * DemoSection Tests
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo)
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import type { ReactNode } from 'react'

import { NetworkThemeProvider } from '../../context/network-theme-context'
import { DemoSection } from '../DemoSection'

// Wrapper with required providers
function TestWrapper({ children }: { children: ReactNode }) {
  return <NetworkThemeProvider>{children}</NetworkThemeProvider>
}

// Custom render with providers
function renderWithProviders(ui: ReactNode) {
  return render(ui, { wrapper: TestWrapper })
}

// Mock framer-motion with simplified AnimatePresence
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    },
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
      renderWithProviders(<DemoSection />)

      expect(screen.getByText('INVOICE')).toBeInTheDocument()
    })

    it('should display invoice description', () => {
      renderWithProviders(<DemoSection />)

      // First demo invoice description
      expect(screen.getByText('Web Development Services')).toBeInTheDocument()
    })

    it('should display line items', () => {
      renderWithProviders(<DemoSection />)

      expect(screen.getByText('Frontend Development')).toBeInTheDocument()
    })

    it('should display total amount with token', () => {
      renderWithProviders(<DemoSection />)

      expect(screen.getByText(/0\.5 ETH/)).toBeInTheDocument()
    })
  })

  describe('T028-test: Auto-rotation interval', () => {
    it('should rotate to next invoice after 15 seconds', async () => {
      renderWithProviders(<DemoSection />)

      // Initially shows first invoice (Ethereum)
      expect(screen.getByText('Web Development Services')).toBeInTheDocument()

      // Fast-forward 15 seconds (ROTATION_INTERVAL_MS)
      // Wrap in act to flush all effects and microtasks
      await act(async () => {
        vi.advanceTimersByTime(15000)
      })

      // Should now show second invoice (Arbitrum)
      expect(screen.getByText('Design Consultation')).toBeInTheDocument()
    })

    it('should cycle back to first invoice after all shown', () => {
      renderWithProviders(<DemoSection />)

      // Fast-forward 60 seconds (4 rotations with 4 invoices)
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      // Should be back to first invoice
      expect(screen.getByText('Web Development Services')).toBeInTheDocument()
    })
  })

  describe('T029-test: Use This Template button on hover', () => {
    // Helper to find the hover zone container
    const getHoverZone = () => document.querySelector('[class*="z-20"][class*="absolute"]')

    it('should show "Use This Template" button on hover', async () => {
      renderWithProviders(<DemoSection />)

      const hoverZone = getHoverZone()
      expect(hoverZone).not.toBeNull()

      await act(async () => {
        fireEvent.mouseEnter(hoverZone!)
      })

      expect(screen.getByRole('link', { name: /use this template/i })).toBeInTheDocument()
    })

    it('should link to /create with template parameter', async () => {
      renderWithProviders(<DemoSection />)

      const hoverZone = getHoverZone()
      expect(hoverZone).not.toBeNull()

      await act(async () => {
        fireEvent.mouseEnter(hoverZone!)
      })

      const link = screen.getByRole('link', { name: /use this template/i })
      expect(link).toHaveAttribute('href', '/create?template=demo-eth-001')
    })

    it('should hide button on mouse leave', async () => {
      renderWithProviders(<DemoSection />)

      const hoverZone = getHoverZone()
      expect(hoverZone).not.toBeNull()

      // Mouse enter - show button
      await act(async () => {
        fireEvent.mouseEnter(hoverZone!)
      })
      expect(screen.getByRole('link', { name: /use this template/i })).toBeInTheDocument()

      // Mouse leave - hide button
      await act(async () => {
        fireEvent.mouseLeave(hoverZone!)
      })
      expect(screen.queryByRole('link', { name: /use this template/i })).not.toBeInTheDocument()
    })
  })

  describe('Navigation dots', () => {
    it('should render 4 navigation dots', () => {
      renderWithProviders(<DemoSection />)

      const dots = screen.getAllByRole('button', { name: /view .* invoice/i })
      expect(dots).toHaveLength(4)
    })

    it('should navigate to specific invoice on dot click', async () => {
      renderWithProviders(<DemoSection />)

      // Click on third dot (Optimism - index 2)
      const dots = screen.getAllByRole('button', { name: /view .* invoice/i })

      await act(async () => {
        fireEvent.click(dots[2]!)
      })

      expect(screen.getByText('Marketing Campaign')).toBeInTheDocument()
    })

    it('should navigate to fourth invoice (Polygon)', async () => {
      renderWithProviders(<DemoSection />)

      // Click on fourth dot (Polygon - index 3)
      const dots = screen.getAllByRole('button', { name: /view .* invoice/i })

      await act(async () => {
        fireEvent.click(dots[3]!)
      })

      expect(screen.getByText('API Integration')).toBeInTheDocument()
    })
  })

  describe('Network theme', () => {
    it('should display current network badge', () => {
      renderWithProviders(<DemoSection />)

      expect(screen.getByText('Ethereum')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on section', () => {
      renderWithProviders(<DemoSection />)

      const section = document.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'demo-heading')
    })

    it('should have aria-labels on navigation dots', () => {
      renderWithProviders(<DemoSection />)

      const dots = screen.getAllByRole('button')
      dots.forEach((dot) => {
        expect(dot).toHaveAttribute('aria-label')
      })
    })
  })
})
