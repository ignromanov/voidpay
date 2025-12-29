import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InvoicePaper } from '../ui/InvoicePaper'
import { InvoiceSchemaV1 } from '@/entities/invoice'

describe('InvoicePaper Integration', () => {
  const mockData: Partial<InvoiceSchemaV1> = {
    id: 'INV-2024-001',
    iss: 1735296000, // Dec 27
    due: 1735382400, // Dec 28
    f: { n: 'Alice', a: '0xSender' },
    c: { n: 'Bob', a: '0xRecipient' },
    it: [{ d: 'Web Design', q: 1, r: '1500' }],
    cur: 'USDC',
    net: 1,
  }

  it('renders all core sections', () => {
    render(<InvoicePaper data={mockData} />)

    // Header
    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('#INV-2024-001')).toBeDefined()

    // Party Info
    expect(screen.getByText('Bob')).toBeDefined()
    expect(screen.getByText(/BILL TO/i)).toBeDefined()

    // Payment Info section (integrated into totals)
    expect(screen.getByText(/Payment Info/i)).toBeDefined()

    // Items
    expect(screen.getByText('Web Design')).toBeDefined()

    // Totals
    expect(screen.getAllByText(/1,500\.00/).length).toBeGreaterThanOrEqual(2)

    // Footer
    expect(screen.getByText(/Powered by/i)).toBeDefined()
  })

  it('renders watermark for paid status', () => {
    render(<InvoicePaper data={mockData} status="paid" />)
    expect(screen.getByText('PAID')).toBeDefined()
  })
})
