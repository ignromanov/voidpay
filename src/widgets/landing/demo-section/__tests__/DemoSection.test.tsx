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

// Note: framer-motion is globally mocked via vitest.config.ts alias
// Global mock: useReducedMotion returns true (accessibility mode)

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
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('T027-test: Invoice paper rendering', () => {
    it('should render invoice preview card', () => {
      renderWithProviders(<DemoSection />)

      expect(screen.getAllByText(/INVOICE/i)[0]).toBeInTheDocument()
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

      expect(screen.getAllByText(/0\.50/)[0]).toBeInTheDocument()
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

      // Initially shows first invoice (Ethereum)
      expect(screen.getByText('Web Development Services')).toBeInTheDocument()

      // Fast-forward 15 seconds - should NOT rotate because reduced motion is preferred
      await act(async () => {
        vi.advanceTimersByTime(15000)
      })

      // Should STILL show first invoice (no auto-rotation in reduced motion mode)
      expect(screen.getByText('Web Development Services')).toBeInTheDocument()
    })

    it('should allow manual navigation via pagination dots', async () => {
      renderWithProviders(<DemoSection />)

      // Initially shows first invoice
      expect(screen.getByText('Web Development Services')).toBeInTheDocument()

      // Click on Arbitrum pagination dot to manually navigate
      const arbitrumDot = screen.getByRole('button', { name: /view arbitrum/i })
      await act(async () => {
        fireEvent.click(arbitrumDot)
      })

      // Should now show Arbitrum invoice
      expect(screen.getByText('Design Consultation')).toBeInTheDocument()
    })

    it('should stay on first invoice after time passes (reduced motion mode)', () => {
      renderWithProviders(<DemoSection />)

      // Fast-forward 60 seconds - no rotation should happen
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      // Should still be on first invoice
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

      expect(screen.getAllByText(/Ethereum/i)[0]).toBeInTheDocument()
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
