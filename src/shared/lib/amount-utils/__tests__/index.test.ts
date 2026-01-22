import { describe, it, expect } from 'vitest'
import {
  parseAmount,
  formatAmount,
  calculateTotalsBigInt,
  generateMagicDust,
  addMagicDust,
  type LineItemForCalc,
  type CalcOptions,
} from '../index'

describe('parseAmount', () => {
  // Edge cases
  it('should return "0" for empty string', () => {
    expect(parseAmount('', 6)).toBe('0')
  })

  it('should return "0" for whitespace-only string', () => {
    expect(parseAmount('   ', 6)).toBe('0')
    expect(parseAmount('\t\n', 6)).toBe('0')
  })

  it('should return "0" for just a dot "."', () => {
    expect(parseAmount('.', 6)).toBe('0')
  })

  it('should return "0" for invalid input like "abc"', () => {
    expect(parseAmount('abc', 6)).toBe('0')
    expect(parseAmount('12.34.56', 6)).toBe('0')
    expect(parseAmount('NaN', 6)).toBe('0')
  })

  it('should handle leading/trailing whitespace', () => {
    expect(parseAmount('  150.50  ', 6)).toBe('150500000')
    expect(parseAmount('\t1.5\n', 18)).toBe('1500000000000000000')
  })

  // Precision cases
  it('should parse "150.50" with 6 decimals correctly', () => {
    expect(parseAmount('150.50', 6)).toBe('150500000')
  })

  it('should parse "1.5" with 18 decimals correctly', () => {
    expect(parseAmount('1.5', 18)).toBe('1500000000000000000')
  })

  it('should handle very small amounts "0.000001" with 6 decimals', () => {
    expect(parseAmount('0.000001', 6)).toBe('1')
  })

  it('should handle amounts with more decimals than token supports', () => {
    // USDC has 6 decimals - viem's parseUnits rounds excess decimals
    expect(parseAmount('1.0000001', 6)).toBe('1000000') // 0.0000001 rounds to 0
    expect(parseAmount('1.0000009', 6)).toBe('1000001') // 0.0000009 rounds up to 0.000001
    expect(parseAmount('1.0000005', 6)).toBe('1000001') // 0.0000005 rounds up (banker's rounding)
  })

  // Large values
  it('should handle large amounts like "999999999.999999"', () => {
    expect(parseAmount('999999999.999999', 6)).toBe('999999999999999')
  })

  it('should handle integer amounts without decimals', () => {
    expect(parseAmount('100', 6)).toBe('100000000')
    expect(parseAmount('1', 18)).toBe('1000000000000000000')
  })

  it('should handle zero', () => {
    expect(parseAmount('0', 6)).toBe('0')
    expect(parseAmount('0.0', 6)).toBe('0')
    expect(parseAmount('0.00', 6)).toBe('0')
  })
})

