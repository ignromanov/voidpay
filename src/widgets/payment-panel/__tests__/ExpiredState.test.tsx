import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect } from 'vitest'
import { ExpiredState } from '../ui/ExpiredState'

describe('ExpiredState', () => {
  const defaultProps = {
    amount: '5000000',
    decimals: 6,
    currency: 'USDC',
  }

  it('renders red status icon', () => {
    const { container } = render(<ExpiredState {...defaultProps} />)
    const iconCircle = container.querySelector('.bg-red-500\\/10')
    expect(iconCircle).not.toBeNull()
  })

  it('renders expired message', () => {
    render(<ExpiredState {...defaultProps} />)
    expect(screen.getByText('This invoice has expired')).toBeDefined()
  })

  it('renders muted amount display', () => {
    const { container } = render(<ExpiredState {...defaultProps} />)
    const mutedContainer = container.querySelector('.opacity-50')
    expect(mutedContainer).not.toBeNull()
  })

  it('shows formatted amount', () => {
    render(<ExpiredState {...defaultProps} />)
    expect(screen.getByText('5.00')).toBeDefined()
    expect(screen.getByText('USDC')).toBeDefined()
  })

  it('renders "Payment actions are disabled" text', () => {
    render(<ExpiredState {...defaultProps} />)
    expect(screen.getByText('Payment actions are disabled')).toBeDefined()
  })
})
