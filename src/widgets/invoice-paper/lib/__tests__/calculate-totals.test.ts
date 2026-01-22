import { describe, it, expect } from 'vitest'
import { calculateTotals, calculateRawTotals } from '../calculate-totals'

/**
 * Tests for calculateTotals with BigInt arithmetic
 *
 * All rates are in atomic units (e.g., $100 with 6 decimals = "100000000")
 * Results are formatted strings (e.g., "250.00")
 */
describe('calculateTotals', () => {
  const decimals = 6 // USDC-like

  it('calculates basic subtotal correctly', () => {
    const items = [
      { quantity: 2, rate: '100000000' }, // $100 × 2 = $200
      { quantity: 1, rate: '50000000' }, // $50 × 1 = $50
    ]
    const result = calculateTotals({ items, decimals })
    expect(result.subtotal).toBe('250.00')
    expect(result.total).toBe('250.00')
    expect(result.magicDust).toBeNull()
  })

  it('calculates with pre-calculated total from URL', () => {
    const items = [{ quantity: 1, rate: '100000000' }]
    const result = calculateTotals({
      items,
      decimals,
      total: '100000042', // Pre-calculated total with Magic Dust
      magicDust: '42',
    })
    expect(result.subtotal).toBe('100.00')
    expect(result.total).toBe('100.000042')
    expect(result.magicDust).toBe('0.000042')
  })

  it('handles percentage tax correctly', () => {
    const items = [{ quantity: 1, rate: '100000000' }] // $100
    const result = calculateTotals({ items, decimals, tax: '10' })
    expect(result.subtotal).toBe('100.00')
    expect(result.taxAmount).toBe('10.00')
    expect(result.total).toBe('110.00')
  })

  it('handles percentage discount correctly', () => {
    const items = [{ quantity: 1, rate: '100000000' }] // $100
    const result = calculateTotals({ items, decimals, discount: '20' })
    expect(result.subtotal).toBe('100.00')
    expect(result.discountAmount).toBe('20.00')
    expect(result.total).toBe('80.00')
  })

  it('handles both tax and discount correctly', () => {
    const items = [{ quantity: 1, rate: '100000000' }] // $100
    // Tax 10% = $10, Discount 10% = $10 → Total = $100
    const result = calculateTotals({ items, decimals, tax: '10', discount: '10' })
    expect(result.subtotal).toBe('100.00')
    expect(result.taxAmount).toBe('10.00')
    expect(result.discountAmount).toBe('10.00')
    expect(result.total).toBe('100.00')
  })

  it('handles empty items', () => {
    const result = calculateTotals({ items: [], decimals })
    expect(result.subtotal).toBe('0.00')
    expect(result.total).toBe('0.00')
  })

  it('handles fractional quantities with BigInt precision', () => {
    const items = [{ quantity: 0.5, rate: '100000000' }] // $100 × 0.5 = $50
    const result = calculateTotals({ items, decimals })
    expect(result.subtotal).toBe('50.00')
    expect(result.total).toBe('50.00')
  })

  it('handles large amounts without precision loss', () => {
    // $999,999.99 in atomic units
    const items = [{ quantity: 1, rate: '999999990000' }]
    const result = calculateTotals({ items, decimals })
    expect(result.subtotal).toBe('999,999.99') // With thousand separator
    expect(result.total).toBe('999,999.99')
  })

  it('handles 18-decimal tokens (ETH-like)', () => {
    const ethDecimals = 18
    // 0.125 ETH in atomic units
    const items = [{ quantity: 40, rate: '125000000000000000' }]
    const result = calculateTotals({ items, decimals: ethDecimals })
    expect(result.subtotal).toBe('5.00')
    expect(result.total).toBe('5.00')
  })
})

describe('calculateRawTotals', () => {
  const decimals = 6

  it('returns atomic units as strings', () => {
    const items = [{ quantity: 2, rate: '100000000' }] // $100 × 2 = $200
    const result = calculateRawTotals({ items, decimals })
    expect(result.subtotal).toBe('200000000')
    expect(result.total).toBe('200000000')
  })

  it('preserves pre-calculated total from URL', () => {
    const items = [{ quantity: 1, rate: '100000000' }]
    const result = calculateRawTotals({
      items,
      decimals,
      total: '100000042',
      magicDust: '42',
    })
    expect(result.total).toBe('100000042')
    expect(result.magicDust).toBe('42')
  })
})
