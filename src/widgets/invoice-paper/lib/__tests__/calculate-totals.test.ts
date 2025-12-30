import { describe, it, expect } from 'vitest'
import { calculateTotals } from '../calculate-totals'

describe('calculateTotals', () => {
  it('calculates basic subtotal correctly', () => {
    const items = [
      { description: 'Item 1', quantity: 2, rate: '100' },
      { description: 'Item 2', quantity: 1, rate: '50' },
    ]
    const result = calculateTotals(items)
    expect(result.subtotal).toBe(250)
    expect(result.total).toBe(250.000001) // with magic dust
  })

  it('handles percentage tax correctly', () => {
    const items = [{ description: 'Item 1', quantity: 1, rate: '100' }]
    const result = calculateTotals(items, { tax: '10%' })
    expect(result.subtotal).toBe(100)
    expect(result.taxAmount).toBe(10)
    expect(result.total).toBe(110.000001)
  })

  it('handles fixed tax correctly', () => {
    const items = [{ description: 'Item 1', quantity: 1, rate: '100' }]
    const result = calculateTotals(items, { tax: '5' })
    expect(result.subtotal).toBe(100)
    expect(result.taxAmount).toBe(5)
    expect(result.total).toBe(105.000001)
  })

  it('handles percentage discount correctly', () => {
    const items = [{ description: 'Item 1', quantity: 1, rate: '100' }]
    const result = calculateTotals(items, { discount: '20%' })
    expect(result.subtotal).toBe(100)
    expect(result.discountAmount).toBe(20)
    expect(result.total).toBe(80.000001)
  })

  it('handles both tax and discount correctly', () => {
    const items = [{ description: 'Item 1', quantity: 1, rate: '100' }]
    const result = calculateTotals(items, { tax: '10%', discount: '10' }) // 100 - 10 + 10 = 100
    expect(result.subtotal).toBe(100)
    expect(result.taxAmount).toBe(10)
    expect(result.discountAmount).toBe(10)
    expect(result.total).toBe(100.000001)
  })

  it('handles empty items', () => {
    const result = calculateTotals([])
    expect(result.subtotal).toBe(0)
    expect(result.total).toBe(0) // No magic dust for 0 total
  })
})