describe('formatAmount', () => {
  // Basic formatting
  it('should format atomic units to human readable', () => {
    expect(formatAmount('150500000', 6)).toBe('150.50')
    expect(formatAmount('1500000000000000000', 18)).toBe('1.50')
  })

  it('should return "0.00" for empty/zero input', () => {
    expect(formatAmount('', 6)).toBe('0.00')
    expect(formatAmount('0', 6)).toBe('0.00')
  })

  it('should return "0.00" for invalid BigInt string', () => {
    expect(formatAmount('invalid', 6)).toBe('0.00')
    expect(formatAmount('12.34', 6)).toBe('0.00') // BigInt doesn't accept decimals
  })

  // Options
  it('should respect displayDecimals option', () => {
    expect(formatAmount('150500000', 6, { displayDecimals: 6 })).toBe('150.500000')
    // Note: displayDecimals sets minimum, but significant decimals are preserved
    // 150.5 has 1 significant decimal, so it shows "150.5" not "151"
    expect(formatAmount('150500000', 6, { displayDecimals: 0 })).toBe('150.5')
    expect(formatAmount('150500000', 6, { displayDecimals: 4 })).toBe('150.5000')
    // For amounts without fractional parts, displayDecimals: 0 works as expected
    expect(formatAmount('150000000', 6, { displayDecimals: 0 })).toBe('150')
  })

  it('should add thousand separators by default', () => {
    expect(formatAmount('1000000000', 6)).toBe('1,000.00')
    expect(formatAmount('1234567890000', 6)).toBe('1,234,567.89')
  })

  it('should omit thousand separators when useGrouping=false', () => {
    expect(formatAmount('1000000000', 6, { useGrouping: false })).toBe('1000.00')
    expect(formatAmount('1234567890000', 6, { useGrouping: false })).toBe('1234567.89')
  })

  // Precision
  it('should show full precision for small amounts', () => {
    // Magic Dust: 42 atomic units in USDC (6 decimals)
    expect(formatAmount('42', 6)).toContain('0.000042')
  })

  it('should support legacy signature with number as third param', () => {
    // Legacy: formatAmount(amount, decimals, displayDecimals)
    expect(formatAmount('150500000', 6, 4)).toBe('150.5000')
  })

  it('should handle very large numbers', () => {
    expect(formatAmount('999999999999999', 6)).toBe('999,999,999.999999')
  })

  it('should handle 1 atomic unit', () => {
    expect(formatAmount('1', 6)).toContain('0.000001')
    expect(formatAmount('1', 18)).toContain('0.000000000000000001')
  })
})

describe('calculateTotalsBigInt', () => {
  const USDC_DECIMALS = 6

  // Basic calculations
  it('should calculate subtotal from multiple items', () => {
    const items: LineItemForCalc[] = [
      { quantity: 2, rate: '150000000' }, // 2 × $150.00
      { quantity: 1, rate: '50000000' }, // 1 × $50.00
    ]
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.subtotal).toBe('350000000') // $350.00
    expect(result.taxAmount).toBe('0')
    expect(result.discountAmount).toBe('0')
    expect(result.total).toBe('350000000') // $350.00
  })

  it('should handle fractional quantities correctly', () => {
    const items: LineItemForCalc[] = [
      { quantity: 1.5, rate: '100000000' }, // 1.5 × $100.00
      { quantity: 0.5, rate: '200000000' }, // 0.5 × $200.00
    ]
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.subtotal).toBe('250000000') // $250.00
  })

  // Tax/Discount
  it('should apply tax percentage correctly', () => {
    const items: LineItemForCalc[] = [{ quantity: 1, rate: '100000000' }] // $100.00
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
      tax: '10', // 10%
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.subtotal).toBe('100000000') // $100.00
    expect(result.taxAmount).toBe('10000000') // $10.00
    expect(result.total).toBe('110000000') // $110.00
  })

  it('should apply discount percentage correctly', () => {
    const items: LineItemForCalc[] = [{ quantity: 1, rate: '100000000' }] // $100.00
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
      discount: '5', // 5%
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.subtotal).toBe('100000000') // $100.00
    expect(result.discountAmount).toBe('5000000') // $5.00
    expect(result.total).toBe('95000000') // $95.00
  })

  it('should handle both tax and discount together', () => {
    const items: LineItemForCalc[] = [{ quantity: 1, rate: '100000000' }] // $100.00
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
      tax: '10', // 10%
      discount: '5', // 5%
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.subtotal).toBe('100000000') // $100.00
    expect(result.taxAmount).toBe('10000000') // $10.00
    expect(result.discountAmount).toBe('5000000') // $5.00
    expect(result.total).toBe('105000000') // $105.00 = $100 + $10 - $5
  })

  it('should handle zero tax and discount', () => {
    const items: LineItemForCalc[] = [{ quantity: 1, rate: '100000000' }]
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
      tax: '0',
      discount: '0',
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.taxAmount).toBe('0')
    expect(result.discountAmount).toBe('0')
    expect(result.total).toBe('100000000')
  })

  // Edge cases
  it('should handle empty items array', () => {
    const items: LineItemForCalc[] = []
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.subtotal).toBe('0')
    expect(result.total).toBe('0')
  })

  it('should handle items with zero quantity', () => {
    const items: LineItemForCalc[] = [
      { quantity: 0, rate: '100000000' },
      { quantity: 1, rate: '50000000' },
    ]
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.subtotal).toBe('50000000') // Only second item
  })

  it('should handle items with empty rate', () => {
    const items: LineItemForCalc[] = [
      { quantity: 1, rate: '' },
      { quantity: 1, rate: '50000000' },
    ]
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.subtotal).toBe('50000000') // Only second item
  })

  it('should include raw BigInt values', () => {
    const items: LineItemForCalc[] = [{ quantity: 1, rate: '100000000' }]
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
      tax: '10',
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.raw.subtotal).toBe(BigInt(100000000))
    expect(result.raw.taxAmount).toBe(BigInt(10000000))
    expect(result.raw.total).toBe(BigInt(110000000))
  })

  it('should handle decimal percentages', () => {
    const items: LineItemForCalc[] = [{ quantity: 1, rate: '100000000' }] // $100.00
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
      tax: '7.5', // 7.5%
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.taxAmount).toBe('7500000') // $7.50
  })

  it('should handle undefined tax and discount', () => {
    const items: LineItemForCalc[] = [{ quantity: 1, rate: '100000000' }]
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
      tax: undefined,
      discount: undefined,
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.taxAmount).toBe('0')
    expect(result.discountAmount).toBe('0')
  })

  it('should handle invalid percentage strings', () => {
    const items: LineItemForCalc[] = [{ quantity: 1, rate: '100000000' }]
    const options: CalcOptions = {
      decimals: USDC_DECIMALS,
      tax: 'invalid',
      discount: 'NaN',
    }

    const result = calculateTotalsBigInt(items, options)

    expect(result.taxAmount).toBe('0')
    expect(result.discountAmount).toBe('0')
  })
})

