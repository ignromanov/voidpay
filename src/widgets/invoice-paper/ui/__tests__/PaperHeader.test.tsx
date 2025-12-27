import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PaperHeader } from '../PaperHeader'

describe('PaperHeader', () => {
  const mockFrom = { n: 'Sender Name', a: '0x123' }
  const mockDate = 1735296000 // Dec 27, 2024 12:00:00 UTC

  it('renders sender name and invoice label', () => {
    render(
      <PaperHeader
        from={mockFrom}
        invoiceId="INV-123"
        iss={mockDate}
        due={mockDate}
        status="pending"
        animated={false}
      />
    )
    expect(screen.getByText('Sender Name')).toBeDefined()
    expect(screen.getAllByText(/Invoice/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders invoice ID correctly', () => {
    render(
      <PaperHeader
        from={mockFrom}
        invoiceId="INV-123"
        iss={mockDate}
        due={mockDate}
        status="pending"
        animated={false}
      />
    )
    expect(screen.getByText('INV-123')).toBeDefined()
  })

  it('renders formatted dates', () => {
    render(
      <PaperHeader
        from={mockFrom}
        invoiceId="INV-123"
        iss={mockDate}
        due={mockDate}
        status="pending"
        animated={false}
      />
    )
    // Allow for small differences in formatting but expect DEC 27
    expect(screen.getAllByText(/DEC 27/i).length).toBeGreaterThanOrEqual(2)
  })
})
