import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect } from 'vitest'
import { formatDateCompact } from '@/shared/lib/date-time'
import { ExpiredState } from '../ui/ExpiredState'

const DUE_AT = 1776297600 // pinned for deterministic date rendering

describe('ExpiredState', () => {
  const defaultProps = {
    subtotal: '5000000',
    magicDust: '0',
    exactTotal: '5000000',
    decimals: 6,
    currency: 'USDC',
    networkId: 1,
    dueAt: DUE_AT,
  }

  it('renders network chip in the subtitle row', () => {
    render(<ExpiredState {...defaultProps} networkId={42161} />)
    const chip = screen.getByTestId('payment-network-chip')
    expect(chip).toBeDefined()
    expect(chip).toHaveTextContent('Arbitrum')
  })

  it('renders "Was due" subtitle with formatted date', () => {
    render(<ExpiredState {...defaultProps} />)
    expect(
      screen.getByText(`Was due ${formatDateCompact(DUE_AT)} · Payment disabled`)
    ).toBeInTheDocument()
  })

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

  it('renders "Payment disabled" subtitle', () => {
    render(<ExpiredState {...defaultProps} />)
    expect(screen.getByText(/Payment disabled/)).toBeDefined()
  })

  it('shows MagicDustBadge when magicDust is present', () => {
    render(<ExpiredState {...defaultProps} subtotal="5000000" magicDust="42" />)
    // MagicDustBadge renders label with trailing colon ("Was due:"); the
    // subtitle uses the same "Was due" prefix but without colon, so the
    // colon-specific match uniquely targets the badge.
    expect(screen.getByText('Was due:')).toBeDefined()
  })

  it('hides MagicDustBadge when magicDust is zero', () => {
    render(<ExpiredState {...defaultProps} />)
    expect(screen.queryByText('Was due:')).toBeNull()
  })
})
