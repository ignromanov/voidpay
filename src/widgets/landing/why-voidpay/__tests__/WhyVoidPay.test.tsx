/**
 * WhyVoidPay Tests
 * Feature: 012-landing-page
 * User Story: US3 (Feature Discovery)
 *
 * Tests for the WhyVoidPay section which displays TOP 3 feature cards.
 * The component now shows only the 3 most important features:
 * - Zero Storage, Zero Risk (no-database)
 * - One-Click Payments (instant)
 * - Multi-Chain Native (multichain)
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { WhyVoidPay } from '../WhyVoidPay'

describe('WhyVoidPay', () => {
  describe('T022-test: Feature cards rendering', () => {
    it('should render 3 top feature cards', () => {
      render(<WhyVoidPay />)

      // TOP 3 features based on TOP_FEATURES array
      expect(screen.getByText('Zero Storage, Zero Risk')).toBeInTheDocument()
      expect(screen.getByText('One-Click Payments')).toBeInTheDocument()
      expect(screen.getByText('Multi-Chain Native')).toBeInTheDocument()
    })

    it('should render feature descriptions', () => {
      render(<WhyVoidPay />)

      expect(screen.getByText(/nothing to steal/i)).toBeInTheDocument()
      expect(screen.getByText(/connects wallet, pays/i)).toBeInTheDocument()
      expect(screen.getByText(/Ethereum, Arbitrum, Optimism/i)).toBeInTheDocument()
    })
  })

  describe('Section structure', () => {
    it('should render section heading', () => {
      render(<WhyVoidPay />)

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      // SEO-optimized heading
      expect(screen.getByText('Why Choose VoidPay for Crypto Invoicing')).toBeInTheDocument()
    })

    it('should render 3 cards with backdrop blur', () => {
      const { container } = render(<WhyVoidPay />)

      // Should have 3 Card components (with backdrop-blur)
      const cards = container.querySelectorAll('[class*="backdrop-blur"]')
      expect(cards.length).toBe(3)
    })
  })

  describe('Responsive grid', () => {
    it('should have responsive grid classes', () => {
      const { container } = render(<WhyVoidPay />)

      // Find the grid container
      const grid = container.querySelector('[class*="grid"]')
      expect(grid?.className).toContain('grid-cols-1')
      expect(grid?.className).toContain('md:grid-cols-3')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on section', () => {
      render(<WhyVoidPay />)

      const section = document.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'why-voidpay-heading')
    })

    it('should have aria-hidden on icons', () => {
      const { container } = render(<WhyVoidPay />)

      const icons = container.querySelectorAll('svg[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('T023-test: Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<WhyVoidPay />)
      expect(container).toMatchSnapshot()
    })
  })
})
