/**
 * HowItWorks Tests
 * Feature: 012-landing-page
 * User Story: US3 (Feature Discovery)
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

      // Actual descriptions from WORKFLOW_STEPS
      expect(screen.getByText(/Add invoice details.*Pick network and token/i)).toBeInTheDocument()
      expect(screen.getByText(/Get a permanent URL.*No attachments needed/i)).toBeInTheDocument()
      expect(screen.getByText(/Client connects wallet and pays.*One click/i)).toBeInTheDocument()
    })
  })

  describe('Section structure', () => {
    it('should render section heading', () => {
      render(<HowItWorks />)

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByText('Three Steps to Get Paid')).toBeInTheDocument()
    })

    it('should render 3 timeline steps', () => {
      render(<HowItWorks />)

      // TimelineStep renders step numbers
      const stepNumbers = screen.getAllByText(/^[1-3]$/)
      expect(stepNumbers).toHaveLength(3)
    })

    it('should render subheading text', () => {
      render(<HowItWorks />)

      expect(screen.getByText(/No accounts.*No sign-ups.*Just invoices/i)).toBeInTheDocument()
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
