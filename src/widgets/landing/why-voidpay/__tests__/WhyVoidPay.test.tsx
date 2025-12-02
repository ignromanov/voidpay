/**
 * WhyVoidPay Tests
 * Feature: 012-landing-page
 * User Story: US3 (Feature Discovery)
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { WhyVoidPay } from '../WhyVoidPay'

describe('WhyVoidPay', () => {
  describe('T022-test: Feature cards rendering', () => {
    it('should render 6 feature cards', () => {
      render(<WhyVoidPay />)
      
      expect(screen.getByText('Privacy First')).toBeInTheDocument()
      expect(screen.getByText('Zero Backend')).toBeInTheDocument()
      expect(screen.getByText('Instant Setup')).toBeInTheDocument()
      expect(screen.getByText('Shareable Links')).toBeInTheDocument()
      expect(screen.getByText('Multi-Chain')).toBeInTheDocument()
      expect(screen.getByText('Self-Custody')).toBeInTheDocument()
    })

    it('should render feature descriptions', () => {
      render(<WhyVoidPay />)
      
      expect(screen.getByText(/no tracking, no analytics/i)).toBeInTheDocument()
      expect(screen.getByText(/no database, no sign-up/i)).toBeInTheDocument()
    })
  })

  describe('Section structure', () => {
    it('should render section heading', () => {
      render(<WhyVoidPay />)
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByText('Why VoidPay?')).toBeInTheDocument()
    })

    it('should render 6 cards with glass variant', () => {
      const { container } = render(<WhyVoidPay />)
      
      // Should have 6 Card components (glass variant has backdrop-blur)
      const cards = container.querySelectorAll('[class*="backdrop-blur"]')
      expect(cards.length).toBe(6)
    })
  })

  describe('Responsive grid', () => {
    it('should have responsive grid classes', () => {
      const { container } = render(<WhyVoidPay />)
      
      // Find the grid container
      const grid = container.querySelector('[class*="grid"]')
      expect(grid?.className).toContain('grid-cols-1')
      expect(grid?.className).toContain('sm:grid-cols-2')
      expect(grid?.className).toContain('lg:grid-cols-3')
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
