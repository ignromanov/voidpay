import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PaperHeader } from '../PaperHeader'

describe('PaperHeader', () => {
  const mockDate = 1735296000 // Dec 27, 2024 12:00:00 UTC

  it('renders invoice label', () => {
    render(<PaperHeader invoiceId="INV-123" iss={mockDate} due={mockDate} status="pending" />)
    expect(screen.getAllByText(/Invoice/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders invoice ID correctly', () => {
    render(<PaperHeader invoiceId="INV-123" iss={mockDate} due={mockDate} status="pending" />)
    expect(screen.getByText('INV-123')).toBeDefined()
  })

  it('renders formatted dates', () => {
    render(<PaperHeader invoiceId="INV-123" iss={mockDate} due={mockDate} status="pending" />)
    // Allow for small differences in formatting but expect DEC 27
    expect(screen.getAllByText(/DEC 27/i).length).toBeGreaterThanOrEqual(2)
  })

  it('renders status badge when not pending', () => {
    render(<PaperHeader invoiceId="INV-123" iss={mockDate} due={mockDate} status="paid" />)
    expect(screen.getByText(/paid/i)).toBeDefined()
  })
})
