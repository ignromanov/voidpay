import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LineItemsTable } from '../LineItemsTable'

describe('LineItemsTable', () => {
  const mockItems = [
    { d: 'Consulting', q: 1, r: '1000' },
    { d: 'Design', q: 2, r: '500' },
  ]

  it('renders table headers', () => {
    render(<LineItemsTable items={mockItems} currency="USDC" />)
    expect(screen.getByText(/DESCRIPTION/i)).toBeDefined()
    expect(screen.getByText(/QTY/i)).toBeDefined()
    expect(screen.getByText(/RATE/i)).toBeDefined()
    expect(screen.getByText(/AMOUNT/i)).toBeDefined()
  })

  it('renders all items', () => {
    render(<LineItemsTable items={mockItems} currency="USDC" />)
    expect(screen.getByText('Consulting')).toBeDefined()
    expect(screen.getByText('Design')).toBeDefined()
  })

  it('calculates and renders amounts correctly', () => {
    render(<LineItemsTable items={mockItems} currency="USDC" />)
    expect(screen.getAllByText(/1,000.00/).length).toBeGreaterThanOrEqual(2)
  })
})
