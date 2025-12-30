import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InvoicePaper } from '../ui/InvoicePaper'
import type { Invoice } from '@/entities/invoice'

describe('InvoicePaper Preview Mode', () => {
  it('renders placeholder for empty items', () => {
    const emptyData = {
      from: { name: 'Alice', walletAddress: '0x1' },
      client: { name: 'Bob', walletAddress: '0x2' },
      items: [],
      currency: 'USDC',
    } as unknown as Invoice
    render(<InvoicePaper data={emptyData} />)
    expect(screen.getByText(/No line items/i)).toBeDefined()
  })

  it('renders default values for missing data', () => {
    const minimalData = {
      from: { name: 'Alice' },
      client: { name: 'Bob' },
    } as unknown as Invoice
    render(<InvoicePaper data={minimalData} />)
    expect(screen.getByText(/Alice/i)).toBeDefined()
    expect(screen.getByText(/Bob/i)).toBeDefined()
    // Multiple 0.00 values appear (subtotal and total)
    expect(screen.getAllByText(/0\.00/).length).toBeGreaterThanOrEqual(1)
  })

  it('handles optional notes', () => {
    const minimalData = {
      from: { name: 'Alice' },
      client: { name: 'Bob' },
    } as unknown as Invoice
    render(<InvoicePaper data={minimalData} />)
    expect(screen.getByText(/Thank you for your business/i)).toBeDefined()
  })
})
