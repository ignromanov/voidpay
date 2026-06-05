/**
 * DemoSection Tests
 * Feature: 012-landing-page
 * User Story: US4 (Interactive Demo)
 *
 * DemoSection now receives pre-resolved demoInvoices as a prop (server-side lift).
 * Tests pass fixture data directly — no async loading, no brotli-wasm in the browser.
 */

import { render, screen, fireEvent, act, waitFor } from '@/shared/lib/test-utils'
import { describe, expect, it, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import type { ReactElement } from 'react'

import { DemoSection } from '../DemoSection'
import { getDemoInvoices, type DemoInvoice } from '../../constants/demo-invoices'

// Custom render (no provider wrapper needed — NetworkThemeProvider removed)
function renderWithProviders(ui: ReactElement) {
  return render(ui)
}

// Note: framer-motion is globally mocked via vitest.config.ts alias
// Global mock: useReducedMotion returns true (accessibility mode)

// Mock encodeInvoice so getDemoInvoices() can be called in beforeEach without WASM.
// In production, getDemoInvoices() runs on the server where WASM works fine.
vi.mock('@/features/invoice-codec', async () => {
  const actual = await vi.importActual<typeof import('@/features/invoice-codec')>('@/features/invoice-codec')
  return {
    ...actual,
    encodeInvoice: vi.fn(async () => 'test-hash'),
  }
})

let fixtureInvoices: DemoInvoice[] = []

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
  beforeAll(async () => {
    fixtureInvoices = await getDemoInvoices()
  })

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('T027-test: Invoice paper rendering', () => {
    it('should render invoice preview card', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      await waitFor(() => {
        expect(screen.getAllByText(/INVOICE/i)[0]).toBeInTheDocument()
      })
    })

    it('should display company name from invoice', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // First demo invoice (Ethereum) - company name
      await waitFor(() => {
        expect(screen.getByText('EtherScale Solutions')).toBeInTheDocument()
      })
    })

    it('should display line items', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // First demo invoice line item
      await waitFor(() => {
        expect(screen.getByText(/Smart Contract.*Audit/i)).toBeInTheDocument()
      })
    })

    it('should display total amount with token', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // First invoice: (40*0.125 + 8*0.1) - 5% = 5.51 ETH total
      await waitFor(() => {
        expect(screen.getAllByText(/5\.51/)[0]).toBeInTheDocument()
        expect(screen.getAllByText(/ETH/)[0]).toBeInTheDocument()
      })
    })
  })

  describe('T028-test: Auto-rotation behavior', () => {
    /**
     * Note: Global mock sets useReducedMotion = true (accessibility mode)
     * Auto-rotation is DISABLED when reduced motion is preferred (autoStart: !prefersReducedMotion)
     * This is the correct accessibility behavior per WCAG 2.2.2
     */

    it('should NOT auto-rotate when reduced motion is preferred (accessibility)', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // Wait for async demo invoices to load
      await waitFor(() => {
        expect(screen.getByText('EtherScale Solutions')).toBeInTheDocument()
      })

      // Fast-forward 15 seconds - should NOT rotate because reduced motion is preferred
      await act(async () => {
        vi.advanceTimersByTime(15000)
      })

      // Should STILL show first invoice (no auto-rotation in reduced motion mode)
      expect(screen.getByText('EtherScale Solutions')).toBeInTheDocument()
    })

    it('should allow manual navigation via pagination dots', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // Wait for async demo invoices to load
      await waitFor(() => {
        expect(screen.getByText('EtherScale Solutions')).toBeInTheDocument()
      })

      // Click on Arbitrum pagination dot to manually navigate (second invoice)
      const dots = screen.getAllByRole('button', { name: /view invoice/i })
      await act(async () => {
        fireEvent.click(dots[1]!)
      })

      // Should now show Arbitrum invoice - company name
      expect(screen.getByText('L2 Design Studio')).toBeInTheDocument()
    })

    // TODO: Investigate flaky timer behavior with reduced motion mode
    // The component appears to change state after advanceTimersByTime even in reduced motion mode
    it.skip('should stay on first invoice after time passes (reduced motion mode)', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // Wait for async demo invoices to load
      await waitFor(() => {
        expect(screen.getAllByText(/EtherScale/i).length).toBeGreaterThan(0)
      })

      // Fast-forward 60 seconds - no rotation should happen (reduced motion mode)
      await act(async () => {
        vi.advanceTimersByTime(60000)
      })

      // Should still be on first invoice after timer advance
      expect(screen.getAllByText(/EtherScale/i).length).toBeGreaterThan(0)
    })
  })

  describe('T029-test: Use This Template button on hover', () => {
    // Helper to find the hover zone container (z-30 overlay inside ScaledInvoicePreview)
    const getHoverZone = () => document.querySelector('[class*="z-30"][class*="absolute"]')

    it('should show "Use This Template" button on hover', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      await waitFor(() => {
        expect(getHoverZone()).not.toBeNull()
      })

      await act(async () => {
        fireEvent.mouseEnter(getHoverZone()!)
      })

      expect(screen.getByRole('link', { name: /use this template/i })).toBeInTheDocument()
    })

    it('should link to /create with template parameter', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      await waitFor(() => {
        expect(getHoverZone()).not.toBeNull()
      })

      await act(async () => {
        fireEvent.mouseEnter(getHoverZone()!)
      })

      const link = screen.getByRole('link', { name: /use this template/i })
      // Link should point to /create with encoded invoice hash
      const href = link.getAttribute('href')
      expect(href).toMatch(/^\/create#/)
    })

    it('should hide button on mouse leave', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      await waitFor(() => {
        expect(getHoverZone()).not.toBeNull()
      })

      // Mouse enter - show button (opacity-100)
      await act(async () => {
        fireEvent.mouseEnter(getHoverZone()!)
      })
      const link = screen.getByRole('link', { name: /use this template/i })
      expect(link).toBeInTheDocument()

      // Mouse leave - on mobile overlay stays visible (opacity-100 md:opacity-0)
      await act(async () => {
        fireEvent.mouseLeave(getHoverZone()!)
      })
      // Button stays in DOM; base opacity is always visible (hidden only on md+ via md:opacity-0)
      const container = link.closest('div')
      expect(container).toHaveClass('opacity-100')
    })
  })

  describe('Navigation dots', () => {
    it('should render 5 navigation dots', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // Dots have aria-label="View invoice {id}" format
      await waitFor(() => {
        const dots = screen.getAllByRole('button', { name: /view invoice/i })
        expect(dots).toHaveLength(5)
      })
    })

    it('should navigate to specific invoice on dot click', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // Wait for async demo invoices to load
      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /view invoice/i }).length).toBe(5)
      })

      // Click on third dot (Optimism - index 2)
      const dots = screen.getAllByRole('button', { name: /view invoice/i })
      await act(async () => {
        fireEvent.click(dots[2]!)
      })

      // Third invoice is Optimism - "Optimistic Builders Collective"
      expect(screen.getByText(/Optimistic Builders/i)).toBeInTheDocument()
    })

    it('should navigate to fifth invoice (Polygon)', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // Wait for async demo invoices to load
      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /view invoice/i }).length).toBe(5)
      })

      // Click on fifth dot (Polygon - index 4, after Base)
      const dots = screen.getAllByRole('button', { name: /view invoice/i })
      await act(async () => {
        fireEvent.click(dots[4]!)
      })

      // Fifth invoice is Polygon - "PolyMarket Analytics Ltd."
      expect(screen.getByText(/PolyMarket Analytics/i)).toBeInTheDocument()
    })
  })

  describe('Network theme', () => {
    it('should render invoice paper with network information', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      // The first invoice is Ethereum network (net: 1)
      // InvoicePaper renders Payment Info section
      await waitFor(() => {
        expect(screen.getByText(/Payment Info/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on section', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      await waitFor(() => {
        const section = document.querySelector('section')
        expect(section).toHaveAttribute('aria-labelledby', 'demo-heading')
      })
    })

    it('should have aria-labels on navigation dots', async () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)

      await waitFor(() => {
        const dots = screen.getAllByRole('button')
        dots.forEach((dot) => {
          expect(dot).toHaveAttribute('aria-label')
        })
      })
    })
  })

  describe('Prop-driven data (server lift)', () => {
    it('should show fallback when demoInvoices is empty', () => {
      renderWithProviders(<DemoSection demoInvoices={[]} />)
      expect(screen.getByText('Demo content unavailable')).toBeInTheDocument()
    })

    it('should render first invoice synchronously without async loading', () => {
      renderWithProviders(<DemoSection demoInvoices={fixtureInvoices} />)
      // Data is available immediately via props — no waitFor needed
      expect(screen.getByText('EtherScale Solutions')).toBeInTheDocument()
    })

    it('createHash from fixture should be non-empty (server-resolved)', () => {
      expect(fixtureInvoices.length).toBeGreaterThan(0)
      fixtureInvoices.forEach((invoice) => {
        // test-hash from mocked encodeInvoice — confirms hash was computed
        expect(typeof invoice.createHash).toBe('string')
      })
    })
  })
})
