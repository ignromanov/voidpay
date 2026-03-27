import { describe, it, expect } from 'vitest'
import { findTokenForNetwork, NETWORK_TOKENS } from '@/entities/network'
import { formatAmount, parseAmount } from '@/shared/lib/amount-utils'

describe('PaymentSection network change logic', () => {
  it('findTokenForNetwork returns USDC for all supported networks', () => {
    const chainIds = [1, 42161, 10, 137]
    for (const chainId of chainIds) {
      const token = findTokenForNetwork(chainId, 'USDC')
      expect(token).toBeDefined()
      expect(token!.symbol).toBe('USDC')
      expect(token!.decimals).toBe(6)
    }
  })

  it('fallback to first token when symbol not found', () => {
    const chainId = 1
    const token = findTokenForNetwork(chainId, 'NONEXISTENT')
    expect(token).toBeUndefined()
    const fallback = NETWORK_TOKENS[chainId]?.[0]
    expect(fallback).toBeDefined()
    expect(fallback!.symbol).toBe('ETH')
  })
})

/**
 * Re-convert a rate from old decimals to new decimals.
 * Mirrors the logic in PaymentSection.reconvertLineItemRates.
 */
function reconvertRate(rate: string, oldDecimals: number, newDecimals: number): string {
  if (!rate || rate === '0' || rate === '') return rate
  const human = formatAmount(rate, oldDecimals, { useGrouping: false })
  return parseAmount(human, newDecimals)
}

describe('Rate re-conversion on token decimals change', () => {
  it('USDC (6 dec) → ETH (18 dec): preserves human-readable value', () => {
    // $150.50 in USDC atomic units
    const usdcRate = parseAmount('150.50', 6)
    expect(usdcRate).toBe('150500000')

    const ethRate = reconvertRate(usdcRate, 6, 18)
    expect(ethRate).toBe('150500000000000000000')

    // Verify human-readable roundtrip
    expect(formatAmount(ethRate, 18, { useGrouping: false })).toBe('150.50')
  })

  it('ETH (18 dec) → USDC (6 dec): preserves human-readable value', () => {
    const ethRate = parseAmount('0.05', 18)
    expect(ethRate).toBe('50000000000000000')

    const usdcRate = reconvertRate(ethRate, 18, 6)
    expect(usdcRate).toBe('50000')

    expect(formatAmount(usdcRate, 6, { useGrouping: false })).toBe('0.05')
  })

  it('same decimals (USDC → USDT both 6 dec): rate unchanged', () => {
    const rate = parseAmount('100.00', 6)
    const result = reconvertRate(rate, 6, 6)
    expect(result).toBe(rate)
  })

  it('zero rate stays zero', () => {
    expect(reconvertRate('0', 6, 18)).toBe('0')
  })

  it('empty rate stays empty', () => {
    expect(reconvertRate('', 6, 18)).toBe('')
  })

  it('handles large amounts correctly', () => {
    // $1,000,000.00 in USDC
    const usdcRate = parseAmount('1000000', 6)
    expect(usdcRate).toBe('1000000000000')

    const ethRate = reconvertRate(usdcRate, 6, 18)
    expect(formatAmount(ethRate, 18, { useGrouping: false })).toBe('1000000.00')
  })

  it('handles small fractional amounts', () => {
    // $0.01 in USDC
    const usdcRate = parseAmount('0.01', 6)
    expect(usdcRate).toBe('10000')

    const ethRate = reconvertRate(usdcRate, 6, 18)
    expect(formatAmount(ethRate, 18, { useGrouping: false })).toBe('0.01')
  })

  it('handles multiple line items re-conversion', () => {
    const items = [
      { rate: parseAmount('150.50', 6) },
      { rate: parseAmount('50.00', 6) },
      { rate: '0' },
      { rate: '' },
    ]

    const reconverted = items.map((item) => ({
      rate: reconvertRate(item.rate, 6, 18),
    }))

    expect(formatAmount(reconverted[0].rate, 18, { useGrouping: false })).toBe('150.50')
    expect(formatAmount(reconverted[1].rate, 18, { useGrouping: false })).toBe('50.00')
    expect(reconverted[2].rate).toBe('0')
    expect(reconverted[3].rate).toBe('')
  })
})
