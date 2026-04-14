import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InvoiceStatusBadge } from '../ui/InvoiceStatusBadge'

describe('InvoiceStatusBadge', () => {
  it('renders Pending label with dot', () => {
    const { container } = render(<InvoiceStatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
    const dot = container.querySelector('[data-testid="status-dot"]')
    expect(dot).toBeInTheDocument()
  })

  it('renders Paid label', () => {
    render(<InvoiceStatusBadge status="paid" />)
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })

  it('renders Confirming label', () => {
    render(<InvoiceStatusBadge status="confirming" />)
    expect(screen.getByText('Confirming')).toBeInTheDocument()
  })

  it('renders Overdue label', () => {
    render(<InvoiceStatusBadge status="overdue" />)
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('applies pulse animation for pending status', () => {
    const { container } = render(<InvoiceStatusBadge status="pending" />)
    const dot = container.querySelector('[data-testid="status-dot"]')
    expect(dot?.className).toContain('animate-pulse')
  })

  it('does not apply pulse for paid status', () => {
    const { container } = render(<InvoiceStatusBadge status="paid" />)
    const dot = container.querySelector('[data-testid="status-dot"]')
    expect(dot?.className).not.toContain('animate-pulse')
  })
})
