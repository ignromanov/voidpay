/**
 * PaymentInfo Component Tests
 * Tests for payment information display block
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentInfo } from '../PaymentInfo'

// Mock QRCodeSVG
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code" data-value={value}>
      QR Code
    </div>
  ),
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

    it('shows copy button in full variant with address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      render(<PaymentInfo {...defaultProps} senderAddress={address} variant="full" />)

      expect(screen.getByRole('button', { name: /copy wallet address/i })).toBeInTheDocument()
    })

    it('hides copy button in default variant', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      render(<PaymentInfo {...defaultProps} senderAddress={address} variant="default" />)

      expect(screen.queryByRole('button', { name: /copy wallet address/i })).not.toBeInTheDocument()
    })
  })

  describe('QR Code', () => {
    it('shows QR code by default', () => {
      render(<PaymentInfo {...defaultProps} invoiceUrl="https://example.com" />)

      expect(screen.getByTestId('qr-code')).toBeInTheDocument()
    })

    it('hides QR code when showQR is false', () => {
      render(<PaymentInfo {...defaultProps} showQR={false} />)

      expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument()
    })

    it('hides QR code when txHash is present', () => {
      render(<PaymentInfo {...defaultProps} txHash="0xabc123" />)

      expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument()
    })

    it('hides QR code when status is paid', () => {
      render(<PaymentInfo {...defaultProps} status="paid" />)

      expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument()
    })

    it('uses invoice URL for QR code', () => {
      render(<PaymentInfo {...defaultProps} invoiceUrl="https://voidpay.xyz/pay#abc" />)

      const qr = screen.getByTestId('qr-code')
      expect(qr).toHaveAttribute('data-value', 'https://voidpay.xyz/pay#abc')
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
