import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LineItemsTable } from '../LineItemsTable'

describe('LineItemsTable', () => {
  const mockItems = [
    { d: 'Consulting', q: 1, r: '1000' },
    { d: 'Design', q: 2, r: '500' },
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
    expect(screen.getAllByText(/1,000.00/).length).toBeGreaterThanOrEqual(2)
  })

  it('renders empty state when items array is empty', () => {
    render(<LineItemsTable items={[]} />)
    expect(screen.getByText(/No line items/i)).toBeDefined()
  })

  it('handles invalid quantity gracefully', () => {
    const invalidItems = [
      { d: 'Item with invalid qty', q: 'invalid' as unknown as number, r: '100' },
    ]
    render(<LineItemsTable items={invalidItems} />)
    // Invalid quantity should result in 0.00 amount
    expect(screen.getByText('0.00')).toBeDefined()
  })

  it('handles invalid rate gracefully', () => {
    const invalidItems = [{ d: 'Item with invalid rate', q: 1, r: 'invalid' }]
    render(<LineItemsTable items={invalidItems} />)
    // Invalid rate should result in 0.00 amount
    expect(screen.getByText('0.00')).toBeDefined()
  })

  it('handles string quantity correctly', () => {
    const stringQtyItems = [{ d: 'Item', q: '2.5' as unknown as number, r: '100' }]
    render(<LineItemsTable items={stringQtyItems} />)
    // 2.5 * 100 = 250
    expect(screen.getByText('250.00')).toBeDefined()
  })
})
