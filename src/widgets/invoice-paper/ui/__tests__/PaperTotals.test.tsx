/**
 * PaperTotals Component Tests
 *
 * All amounts are formatted strings (e.g., "1,000.00" not 1000)
 * after BigInt migration.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PaperTotals } from '../PaperTotals'

// Mock PaymentQR from feature
vi.mock('@/features/payment-qr', () => ({
  PaymentQR: (props: {
    recipientAddress?: string
    chainId?: number
    amount?: string
  }) => (
    <svg
      data-testid="payment-qr"
      data-recipient={props.recipientAddress}
      data-chain-id={props.chainId}
      data-amount={props.amount}
    />
  ),
}))

describe('PaperTotals', () => {
  const mockTotals = {
    subtotal: '1,000.00',
    taxAmount: '100.00',
    discountAmount: '50.00',
    total: '1,050.00',
    magicDust: '0.000001',
    atomicTotal: '1050000001',
  }

  const baseProps = {
    totals: mockTotals,
    currency: 'USDC',
    networkId: 1,
    senderAddress: '0x1234567890abcdef1234567890abcdef12345678',
  }

  it('renders subtotal, tax, and discount', () => {
    render(<PaperTotals {...baseProps} />)
    expect(screen.getByText('Subtotal')).toBeDefined()
    expect(screen.getByText('Tax')).toBeDefined()
    expect(screen.getByText('Discount')).toBeDefined()
  })

  it('renders formatted total', () => {
    render(<PaperTotals {...baseProps} />)
    expect(screen.getByText('1,050.00')).toBeDefined()
  })

  it('renders unique amount with magic dust', () => {
    render(<PaperTotals {...baseProps} />)
    expect(screen.getByText(/Unique Amount/i)).toBeDefined()
    expect(screen.getByText('0.000001')).toBeDefined()
  })

  it('renders payment info section with QR by default', () => {
    render(<PaperTotals {...baseProps} amount="1500000000" />)
    expect(screen.getByText(/Payment Info/i)).toBeDefined()
    expect(screen.getByText(/Network/i)).toBeDefined()
    expect(screen.getByText(/Token/i)).toBeDefined()
    expect(screen.getByText(/Scan to pay/i)).toBeDefined()
  })

  it('hides tax row when taxAmount is zero', () => {
    const zeroTaxTotals = { ...mockTotals, taxAmount: '0.00' }
    render(<PaperTotals {...baseProps} totals={zeroTaxTotals} />)
    expect(screen.queryByText('Tax')).toBeNull()
  })

  it('hides discount row when discountAmount is zero', () => {
    const zeroDiscountTotals = { ...mockTotals, discountAmount: '0.00' }
    render(<PaperTotals {...baseProps} totals={zeroDiscountTotals} />)
    expect(screen.queryByText('Discount')).toBeNull()
  })

  it('shows unverified warning when txHashValidated is false', () => {
    render(
      <PaperTotals
        {...baseProps}
        txHash="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
        txHashValidated={false}
      />
    )
    expect(screen.getByText('Unverified')).toBeDefined()
    expect(screen.getByTitle('Transaction not yet verified on-chain')).toBeDefined()
  })

  it('hides unverified warning when txHashValidated is true', () => {
    render(
      <PaperTotals
        {...baseProps}
        txHash="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
        txHashValidated={true}
      />
    )
    expect(screen.queryByText('Unverified')).toBeNull()
  })

  it('hides QR code when status is paid', () => {
    render(<PaperTotals {...baseProps} amount="1500000000" status="paid" />)
    expect(screen.queryByText(/Scan to pay/i)).toBeNull()
  })
})
