import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect } from 'vitest'
import { PaidConfirmation } from '../ui/PaidConfirmation'

describe('PaidConfirmation', () => {
  const defaultProps = {
    amount: '1500000000',
    decimals: 6,
    currency: 'USDC',
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