describe('generateMagicDust', () => {
  it('should return value between 1 and 999 inclusive', () => {
    // Run multiple times to test randomness
    for (let i = 0; i < 100; i++) {
      const dust = generateMagicDust()
      expect(dust).toBeGreaterThanOrEqual(1)
      expect(dust).toBeLessThanOrEqual(999)
    }
  })

  it('should never return 0', () => {
    for (let i = 0; i < 100; i++) {
      const dust = generateMagicDust()
      expect(dust).not.toBe(0)
    }
  })

  it('should never return value > 999', () => {
    for (let i = 0; i < 100; i++) {
      const dust = generateMagicDust()
      expect(dust).toBeLessThanOrEqual(999)
    }
  })

  it('should return an integer', () => {
    for (let i = 0; i < 100; i++) {
      const dust = generateMagicDust()
      expect(Number.isInteger(dust)).toBe(true)
    }
  })
})

describe('addMagicDust', () => {
  it('should add magic dust to total', () => {
    const total = '100000000' // $100.00 in USDC
    const magicDust = 42
    const result = addMagicDust(total, magicDust)

    expect(result).toBe('100000042')
  })

  it('should handle empty total string', () => {
    const result = addMagicDust('', 42)
    expect(result).toBe('42')
  })

  it('should preserve BigInt precision', () => {
    const total = '999999999999999999' // Very large number
    const magicDust = 999
    const result = addMagicDust(total, magicDust)

    expect(result).toBe('1000000000000000998')
  })

  it('should handle zero total', () => {
    const result = addMagicDust('0', 1)
    expect(result).toBe('1')
  })

  it('should work with minimum magic dust', () => {
    const result = addMagicDust('100000000', 1)
    expect(result).toBe('100000001')
  })

  it('should work with maximum magic dust', () => {
    const result = addMagicDust('100000000', 999)
    expect(result).toBe('100000999')
  })
})
