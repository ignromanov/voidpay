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
    it('should render "Get Paid Now" CTA button', () => {
      render(<FooterCta />)

      expect(screen.getByText(/Get Paid Now/i)).toBeInTheDocument()
    })
  })

  describe('Content', () => {
    it('should render call-to-action heading', () => {
      render(<FooterCta />)

      const heading = document.querySelector('h2')
      expect(heading).toBeInTheDocument()
      expect(screen.getByText(/Your Invoice\./i)).toBeInTheDocument()
      expect(screen.getByText(/Your Link\./i)).toBeInTheDocument()
    })

    it('should render aurora text "Your Rules"', () => {
      render(<FooterCta />)

      expect(screen.getByText(/Your Rules/)).toBeInTheDocument()
    })

    it('should render supporting text', () => {
      render(<FooterCta />)

      expect(screen.getByText(/Ready to own your invoices/i)).toBeInTheDocument()
    })

    it('should render disclaimer', () => {
      render(<FooterCta />)

      expect(screen.getByText(/No signup.*No fees.*Just results/i)).toBeInTheDocument()
    })
  })

  describe('Social links', () => {
    it('should render GitHub link', () => {
      render(<FooterCta />)

      const githubLink = screen.getByRole('link', { name: /github/i })
      expect(githubLink).toBeInTheDocument()
    })

    it('should render Twitter link', () => {
      render(<FooterCta />)

      const twitterLink = screen.getByRole('link', { name: /twitter/i })
      expect(twitterLink).toBeInTheDocument()
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
