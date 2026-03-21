import { render, screen } from '@testing-library/react'
import { InvoiceSummary } from '../InvoiceSummary'

const mockInvoice = {
  invoiceId: 'INV-042',
  currency: 'USDC',
  networkId: 42161, // Arbitrum
  decimals: 6,
  total: '1250000000', // 1250 USDC in atomic units
} as any

describe('InvoiceSummary', () => {
  it('displays formatted amount and currency', () => {
    render(<InvoiceSummary invoice={mockInvoice} />)
    expect(screen.getByText(/1,250/)).toBeInTheDocument()
    expect(screen.getByText(/USDC/)).toBeInTheDocument()
  })

  it('displays network name', () => {
    render(<InvoiceSummary invoice={mockInvoice} />)
    expect(screen.getByText(/Arbitrum/)).toBeInTheDocument()
  })

  it('displays invoice ID', () => {
    render(<InvoiceSummary invoice={mockInvoice} />)
    expect(screen.getByText('INV-042')).toBeInTheDocument()
  })
})
