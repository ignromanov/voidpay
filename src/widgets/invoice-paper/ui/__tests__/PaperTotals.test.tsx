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

  const baseProps = {
    totals: mockTotals,
    currency: 'USDC',
    networkId: 1,
    senderAddress: '0x1234567890abcdef1234567890abcdef12345678',
  }

  it('renders subtotal, tax, and discount', () => {
    render(<PaperTotals {...baseProps} />)
    expect(screen.getByText('Subtotal')).toBeDefined()
    expect(screen.getByText('Tax')).toBeDefined()
    expect(screen.getByText('Discount')).toBeDefined()
  })

  it('renders formatted total', () => {
    render(<PaperTotals {...baseProps} />)
    expect(screen.getByText('1,050.00')).toBeDefined()
  })

  it('renders exact amount with magic dust', () => {
    render(<PaperTotals {...baseProps} />)
    expect(screen.getByText(/Exact: 1050\.000/)).toBeDefined()
  })

  it('renders unified payment info section with QR', () => {
    render(<PaperTotals {...baseProps} />)
    expect(screen.getByText(/Payment Info/i)).toBeDefined()
    expect(screen.getByText(/Network/i)).toBeDefined()
    expect(screen.getByText(/Token/i)).toBeDefined()
    expect(screen.getByText(/Scan to Pay/i)).toBeDefined()
  })
})
