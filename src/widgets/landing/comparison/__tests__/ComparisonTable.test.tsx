import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ComparisonTable } from '../ComparisonTable'

describe('ComparisonTable', () => {
  describe('rendering', () => {
    it('renders section heading', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Crypto Invoice Tools Compared')).toBeInTheDocument()
    })

    it('renders subheading with competitors', () => {
      render(<ComparisonTable />)

      expect(
        screen.getByText('VoidPay vs Request Finance vs Basenode vs Traditional Invoicing')
      ).toBeInTheDocument()
    })

    it('renders table header with all providers', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Feature')).toBeInTheDocument()
      expect(screen.getByText('VoidPay')).toBeInTheDocument()
      expect(screen.getByText('Request')).toBeInTheDocument()
      expect(screen.getByText('Basenode')).toBeInTheDocument()
      expect(screen.getByText('Traditional')).toBeInTheDocument()
    })

    it('renders disclaimer text', () => {
      render(<ComparisonTable />)

      expect(
        screen.getByText(/Comparison based on public documentation as of December 2025/)
      ).toBeInTheDocument()
    })
  })

  describe('comparison features', () => {
    it('displays Sign-up Required feature', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Sign-up Required')).toBeInTheDocument()
    })

    it('displays KYC Required feature', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('KYC Required')).toBeInTheDocument()
    })

    it('displays Data Storage feature with custom values', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Data Storage')).toBeInTheDocument()
      expect(screen.getByText('None (URL)')).toBeInTheDocument()
      expect(screen.getByText('IPFS')).toBeInTheDocument()
      // Server appears twice (Basenode and Traditional)
      expect(screen.getAllByText('Server')).toHaveLength(2)
    })

    it('displays Platform Fee feature with values', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Platform Fee')).toBeInTheDocument()
      expect(screen.getByText('$0')).toBeInTheDocument()
      expect(screen.getByText('1-2%')).toBeInTheDocument()
      expect(screen.getByText('Freemium')).toBeInTheDocument()
      expect(screen.getByText('~6.6%')).toBeInTheDocument()
    })

    it('displays Free Invoices feature', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Free Invoices')).toBeInTheDocument()
      expect(screen.getByText('Unlimited')).toBeInTheDocument()
      expect(screen.getByText('12/year')).toBeInTheDocument()
    })

    it('displays Settlement Time feature', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Settlement Time')).toBeInTheDocument()
      // 'Seconds' appears for VoidPay, Request, and Basenode
      expect(screen.getAllByText('Seconds')).toHaveLength(3)
      expect(screen.getByText('3-5 days')).toBeInTheDocument()
    })

    it('displays Setup Time feature', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Setup Time')).toBeInTheDocument()
      expect(screen.getByText('30 seconds')).toBeInTheDocument()
      expect(screen.getByText('~5 minutes')).toBeInTheDocument()
      expect(screen.getByText('~2 minutes')).toBeInTheDocument()
      expect(screen.getByText('1+ day')).toBeInTheDocument()
    })

    it('displays Privacy Level feature', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Privacy Level')).toBeInTheDocument()
      expect(screen.getByText('Maximum')).toBeInTheDocument()
    })

    it('displays Works Offline feature', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Works Offline')).toBeInTheDocument()
    })

    it('displays Self-Hostable feature', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Self-Hostable')).toBeInTheDocument()
    })

    it('displays Multi-Chain feature', () => {
      render(<ComparisonTable />)

      expect(screen.getByText('Multi-Chain')).toBeInTheDocument()
    })
  })

  describe('value cells', () => {
    it('renders check icons for yes values', () => {
      const { container } = render(<ComparisonTable />)

      // Check icons have specific classes
      const checkIcons = container.querySelectorAll('.text-emerald-400')
      expect(checkIcons.length).toBeGreaterThan(0)
    })

    it('renders X icons for no values', () => {
      const { container } = render(<ComparisonTable />)

      // X icons have specific classes
      const xIcons = container.querySelectorAll('.text-red-400')
      expect(xIcons.length).toBeGreaterThan(0)
    })

    it('renders minus icons for partial values', () => {
      const { container } = render(<ComparisonTable />)

      // Minus icons have specific classes
      const minusIcons = container.querySelectorAll('.text-yellow-400')
      expect(minusIcons.length).toBeGreaterThan(0)
    })
  })

  describe('accessibility', () => {
    it('has accessible heading id', () => {
      render(<ComparisonTable />)

      const heading = screen.getByRole('heading', { name: 'Crypto Invoice Tools Compared' })
      expect(heading).toHaveAttribute('id', 'comparison-heading')
    })
  })
})
