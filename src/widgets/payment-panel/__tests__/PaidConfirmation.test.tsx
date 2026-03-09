import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PaidConfirmation } from '../ui/PaidConfirmation'

const { mockToastInfo } = vi.hoisted(() => ({
  mockToastInfo: vi.fn(),
}))

vi.mock('@/shared/lib/toast', () => ({
  toast: {
    info: mockToastInfo,
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}))

describe('PaidConfirmation', () => {
  const defaultProps = {
    subtotal: '1500000000',
    magicDust: '0',
    exactTotal: '1500000000',
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

  it('shows MagicDustBadge when magicDust is present', () => {
    render(<PaidConfirmation {...defaultProps} subtotal="1500000000" magicDust="42" />)
    expect(screen.getByText(/Sent/)).toBeDefined()
  })

  it('hides MagicDustBadge when magicDust is zero', () => {
    render(<PaidConfirmation {...defaultProps} />)
    expect(screen.queryByText(/Sent:/)).toBeNull()
  })

  it('removes animate-pulse when confirmation progress reaches 100%', () => {
    const { container } = render(
      <PaidConfirmation
        {...defaultProps}
        confirmations={{ current: 15, required: 15 }}
      />
    )
    const shieldContainer = container.querySelector('.bg-blue-500\\/10.rounded-full')
    expect(shieldContainer?.className).not.toContain('animate-pulse')
  })

  describe('finalized prop', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('shows single CheckIcon (not finalized) when finalized is false', () => {
      const { container } = render(
        <PaidConfirmation
          {...defaultProps}
          confirmations={{ current: 8, required: 15 }}
          finalized={false}
        />
      )
      const svgs = container.querySelectorAll('svg')
      // CheckIcon path: "M20 6 9 17l-5-5"
      const allPaths = Array.from(svgs).flatMap(svg =>
        Array.from(svg.querySelectorAll('path')).map(p => p.getAttribute('d'))
      )
      expect(allPaths).toContain('M20 6 9 17l-5-5')
    })

    it('shows CheckCheckIcon when finalized is true', () => {
      const { container } = render(
        <PaidConfirmation
          {...defaultProps}
          confirmations={{ current: 15, required: 15 }}
          finalized={true}
        />
      )
      const svgs = container.querySelectorAll('svg')
      const allPaths = Array.from(svgs).flatMap(svg =>
        Array.from(svg.querySelectorAll('path')).map(p => p.getAttribute('d'))
      )
      // CheckCheckIcon has two paths for double checkmark
      expect(allPaths).toContain('M18 7 9.7 15.3 6 11.6')
      expect(allPaths).toContain('m22 11-7.5 7.5L13 17')
    })

    it('icon transitions silently (no toast) when finalized becomes true', () => {
      const { rerender } = render(
        <PaidConfirmation
          {...defaultProps}
          confirmations={{ current: 8, required: 15 }}
          finalized={false}
        />
      )
      rerender(
        <PaidConfirmation
          {...defaultProps}
          confirmations={{ current: 15, required: 15 }}
          finalized={true}
        />
      )
      // No toast should have been called during finalization
      expect(mockToastInfo).not.toHaveBeenCalled()
    })

    it('calls toast.info on reorg when reorgDetected becomes true', () => {
      const { rerender } = render(
        <PaidConfirmation
          {...defaultProps}
          confirmations={{ current: 15, required: 15 }}
          finalized={true}
          reorgDetected={false}
        />
      )
      rerender(
        <PaidConfirmation
          {...defaultProps}
          confirmations={{ current: 15, required: 15 }}
          finalized={true}
          reorgDetected={true}
        />
      )
      expect(mockToastInfo).toHaveBeenCalledOnce()
    })
  })
})
