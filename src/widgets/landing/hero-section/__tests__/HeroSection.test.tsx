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

    it('should display "Get Paid in Crypto" headline', () => {
      render(<HeroSection />)

      expect(screen.getByText(/Get Paid in Crypto/)).toBeInTheDocument()
    })

    it('should display aurora text "Just Send a Link"', () => {
      render(<HeroSection />)

      expect(screen.getByText(/Just Send a Link/)).toBeInTheDocument()
    })
  })

  describe('T013-test: Open Source badge', () => {
    it('should display the Open Source badge', () => {
      render(<HeroSection />)

      expect(screen.getByText(/Open Source.*Zero Tracking/)).toBeInTheDocument()
    })
  })

  describe('T017-test: Primary CTA button', () => {
    it('should render "Create Your Invoice" CTA button', () => {
      render(<HeroSection />)

      // Check button text exists
      expect(screen.getByText(/Create Your Invoice/i)).toBeInTheDocument()
    })

    it('should show "No signup" reassurance text', () => {
      render(<HeroSection />)

      expect(screen.getByText(/No signup.*30 seconds/i)).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should render value proposition', () => {
      render(<HeroSection />)

      // Main value proposition - SEO: stateless web3 invoicing
      expect(screen.getByText(/Stateless web3 invoicing/i)).toBeInTheDocument()
      expect(screen.getByText(/no servers, no accounts, no tracking/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on section', () => {
      render(<HeroSection />)

      const section = document.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'hero-heading')
    })
  })

  describe('Scroll indicator', () => {
    it('should render scroll indicator', () => {
      render(<HeroSection />)

      expect(screen.getByText('Scroll')).toBeInTheDocument()
    })
  })
})
