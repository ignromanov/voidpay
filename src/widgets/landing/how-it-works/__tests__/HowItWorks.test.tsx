/**
 * HowItWorks Tests
 * Feature: 012-landing-page
 * User Story: US3 (Feature Discovery)
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HowItWorks } from '../HowItWorks'

describe('HowItWorks', () => {
  describe('T021-test: Workflow steps rendering', () => {
    it('should render 3 workflow steps', () => {
      render(<HowItWorks />)
      
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Share')).toBeInTheDocument()
      expect(screen.getByText('Get Paid')).toBeInTheDocument()
    })

    it('should display step numbers 1, 2, 3', () => {
      render(<HowItWorks />)
      
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should render step descriptions', () => {
      render(<HowItWorks />)
      
      expect(screen.getByText(/fill in invoice details/i)).toBeInTheDocument()
      expect(screen.getByText(/copy the generated url/i)).toBeInTheDocument()
      expect(screen.getByText(/client opens the link/i)).toBeInTheDocument()
    })
  })

  describe('Section structure', () => {
    it('should render section heading', () => {
      render(<HowItWorks />)
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByText('How It Works')).toBeInTheDocument()
    })

    it('should render 3 cards', () => {
      const { container } = render(<HowItWorks />)
      
      // Should have 3 Card components (glass variant)
      const cards = container.querySelectorAll('[class*="backdrop-blur"]')
      expect(cards.length).toBe(3)
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on section', () => {
      render(<HowItWorks />)
      
      const section = document.querySelector('section')
      expect(section).toHaveAttribute('aria-labelledby', 'how-it-works-heading')
    })
  })

  describe('T023-test: Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<HowItWorks />)
      expect(container).toMatchSnapshot()
    })
  })
})
