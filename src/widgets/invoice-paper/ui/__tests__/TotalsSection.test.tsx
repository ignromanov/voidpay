/**
 * TotalsSection Component Tests
 * Tests for invoice totals display
 *
 * All amounts are formatted strings (e.g., "1,000.00" not 1000)
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TotalsSection } from '../TotalsSection'
import type { Totals } from '../../lib/calculate-totals'

describe('TotalsSection', () => {
  const baseTotals: Totals = {
    subtotal: '1,000.00',
    taxAmount: '0.00',
    discountAmount: '0.00',
    total: '1,000.00',
    magicDust: null,
  }

  describe('Basic rendering', () => {
    it('renders subtotal', () => {
      render(<TotalsSection totals={baseTotals} />)

      expect(screen.getByText('Subtotal')).toBeInTheDocument()
      // Use getAllByText since amount appears in both subtotal and total
      const amounts = screen.getAllByText('1,000.00')
      expect(amounts.length).toBeGreaterThan(0)
    })

    it('renders total', () => {
      render(<TotalsSection totals={baseTotals} />)

      expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('displays currency symbol', () => {
      render(<TotalsSection totals={baseTotals} currency="USDC" />)

      const usdcElements = screen.getAllByText('USDC')
      expect(usdcElements.length).toBeGreaterThan(0)
    })

    it('shows TOKEN placeholder when no currency', () => {
      render(<TotalsSection totals={baseTotals} />)

      const tokenElements = screen.getAllByText('TOKEN')
      expect(tokenElements.length).toBeGreaterThan(0)
    })
  })

  describe('Tax display', () => {
    it('shows tax row when taxAmount > 0', () => {
      const totals: Totals = {
        ...baseTotals,
        taxAmount: '100.00',
        total: '1,100.00',
      }
      render(<TotalsSection totals={totals} />)

      expect(screen.getByText('Tax')).toBeInTheDocument()
      expect(screen.getByText('+100.00')).toBeInTheDocument()
    })

    it('shows tax percentage label when provided', () => {
      const totals: Totals = {
        ...baseTotals,
        taxAmount: '100.00',
        total: '1,100.00',
      }
      render(<TotalsSection totals={totals} taxPercent="10%" />)

      expect(screen.getByText('Tax (10%)')).toBeInTheDocument()
    })

    it('hides tax row when taxAmount is 0', () => {
      render(<TotalsSection totals={baseTotals} />)

      expect(screen.queryByText('Tax')).not.toBeInTheDocument()
    })

    it('has accessible label for tax amount', () => {
      const totals: Totals = {
        ...baseTotals,
        taxAmount: '100.00',
        total: '1,100.00',
      }
      render(<TotalsSection totals={totals} currency="USDC" />)

      expect(screen.getByLabelText(/plus 100.00 usdc tax/i)).toBeInTheDocument()
    })
  })

  describe('Discount display', () => {
    it('shows discount row when discountAmount > 0', () => {
      const totals: Totals = {
        ...baseTotals,
        discountAmount: '50.00',
        total: '950.00',
      }
      render(<TotalsSection totals={totals} />)

      expect(screen.getByText('Discount')).toBeInTheDocument()
      expect(screen.getByText('-50.00')).toBeInTheDocument()
    })

    it('shows discount percentage label when provided', () => {
      const totals: Totals = {
        ...baseTotals,
        discountAmount: '50.00',
        total: '950.00',
      }
      render(<TotalsSection totals={totals} discountPercent="5%" />)

      expect(screen.getByText('Discount (5%)')).toBeInTheDocument()
    })

    it('hides discount row when discountAmount is 0', () => {
      render(<TotalsSection totals={baseTotals} />)

      expect(screen.queryByText('Discount')).not.toBeInTheDocument()
    })

    it('has accessible label for discount amount', () => {
      const totals: Totals = {
        ...baseTotals,
        discountAmount: '50.00',
        total: '950.00',
      }
      render(<TotalsSection totals={totals} currency="USDC" />)

      expect(screen.getByLabelText(/minus 50.00 usdc discount/i)).toBeInTheDocument()
    })
  })

  describe('Magic Dust display', () => {
    it('shows magic dust when present and enabled', () => {
      const totals: Totals = {
        ...baseTotals,
        magicDust: '0.000042',
        total: '1,000.000042',
      }
      render(<TotalsSection totals={totals} showMagicDust={true} />)

      expect(screen.getByText('Unique Amount:')).toBeInTheDocument()
      expect(screen.getByText('0.000042')).toBeInTheDocument()
    })

    it('hides magic dust when showMagicDust is false', () => {
      const totals: Totals = {
        ...baseTotals,
        magicDust: '0.000042',
        total: '1,000.000042',
      }
      render(<TotalsSection totals={totals} showMagicDust={false} />)

      expect(screen.queryByText('Unique Amount:')).not.toBeInTheDocument()
    })

    it('hides magic dust when magicDust is null', () => {
      render(<TotalsSection totals={baseTotals} showMagicDust={true} />)

      expect(screen.queryByText('Unique Amount:')).not.toBeInTheDocument()
    })

    it('shows magic dust by default (showMagicDust defaults to true)', () => {
      const totals: Totals = {
        ...baseTotals,
        magicDust: '0.000042',
        total: '1,000.000042',
      }
      render(<TotalsSection totals={totals} />)

      expect(screen.getByText('Unique Amount:')).toBeInTheDocument()
    })
  })

  describe('Complex calculations', () => {
    it('displays correct totals with tax and discount', () => {
      const totals: Totals = {
        subtotal: '1,000.00',
        taxAmount: '100.00',
        discountAmount: '50.00',
        total: '1,050.00',
        magicDust: null,
      }
      render(
        <TotalsSection totals={totals} currency="USDC" taxPercent="10%" discountPercent="5%" />
      )

      expect(screen.getByText('1,000.00')).toBeInTheDocument() // subtotal
      expect(screen.getByText('+100.00')).toBeInTheDocument() // tax
      expect(screen.getByText('-50.00')).toBeInTheDocument() // discount
      expect(screen.getByText('1,050.00')).toBeInTheDocument() // total
    })
  })
})
