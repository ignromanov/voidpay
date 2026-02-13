import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock usePaymentFlow
const mockHandlePay = vi.fn()
let mockState = { step: 'idle' as const, error: null, txHash: null, intent: false }
let mockIdleSubState: 'disconnected' | 'wrong-network' | 'ready' = 'ready'

vi.mock('../../model/use-payment-flow', () => ({
  usePaymentFlow: vi.fn(() => ({
    state: mockState,
    handlePay: mockHandlePay,
    idleSubState: mockIdleSubState,
  })),
}))

// Mock formatAmount from shared
vi.mock('@/shared/lib/amount-utils', () => ({
  formatAmount: vi.fn((amount: string, decimals: number) => {
    const num = Number(amount) / Math.pow(10, decimals)
    return num.toString()
  }),
}))

import { SmartPayButton } from '../SmartPayButton'
import type { Invoice } from '@/entities/invoice'

const mockInvoice: Invoice = {
  version: 2,
  invoiceId: 'INV-001',
  currency: 'ETH',
  networkId: 1,
  decimals: 18,
  from: { walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
  items: [],
} as Invoice

const defaultProps = {
  invoice: mockInvoice,
  invoiceId: 'INV-001',
  exactTotal: '1000000000000000000',
}

describe('SmartPayButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockState = { step: 'idle', error: null, txHash: null, intent: false }
    mockIdleSubState = 'ready'
  })

  it('renders "Pay X ETH" label in ready state', () => {
    render(<SmartPayButton {...defaultProps} />)
    const button = screen.getByRole('button')
    expect(button.textContent).toContain('Pay')
    expect(button.textContent).toContain('ETH')
  })

  it('calls handlePay on click', () => {
    render(<SmartPayButton {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockHandlePay).toHaveBeenCalledOnce()
  })

  it('renders "Smart Pay" when disconnected', () => {
    mockIdleSubState = 'disconnected'
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByRole('button').textContent).toContain('Smart Pay')
  })

  it('renders "Smart Switch" when wrong network', () => {
    mockIdleSubState = 'wrong-network'
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByRole('button').textContent).toContain('Smart Switch')
  })

  it('shows "Sending funds..." during sending step', () => {
    mockState = { step: 'sending', error: null, txHash: null, intent: true }
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByRole('button').textContent).toContain('Sending')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows "Verifying on-chain..." during confirming step', () => {
    mockState = { step: 'confirming', error: null, txHash: '0xabc' as `0x${string}`, intent: true }
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByRole('button').textContent).toContain('Verifying')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled during processing states', () => {
    mockState = { step: 'sending', error: null, txHash: null, intent: true }
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  // US2/US3: Auto-chain subtitles and states
  it('renders subtitle "Auto: Connect → Switch → Pay" when disconnected', () => {
    mockIdleSubState = 'disconnected'
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByText(/Auto:.*Connect/)).toBeInTheDocument()
  })

  it('renders subtitle "Auto: Switch → Pay" when wrong network', () => {
    mockIdleSubState = 'wrong-network'
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByText(/Auto:.*Switch/)).toBeInTheDocument()
  })

  it('shows "Connecting wallet..." during connecting step', () => {
    mockState = { step: 'connecting', error: null, txHash: null, intent: true }
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByRole('button').textContent).toContain('Connecting')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows "Switching network..." during switching step', () => {
    mockState = { step: 'switching', error: null, txHash: null, intent: true }
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByRole('button').textContent).toContain('Switching')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('button disabled during connecting', () => {
    mockState = { step: 'connecting', error: null, txHash: null, intent: true }
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onError when state has error', () => {
    const onError = vi.fn()
    mockState = {
      step: 'idle',
      error: { type: 'USER_REJECTED' as const, message: 'Rejected', step: 'sending' as const },
      txHash: null,
      intent: false,
    }
    render(<SmartPayButton {...defaultProps} onError={onError} />)
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'USER_REJECTED' }))
  })

  it('calls onSuccess when step is success with txHash', () => {
    const onSuccess = vi.fn()
    mockState = {
      step: 'success',
      error: null,
      txHash: '0xabc123' as `0x${string}`,
      intent: false,
    }
    render(<SmartPayButton {...defaultProps} onSuccess={onSuccess} />)
    expect(onSuccess).toHaveBeenCalledWith('0xabc123')
  })

  it('renders "Payment complete" in success state', () => {
    mockState = { step: 'success', error: null, txHash: '0xabc' as `0x${string}`, intent: false }
    render(<SmartPayButton {...defaultProps} />)
    expect(screen.getByRole('button').textContent).toContain('Payment complete')
  })

  it('button is not interactive in success state', () => {
    mockState = { step: 'success', error: null, txHash: '0xabc' as `0x${string}`, intent: false }
    render(<SmartPayButton {...defaultProps} />)
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled() // Keep visual overlay
    expect(button.className).toContain('pointer-events-none') // Not interactive
  })

  it('does not call handlePay when disabled', () => {
    mockState = { step: 'sending', error: null, txHash: null, intent: true }
    render(<SmartPayButton {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    // Button is disabled, so handlePay should not be called
    expect(mockHandlePay).not.toHaveBeenCalled()
  })

  describe('all 9 visual states', () => {
    it('idle:disconnected — shows "Smart Pay" with connect subtitle', () => {
      mockIdleSubState = 'disconnected'
      mockState = { step: 'idle', error: null, txHash: null, intent: false }
      render(<SmartPayButton {...defaultProps} />)
      expect(screen.getByRole('button').textContent).toContain('Smart Pay')
      expect(screen.getByText(/Auto:.*Connect/)).toBeInTheDocument()
    })

    it('idle:wrong-network — shows "Smart Switch" with switch subtitle', () => {
      mockIdleSubState = 'wrong-network'
      mockState = { step: 'idle', error: null, txHash: null, intent: false }
      render(<SmartPayButton {...defaultProps} />)
      expect(screen.getByRole('button').textContent).toContain('Smart Switch')
      expect(screen.getByText(/Auto:.*Switch/)).toBeInTheDocument()
    })

    it('idle:ready — shows "Pay X ETH"', () => {
      mockIdleSubState = 'ready'
      mockState = { step: 'idle', error: null, txHash: null, intent: false }
      render(<SmartPayButton {...defaultProps} />)
      expect(screen.getByRole('button').textContent).toContain('Pay')
      expect(screen.getByRole('button').textContent).toContain('ETH')
      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('connecting — shows spinner and "Connecting wallet..."', () => {
      mockState = { step: 'connecting', error: null, txHash: null, intent: true }
      render(<SmartPayButton {...defaultProps} />)
      expect(screen.getByRole('button').textContent).toContain('Connecting')
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('switching — shows spinner and "Switching network..."', () => {
      mockState = { step: 'switching', error: null, txHash: null, intent: true }
      render(<SmartPayButton {...defaultProps} />)
      expect(screen.getByRole('button').textContent).toContain('Switching')
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('sending — shows spinner and "Sending funds..."', () => {
      mockState = { step: 'sending', error: null, txHash: null, intent: true }
      render(<SmartPayButton {...defaultProps} />)
      expect(screen.getByRole('button').textContent).toContain('Sending')
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('confirming — shows spinner and "Verifying on-chain..."', () => {
      mockState = { step: 'confirming', error: null, txHash: '0xabc' as `0x${string}`, intent: true }
      render(<SmartPayButton {...defaultProps} />)
      expect(screen.getByRole('button').textContent).toContain('Verifying')
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('success — shows check icon and "Payment complete"', () => {
      mockState = { step: 'success', error: null, txHash: '0xabc' as `0x${string}`, intent: false }
      render(<SmartPayButton {...defaultProps} />)
      const button = screen.getByRole('button')
      expect(button.textContent).toContain('Payment complete')
      expect(button).not.toBeDisabled() // Keep visual overlay
      expect(button.className).toContain('pointer-events-none') // Not interactive
    })

    it('error recovery — returns to idle state', () => {
      mockState = {
        step: 'idle',
        error: { type: 'USER_REJECTED' as const, message: 'Rejected', step: 'sending' as const },
        txHash: null,
        intent: false,
      }
      mockIdleSubState = 'ready'
      render(<SmartPayButton {...defaultProps} />)
      // After error, button returns to idle label
      expect(screen.getByRole('button').textContent).toContain('Pay')
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })
})
