/**
 * Format Utilities Tests
 * Tests for invoice amount and address formatting
 */

import { describe, it, expect } from 'vitest'
import { formatAmount, formatRate, formatShortAddress, truncateAddress } from '../format'

describe('format utilities', () => {
  describe('formatAmount', () => {
    it('formats integer numbers with 2 decimal places', () => {
      expect(formatAmount(1000)).toBe('1,000.00')
    })

    it('formats decimal numbers with 2 decimal places', () => {
      expect(formatAmount(1234.56)).toBe('1,234.56')
    })

    it('rounds to 2 decimal places', () => {
      expect(formatAmount(1234.567)).toBe('1,234.57')
    })

    it('handles zero', () => {
      expect(formatAmount(0)).toBe('0.00')
    })

    it('handles string input', () => {
      expect(formatAmount('1234.56')).toBe('1,234.56')
    })

    it('returns 0.00 for NaN string', () => {
      expect(formatAmount('not a number')).toBe('0.00')
    })

    it('returns 0.00 for empty string', () => {
      expect(formatAmount('')).toBe('0.00')
    })

    it('handles large numbers with commas', () => {
      expect(formatAmount(1234567.89)).toBe('1,234,567.89')
    })

    it('handles small decimal numbers', () => {
      expect(formatAmount(0.01)).toBe('0.01')
    })

    it('handles negative numbers', () => {
      expect(formatAmount(-1234.56)).toBe('-1,234.56')
    })
  })

  describe('formatRate', () => {
    it('formats integer with 2 decimal places', () => {
      expect(formatRate(100)).toBe('100.00')
    })

    it('preserves up to 6 decimal places for crypto precision', () => {
      expect(formatRate(0.000001)).toBe('0.000001')
    })

    it('trims trailing zeros beyond 2 decimals', () => {
      expect(formatRate(1.5)).toBe('1.50')
    })

    it('keeps 2 decimal places minimum', () => {
      expect(formatRate(1)).toBe('1.00')
    })

    it('handles string input', () => {
      expect(formatRate('0.123456')).toBe('0.123456')
    })

    it('returns 0.00 for NaN', () => {
      expect(formatRate('invalid')).toBe('0.00')
    })

    it('handles numbers with 4 decimals', () => {
      expect(formatRate(1.2345)).toBe('1.2345')
    })
  })

  describe('formatShortAddress', () => {
    it('truncates standard Ethereum address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      expect(formatShortAddress(address)).toBe('0x1234...5678')
    })

    it('returns short addresses unchanged', () => {
      expect(formatShortAddress('0x1234')).toBe('0x1234')
    })

    it('returns empty string unchanged', () => {
      expect(formatShortAddress('')).toBe('')
    })

    it('truncates addresses with exactly 10 chars (boundary case)', () => {
      // 10 chars is the boundary: if length < 10, return as-is
      // '0x12345678' is 10 chars, so it gets truncated
      expect(formatShortAddress('0x12345678')).toBe('0x1234...5678')
    })

    it('truncates addresses longer than 10 chars', () => {
      expect(formatShortAddress('0x1234567890')).toBe('0x1234...7890')
    })
  })

  describe('truncateAddress', () => {
    it('is an alias for formatShortAddress', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      expect(truncateAddress(address)).toBe(formatShortAddress(address))
    })
  })
})
