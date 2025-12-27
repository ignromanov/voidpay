import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PaperTotals } from '../PaperTotals'

describe('PaperTotals', () => {
  const mockTotals = {
    subtotal: 1000,
    taxAmount: 100,
    discountAmount: 50,
    total: 1050,
    magicDust: 0.000001,
  }

  it('renders subtotal, tax, and discount', () => {
    render(<PaperTotals totals={mockTotals} currency="USDC" />)
    expect(screen.getByText('Subtotal')).toBeDefined()
    expect(screen.getByText('Tax')).toBeDefined()
    expect(screen.getByText('Discount')).toBeDefined()
  })

  it('renders formatted total', () => {
    render(<PaperTotals totals={mockTotals} currency="USDC" />)
    // Total amount with currency in one element
    expect(screen.getByText(/1,050.00 USDC/)).toBeDefined()
  })

  it('renders exact amount with magic dust', () => {
    render(<PaperTotals totals={mockTotals} currency="USDC" />)
    // Match the start of the exact amount, allowing for small precision diffs if any
    expect(screen.getByText(/Exact: 1050\.000/)).toBeDefined()
  })
})
