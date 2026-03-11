import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '@/widgets/payment-panel'

describe('StatusBadge', () => {
  it('shows status label when not syncing', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Payment Pending')).toBeInTheDocument()
  })

  it('shows "Checking status..." with spinner when syncing', () => {
    const { container } = render(<StatusBadge status="pending" isSyncing />)
    expect(screen.getByText('Checking status...')).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('shows status label (not syncing text) when isSyncing=false', () => {
    render(<StatusBadge status="paid" isSyncing={false} />)
    expect(screen.getByText('Finalized & Paid')).toBeInTheDocument()
    expect(screen.queryByText('Checking status...')).toBeNull()
  })

  it('applies syncing styles when syncing', () => {
    render(<StatusBadge status="pending" isSyncing />)
    const badge = screen.getByTestId('status-badge')
    expect(badge.className).toContain('border-zinc-500/40')
    expect(badge.className).not.toContain('border-amber-500/40')
  })

  it('applies status styles when not syncing', () => {
    render(<StatusBadge status="paid" />)
    const badge = screen.getByTestId('status-badge')
    expect(badge.className).toContain('border-emerald-500/50')
  })
})
