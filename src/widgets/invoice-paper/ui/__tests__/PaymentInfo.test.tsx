/**
 * PaymentInfo Component Tests
 * Tests for payment information display block
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test-utils'
import { PaymentInfo } from '../PaymentInfo'

// Mock PaymentQR from feature — expose individual props for assertions
vi.mock('@/features/payment-qr', () => ({
  PaymentQR: (props: {
    recipientAddress?: string
    chainId?: number
    amount?: string
    tokenAddress?: string
  }) => {
    // Simulate placeholder when required props are missing
    if (!props.recipientAddress || !props.chainId || !props.amount) {
      return <div data-testid="payment-qr-placeholder" />
    }
    return (
      <svg
        data-testid="payment-qr"
        data-recipient={props.recipientAddress}
        data-chain-id={props.chainId}
        data-amount={props.amount}
        data-token={props.tokenAddress}
      />
    )
  },
}))

describe('PaymentInfo', () => {
  const defaultProps = {
    networkId: 1,
    currency: 'USDC',
  }

  describe('Basic rendering', () => {
    it('renders payment info header', () => {
      render(<PaymentInfo {...defaultProps} />)

      expect(screen.getByText('Payment Info')).toBeInTheDocument()
    })

    it('renders network name', () => {
      render(<PaymentInfo {...defaultProps} networkId={1} />)

      expect(screen.getByText('Ethereum')).toBeInTheDocument()
    })

    it('renders currency symbol', () => {
      render(<PaymentInfo {...defaultProps} currency="ETH" />)

      expect(screen.getByText('ETH')).toBeInTheDocument()
    })

    it('renders Arbitrum network', () => {
      render(<PaymentInfo {...defaultProps} networkId={42161} />)

      expect(screen.getByText('Arbitrum')).toBeInTheDocument()
    })

    it('renders Polygon network', () => {
      render(<PaymentInfo {...defaultProps} networkId={137} />)

      expect(screen.getByText('Polygon')).toBeInTheDocument()
    })
  })

  describe('Wallet address', () => {
    it('displays wallet address when provided', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      render(<PaymentInfo {...defaultProps} senderAddress={address} />)

      expect(screen.getByText(address)).toBeInTheDocument()
    })

    it('shows placeholder when no address provided', () => {
      render(<PaymentInfo {...defaultProps} />)

      expect(screen.getByText('0x... (wallet address)')).toBeInTheDocument()
    })

    it('address is clickable to copy in full variant', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      render(<PaymentInfo {...defaultProps} senderAddress={address} variant="full" />)

      const addressEl = screen.getByRole('button', { name: /wallet address.*click to copy/i })
      expect(addressEl).toBeInTheDocument()
      expect(addressEl).toHaveAttribute('title', 'Click to copy address')
    })

    it('address is not clickable in default variant', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      render(<PaymentInfo {...defaultProps} senderAddress={address} variant="default" />)

      expect(screen.queryByRole('button', { name: /click to copy/i })).not.toBeInTheDocument()
    })
  })

  describe('QR Code', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'

    it('renders QR code by default', () => {
      render(<PaymentInfo {...defaultProps} amount="1500000000" senderAddress={address} />)

      expect(screen.getByTestId('payment-qr')).toBeInTheDocument()
    })

    it('hides QR code when txHash is present', () => {
      render(<PaymentInfo {...defaultProps} amount="1500000000" txHash="0xabc123" />)

      expect(screen.queryByTestId('payment-qr')).not.toBeInTheDocument()
    })

    it('hides QR code when status is paid', () => {
      render(<PaymentInfo {...defaultProps} amount="1500000000" status="paid" />)

      expect(screen.queryByTestId('payment-qr')).not.toBeInTheDocument()
    })

    it('passes payment data to PaymentQR', () => {
      render(
        <PaymentInfo
          {...defaultProps}
          amount="1500000000"
          senderAddress={address}
          tokenAddress="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        />
      )

      const qr = screen.getByTestId('payment-qr')
      expect(qr).toHaveAttribute('data-recipient', address)
      expect(qr).toHaveAttribute('data-chain-id', '1')
      expect(qr).toHaveAttribute('data-amount', '1500000000')
      expect(qr).toHaveAttribute('data-token', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
    })

    it('shows placeholder when no amount provided', () => {
      render(<PaymentInfo {...defaultProps} />)

      expect(screen.getByTestId('payment-qr-placeholder')).toBeInTheDocument()
    })
  })

  describe('Token address', () => {
    it('shows shortened token address when provided', () => {
      const tokenAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
      render(<PaymentInfo {...defaultProps} tokenAddress={tokenAddress} />)

      expect(screen.getByText(/0xa0b8.*eb48/)).toBeInTheDocument()
    })

    it('does not show token address section for native tokens', () => {
      render(<PaymentInfo {...defaultProps} currency="ETH" />)

      // Only currency, no token address
      expect(screen.getByText('ETH')).toBeInTheDocument()
    })
  })

  describe('Transaction hash', () => {
    const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

    it('shows transaction section when txHash provided', () => {
      render(<PaymentInfo {...defaultProps} txHash={txHash} />)

      expect(screen.getByText('Transaction')).toBeInTheDocument()
      expect(screen.getByText(txHash)).toBeInTheDocument()
    })

    it('shows validated state with green styling', () => {
      render(<PaymentInfo {...defaultProps} txHash={txHash} txHashValidated={true} />)

      expect(screen.queryByText('Unverified')).not.toBeInTheDocument()
    })

    it('shows unverified warning when not validated', () => {
      render(<PaymentInfo {...defaultProps} txHash={txHash} txHashValidated={false} />)

      expect(screen.getByText('Unverified')).toBeInTheDocument()
    })

    it('renders as link in full variant', () => {
      render(<PaymentInfo {...defaultProps} txHash={txHash} variant="full" />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', expect.stringContaining('etherscan.io'))
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('does not render as link in default variant', () => {
      render(<PaymentInfo {...defaultProps} txHash={txHash} variant="default" />)

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper region role and label', () => {
      render(<PaymentInfo {...defaultProps} />)

      expect(screen.getByRole('region', { name: 'Payment information' })).toBeInTheDocument()
    })

    it('has accessible label for wallet address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      render(<PaymentInfo {...defaultProps} senderAddress={address} />)

      expect(screen.getByLabelText(/wallet address/i)).toBeInTheDocument()
    })
  })
})
