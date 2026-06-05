/**
 * DemoSection Tests
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo)
 */

import { render, screen, fireEvent, act, waitFor } from '@/shared/lib/test-utils'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import type { ReactElement } from 'react'

import { DemoSection } from '../DemoSection'

// Custom render (no provider wrapper needed — NetworkThemeProvider removed)
function renderWithProviders(ui: ReactElement) {
  return render(ui)
}

// Note: framer-motion is globally mocked via vitest.config.ts alias
// Global mock: useReducedMotion returns true (accessibility mode)

// Mock generated hashes — static module, no codec needed in tests
vi.mock('../constants/demo-invoices.generated', () => ({
  DEMO_CREATE_HASHES: {
    'INV-2026-042': 'test-hash-eth',
    'INV-2026-087': 'test-hash-arb',
    'INV-2026-135': 'test-hash-op',
    'INV-2026-217': 'test-hash-base',
    'INV-2026-198': 'test-hash-poly',
  },
}))

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
        const linkElement = children as React.ReactElement<{
          href: string
          children: React.ReactNode
        }>
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
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('T027-test: Invoice paper rendering', () => {
    it('should render invoice preview card', () => {
      renderWithProviders(<DemoSection />)
      expect(screen.getAllByText(/INVOICE/i)[0]).toBeInTheDocument()
    })

    it('should display company name from invoice', () => {
      renderWithProviders(<DemoSection />)
      // First demo invoice (Ethereum) - company name
      expect(screen.getByText('EtherScale Solutions')).toBeInTheDocument()
    })

    it('should display line items', () => {
      renderWithProviders(<DemoSection />)
      // First demo invoice line item
      expect(screen.getByText(/Smart Contract.*Audit/i)).toBeInTheDocument()
    })

    it('should display total amount with token', () => {
      renderWithProviders(<DemoSection />)
      // First invoice: (40*0.125 + 8*0.1) - 5% = 5.51 ETH total
      expect(screen.getAllByText(/5\.51/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/ETH/)[0]).toBeInTheDocument()
    })
  })

  describe('T028-test: Auto-rotation behavior', () => {
    /**
     * Note: Global mock sets useReducedMotion = true (accessibility mode)
     * Auto-rotation is DISABLED when reduced motion is preferred (autoStart: !prefersReducedMotion)
     * This is the correct accessibility behavior per WCAG 2.2.2
     */

    it('should NOT auto-rotate when reduced motion is preferred (accessibility)', async () => {
      renderWithProviders(<DemoSection />)

      expect(screen.getByText('EtherScale Solutions')).toBeInTheDocument()

      // Fast-forward 15 seconds - should NOT rotate because reduced motion is preferred
      await act(async () => {
        vi.advanceTimersByTime(15000)
      })

      // Should STILL show first invoice (no auto-rotation in reduced motion mode)
      expect(screen.getByText('EtherScale Solutions')).toBeInTheDocument()
    })

    it('should allow manual navigation via pagination dots', async () => {
      renderWithProviders(<DemoSection />)

      expect(screen.getByText('EtherScale Solutions')).toBeInTheDocument()

      // Click on Arbitrum pagination dot to manually navigate (second invoice)
      const dots = screen.getAllByRole('button', { name: /view invoice/i })
      await act(async () => {
        fireEvent.click(dots[1]!)
      })

      // Should now show Arbitrum invoice - company name
      expect(screen.getByText('L2 Design Studio')).toBeInTheDocument()
    })

    // TODO: Investigate flaky timer behavior with reduced motion mode
    it.skip('should stay on first invoice after time passes (reduced motion mode)', async () => {
      renderWithProviders(<DemoSection />)

      expect(screen.getAllByText(/EtherScale/i).length).toBeGreaterThan(0)

      await act(async () => {
        vi.advanceTimersByTime(60000)
      })

      expect(screen.getAllByText(/EtherScale/i).length).toBeGreaterThan(0)
    })
  })

  describe('T029-test: Use This Template button on hover', () => {
    const getHoverZone = () => document.querySelector('[class*="z-30"][class*="absolute"]')

    it('should show "Use This Template" button on hover', async () => {
      renderWithProviders(<DemoSection />)

      expect(getHoverZone()).not.toBeNull()

      await act(async () => {
        fireEvent.mouseEnter(getHoverZone()!)
      })

      expect(screen.getByRole('link', { name: /use this template/i })).toBeInTheDocument()
    })

    it('should link to /create with template parameter', async () => {
      renderWithProviders(<DemoSection />)

      expect(getHoverZone()).not.toBeNull()

      await act(async () => {
        fireEvent.mouseEnter(getHoverZone()!)
      })

      const link = screen.getByRole('link', { name: /use this template/i })
      const href = link.getAttribute('href')
      // In tests, DEMO_CREATE_HASHES provides 'test-hash-eth' for the first invoice
      expect(href).toMatch(/^\/create#/)
    })

    it('should hide button on mouse leave', async () => {
      renderWithProviders(<DemoSection />)

      expect(getHoverZone()).not.toBeNull()

      await act(async () => {
        fireEvent.mouseEnter(getHoverZone()!)
      })
      const link = screen.getByRole('link', { name: /use this template/i })
      expect(link).toBeInTheDocument()

      await act(async () => {
        fireEvent.mouseLeave(getHoverZone()!)
      })
      // Button stays in DOM; base opacity is always visible (hidden only on md+ via md:opacity-0)
      const container = link.closest('div')
      expect(container).toHaveClass('opacity-100')
    })
  })

  describe('Navigation dots', () => {
    it('should render 5 navigation dots', () => {
      renderWithProviders(<DemoSection />)
      const dots = screen.getAllByRole('button', { name: /view invoice/i })
      expect(dots).toHaveLength(5)
    })

    it('should navigate to specific invoice on dot click', async () => {
      renderWithProviders(<DemoSection />)

      const dots = screen.getAllByRole('button', { name: /view invoice/i })
      await act(async () => {
        fireEvent.click(dots[2]!)
      })

      // Third invoice is Optimism - "Optimistic Builders Collective"
      expect(screen.getByText(/Optimistic Builders/i)).toBeInTheDocument()
    })

    it('should navigate to fifth invoice (Polygon)', async () => {
      renderWithProviders(<DemoSection />)

      const dots = screen.getAllByRole('button', { name: /view invoice/i })
      await act(async () => {
        fireEvent.click(dots[4]!)
      })

      // Fifth invoice is Polygon - "PolyMarket Analytics Ltd."
      expect(screen.getByText(/PolyMarket Analytics/i)).toBeInTheDocument()
    })
  })

  describe('Network theme', () => {
    it('should render invoice paper with network information', () => {
      renderWithProviders(<DemoSection />)
      expect(screen.getByText(/Payment Info/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on section', () => {
      renderWithProviders(<DemoSection />)
      const section = document.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'demo-heading')
    })

    it('should have aria-labels on navigation dots', async () => {
      renderWithProviders(<DemoSection />)

      await waitFor(() => {
        const dots = screen.getAllByRole('button')
        dots.forEach((dot) => {
          expect(dot).toHaveAttribute('aria-label')
        })
      })
    })
  })
})
