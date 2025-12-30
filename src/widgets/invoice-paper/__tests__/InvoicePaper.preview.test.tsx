import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InvoicePaper } from '../ui/InvoicePaper'
import type { InvoiceSchemaV1 } from '@/entities/invoice'

describe('InvoicePaper Preview Mode', () => {
  it('renders placeholder for empty items', () => {
    const emptyData = {
      f: { n: 'Alice', a: '0x1' },
      c: { n: 'Bob', a: '0x2' },
      it: [],
      cur: 'USDC',
    } as unknown as InvoiceSchemaV1
    render(<InvoicePaper data={emptyData} />)
    expect(screen.getByText(/No line items/i)).toBeDefined()
  })

  it('renders default values for missing data', () => {
    const minimalData = {
      f: { n: 'Alice' },
      c: { n: 'Bob' },
    } as unknown as InvoiceSchemaV1
    render(<InvoicePaper data={minimalData} />)
    expect(screen.getByText(/Alice/i)).toBeDefined()
    expect(screen.getByText(/Bob/i)).toBeDefined()
    // Multiple 0.00 values appear (subtotal and total)
    expect(screen.getAllByText(/0\.00/).length).toBeGreaterThanOrEqual(1)
  })

  it('handles optional notes', () => {
    const minimalData = {
      f: { n: 'Alice' },
      c: { n: 'Bob' },
    } as unknown as InvoiceSchemaV1
    render(<InvoicePaper data={minimalData} />)
    expect(screen.getByText(/Thank you for your business/i)).toBeDefined()
  })
})
