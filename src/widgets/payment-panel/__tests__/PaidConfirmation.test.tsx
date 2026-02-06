import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PaidConfirmation } from '../ui/PaidConfirmation'

describe('PaidConfirmation', () => {
  const defaultProps = {
    amount: '1500000000',
    decimals: 6,
    currency: 'USDC',
    networkId: 1,
    txHash: '0xabc123def456',
    txHashValidated: true,
  }

  it('renders "Payment Successful" heading', () => {
    render(<PaidConfirmation {...defaultProps} />)
    expect(screen.getByText('Payment Successful')).toBeDefined()
  })

  it('renders subtitle text', () => {
    render(<PaidConfirmation {...defaultProps} />)
    expect(screen.getByText('Funds have been sent on-chain')).toBeDefined()
  })

  it('renders formatted paid amount', () => {
    render(<PaidConfirmation {...defaultProps} />)
    expect(screen.getByText('1,500.00')).toBeDefined()
    expect(screen.getByText('USDC')).toBeDefined()
  })

  it('renders "View Tx" link with correct explorer URL', () => {
    render(<PaidConfirmation {...defaultProps} />)
    const link = screen.getByRole('link', { name: /View Tx/i })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toContain('/tx/0xabc123def456')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('renders success icon with spring animation wrapper', () => {
    const { container } = render(<PaidConfirmation {...defaultProps} />)
    const successIcon = container.querySelector('svg')
    expect(successIcon).not.toBeNull()
  })

  it('renders confirmation progress bar when confirmations provided', () => {
    render(
      <PaidConfirmation
        {...defaultProps}
        confirmations={{ current: 8, required: 15 }}
      />
    )
    expect(screen.getByText('Protecting against chain reorgs')).toBeDefined()
    expect(screen.getByText('8 / 15')).toBeDefined()
  })

  it('does not render confirmation progress when not provided', () => {
    render(<PaidConfirmation {...defaultProps} />)
    expect(screen.queryByText('Protecting against chain reorgs')).toBeNull()
  })
})
