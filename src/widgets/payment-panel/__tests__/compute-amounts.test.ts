import { describe, it, expect } from 'vitest'
import { computeAmounts } from '../lib/compute-amounts'
import type { Invoice } from '@/shared/lib/invoice-types'

/**
 * Helper to create a minimal invoice for testing computeAmounts.
 * Only fields relevant to amount computation are required.
 */
function createInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    version: 2,
    invoiceId: 'INV-TEST',
    issuedAt: 1704067200,
    dueAt: 1706745600,
    networkId: 1,
    currency: 'USDC',
    decimals: 6,
    from: { name: 'Sender', walletAddress: '0x1234567890123456789012345678901234567890' as `0x${string}` },
    client: { name: 'Client' },
    items: [{ description: 'Service', quantity: 1, rate: '1000000' }],
    ...overrides,
  }
}

describe('computeAmounts', () => {
  it('returns subtotal + magicDust + exactTotal when both total and magicDust are present', () => {
    const invoice = createInvoice({
      total: '1000042',    // 1.000042 USDC (includes magic dust)
      magicDust: '42',
    })

    const result = computeAmounts(invoice)

    expect(result.subtotal).toBe('1000000')    // total - magicDust
    expect(result.magicDust).toBe('42')
    expect(result.exactTotal).toBe('1000042')
  })

  it('returns total without magicDust when only total is present', () => {
    const invoice = createInvoice({
      total: '5000000',    // 5.00 USDC
      // no magicDust
    })

    const result = computeAmounts(invoice)

    expect(result.subtotal).toBe('5000000')
    expect(result.magicDust).toBe('0')
    expect(result.exactTotal).toBe('5000000')
  })

  it('calculates from line items when no total is present', () => {
    const invoice = createInvoice({
      items: [
        { description: 'Item A', quantity: 2, rate: '1000000' },   // 2 × $1.00
        { description: 'Item B', quantity: 1, rate: '500000' },    // 1 × $0.50
      ],
      decimals: 6,
      // no total, no magicDust
    })

    const result = computeAmounts(invoice)

    expect(result.subtotal).toBe('2500000')    // $2.50 in atomic units
    expect(result.magicDust).toBe('0')
    expect(result.exactTotal).toBe('2500000')
  })

  it('calculates from line items and adds magicDust when present', () => {
    const invoice = createInvoice({
      items: [{ description: 'Service', quantity: 1, rate: '1000000' }],
      magicDust: '123',
      decimals: 6,
      // no total
    })

    const result = computeAmounts(invoice)

    expect(result.subtotal).toBe('1000000')
    expect(result.magicDust).toBe('123')
    expect(result.exactTotal).toBe('1000123')  // subtotal + magicDust
  })

  it('handles decimals=0 (integer tokens)', () => {
    const invoice = createInvoice({
      total: '100',
      magicDust: '5',
      decimals: 0,
    })

    const result = computeAmounts(invoice)

    expect(result.subtotal).toBe('95')
    expect(result.magicDust).toBe('5')
    expect(result.exactTotal).toBe('100')
  })

  it('handles large amounts with 18 decimals (ETH)', () => {
    const invoice = createInvoice({
      total: '1000000000000000042',   // 1.000000000000000042 ETH
      magicDust: '42',
      decimals: 18,
    })

    const result = computeAmounts(invoice)

    expect(result.subtotal).toBe('1000000000000000000')
    expect(result.magicDust).toBe('42')
    expect(result.exactTotal).toBe('1000000000000000042')
  })
})
