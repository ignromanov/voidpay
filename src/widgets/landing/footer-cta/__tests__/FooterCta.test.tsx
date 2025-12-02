/**
 * FooterCta Tests
 * Feature: 012-landing-page
 * User Story: US2 (Convert Interest to Action)
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock next/link
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
        return <button {...props}>{children.props.children}</button>
      }
      return <button {...props}>{children}</button>
    }),
  }
})

import { FooterCta } from '../FooterCta'

describe('FooterCta', () => {
  describe('T018-test: Secondary CTA rendering', () => {
    it('should render "Create Free Invoice" CTA button', () => {
      render(<FooterCta />)

      expect(screen.getByText(/create free invoice/i)).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should render call-to-action heading', () => {
      render(<FooterCta />)

      const heading = document.querySelector('h2')
      expect(heading).toBeInTheDocument()
      expect(screen.getByText(/ready to invoice/i)).toBeInTheDocument()
    })

    it('should render supporting text', () => {
      render(<FooterCta />)

      expect(screen.getByText(/no account required/i)).toBeInTheDocument()
    })

    it('should render "Free forever" disclaimer', () => {
      render(<FooterCta />)

      expect(screen.getByText(/free forever/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on section', () => {
      render(<FooterCta />)

      const section = document.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'footer-cta-heading')
    })
  })
})
