/**
 * LineItemsTable Component Tests
 *
 * All rates are in atomic units (e.g., $1000 with 6 decimals = "1000000000")
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LineItemsTable } from '../LineItemsTable'

describe('LineItemsTable', () => {
  // Rates in atomic units (6 decimals for USDC)
  // $1000 = 1000 * 1e6 = 1000000000
  // $500 = 500 * 1e6 = 500000000
  const mockItems = [
    { description: 'Consulting', quantity: 1, rate: '1000000000' }, // $1000
    { description: 'Design', quantity: 2, rate: '500000000' }, // $500 x 2 = $1000
  ]

  it('renders table headers', () => {
    render(<LineItemsTable items={mockItems} />)
    expect(screen.getByText(/DESCRIPTION/i)).toBeDefined()
    expect(screen.getByText(/QTY/i)).toBeDefined()
    expect(screen.getByText(/RATE/i)).toBeDefined()
    expect(screen.getByText(/AMOUNT/i)).toBeDefined()
  })

  it('renders all items', () => {
    render(<LineItemsTable items={mockItems} />)
    expect(screen.getByText('Consulting')).toBeDefined()
    expect(screen.getByText('Design')).toBeDefined()
  })

  it('calculates and renders amounts correctly', () => {
    render(<LineItemsTable items={mockItems} />)
    // Both items have $1000 line total (1 × $1000 and 2 × $500)
    expect(screen.getAllByText(/1,000.00/).length).toBeGreaterThanOrEqual(2)
  })

  it('renders empty state when items array is empty', () => {
    render(<LineItemsTable items={[]} />)
    expect(screen.getByText(/No line items/i)).toBeDefined()
  })

  it('handles invalid quantity gracefully', () => {
    const invalidItems = [
      {
        description: 'Item with invalid qty',
        quantity: 'invalid' as unknown as number,
        rate: '100000000', // $100 in atomic units
      },
    ]
    render(<LineItemsTable items={invalidItems} />)
    // Invalid quantity should result in 0.00 amount
    expect(screen.getByText('0.00')).toBeDefined()
  })

  it('handles invalid rate gracefully', () => {
    const invalidItems = [{ description: 'Item with invalid rate', quantity: 1, rate: 'invalid' }]
    render(<LineItemsTable items={invalidItems} />)
    // Invalid rate should result in 0.00 in both rate and amount columns
    expect(screen.getAllByText('0.00').length).toBeGreaterThanOrEqual(2)
  })

  it('handles string quantity correctly', () => {
    const stringQtyItems = [
      { description: 'Item', quantity: '2.5' as unknown as number, rate: '100000000' }, // $100 x 2.5 = $250
    ]
    render(<LineItemsTable items={stringQtyItems} />)
    // 2.5 * $100 = $250
    expect(screen.getByText('250.00')).toBeDefined()
  })
})
