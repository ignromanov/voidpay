/**
 * HeroSection Tests
 * Feature: 012-landing-page
 * User Story: US1 (First Impression), US2 (CTA)
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  }
})

// Mock next/link with forwardRef for Radix Slot compatibility
vi.mock('next/link', () => ({
  default: vi.fn().mockImplementation(({ children }) => children),
}))

// Mock the Button component to avoid Radix Slot issues in tests
vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual('@/shared/ui')
  return {
    ...actual,
    Button: vi.fn(({ children, asChild, ...props }) => {
      if (asChild) {
        // For asChild, render the child directly but add button props
        return <button {...props}>{children.props.children}</button>
      }
      return <button {...props}>{children}</button>
    }),
  }
})

import { HeroSection } from '../HeroSection'

describe('HeroSection', () => {
  describe('T012-test: Headline rendering', () => {
    it('should render the main headline with aurora text', () => {
      render(<HeroSection />)

      // The heading should exist
      const heading = document.querySelector('h1')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveAttribute('id', 'hero-heading')
    })
  })

  describe('T013-test: Network badges', () => {
    it('should display supported network badges', () => {
      render(<HeroSection />)

      expect(screen.getByText('Ethereum')).toBeInTheDocument()
      expect(screen.getByText('Arbitrum')).toBeInTheDocument()
      expect(screen.getByText('Optimism')).toBeInTheDocument()
    })

    it('should have accessible network list', () => {
      render(<HeroSection />)

      const list = screen.getByRole('list', { name: /supported networks/i })
      expect(list).toBeInTheDocument()
    })
  })

  describe('T017-test: Primary CTA button', () => {
    it('should render "Start Invoicing" CTA button', () => {
      render(<HeroSection />)

      // Check button text exists
      expect(screen.getByText(/start invoicing/i)).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should render value proposition', () => {
      render(<HeroSection />)

      // HyperText displays "No backend, no sign-up."
      expect(screen.getByText(/create crypto invoices/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on section', () => {
      render(<HeroSection />)

      const section = document.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'hero-heading')
    })
  })
})
