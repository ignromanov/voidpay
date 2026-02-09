import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { PaymentQR } from '../ui/PaymentQR'

// Mock qrcode.react — expose props for assertions
vi.mock('qrcode.react', () => ({
  QRCodeSVG: (props: Record<string, unknown>) => (
    <svg
      data-testid="payment-qr"
      data-value={props.value as string}
      data-fg-color={props.fgColor as string}
      data-bg-color={props.bgColor as string}
      data-size={props.size as string}
    />
  ),
}))

const validProps = {
  recipientAddress: '0x1234567890123456789012345678901234567890',
  chainId: 1,
  amount: '1500000000',
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
}

describe('PaymentQR', () => {
  describe('Validation & placeholder', () => {
    it('shows placeholder when recipientAddress is undefined', () => {
      render(<PaymentQR chainId={1} amount="1000" />)
      expect(screen.getByTestId('payment-qr-placeholder')).toBeInTheDocument()
      expect(screen.queryByTestId('payment-qr')).not.toBeInTheDocument()
    })

    it('shows placeholder when amount is undefined', () => {
      render(<PaymentQR recipientAddress="0x1234567890123456789012345678901234567890" chainId={1} />)
      expect(screen.getByTestId('payment-qr-placeholder')).toBeInTheDocument()
    })

    it('shows placeholder when chainId is undefined', () => {
      render(<PaymentQR recipientAddress="0x1234567890123456789012345678901234567890" amount="1000" />)
      expect(screen.getByTestId('payment-qr-placeholder')).toBeInTheDocument()
    })

    it('shows placeholder when all props are undefined', () => {
      render(<PaymentQR />)
      expect(screen.getByTestId('payment-qr-placeholder')).toBeInTheDocument()
    })

    it('renders QR code with valid data', () => {
      render(<PaymentQR {...validProps} />)
      expect(screen.getByTestId('payment-qr')).toBeInTheDocument()
      expect(screen.queryByTestId('payment-qr-placeholder')).not.toBeInTheDocument()
    })

    it('generates correct EIP-681 URI for ERC-20', () => {
      render(<PaymentQR {...validProps} />)
      const qr = screen.getByTestId('payment-qr')
      expect(qr.getAttribute('data-value')).toContain('ethereum:0xA0b8')
      expect(qr.getAttribute('data-value')).toContain('uint256=1500000000')
    })

    it('generates correct EIP-681 URI for native token', () => {
      render(
        <PaymentQR
          recipientAddress="0x1234567890123456789012345678901234567890"
          chainId={1}
          amount="1000"
        />
      )
      const qr = screen.getByTestId('payment-qr')
      expect(qr.getAttribute('data-value')).toContain('?value=1000')
    })

    it('has accessible label on placeholder', () => {
      render(<PaymentQR />)
      expect(screen.getByLabelText('QR code unavailable')).toBeInTheDocument()
    })
  })

  describe('Color variants', () => {
    it('renders light variant with black fg and white bg', () => {
      render(<PaymentQR {...validProps} variant="light" />)
      const qr = screen.getByTestId('payment-qr')
      expect(qr).toHaveAttribute('data-fg-color', '#000000')
      expect(qr).toHaveAttribute('data-bg-color', '#ffffff')
    })

    it('renders dark variant with white fg and transparent bg', () => {
      render(<PaymentQR {...validProps} variant="dark" />)
      const qr = screen.getByTestId('payment-qr')
      expect(qr).toHaveAttribute('data-fg-color', '#ffffff')
      expect(qr).toHaveAttribute('data-bg-color', 'transparent')
    })

    it('defaults to light variant', () => {
      render(<PaymentQR {...validProps} />)
      const qr = screen.getByTestId('payment-qr')
      expect(qr).toHaveAttribute('data-fg-color', '#000000')
      expect(qr).toHaveAttribute('data-bg-color', '#ffffff')
    })
  })

  describe('Placeholder styling per variant', () => {
    it('uses dark placeholder style for dark variant', () => {
      render(<PaymentQR variant="dark" />)
      const el = screen.getByTestId('payment-qr-placeholder')
      expect(el.className).toContain('bg-zinc-800/50')
    })

    it('uses light placeholder style for light variant', () => {
      render(<PaymentQR variant="light" />)
      const el = screen.getByTestId('payment-qr-placeholder')
      expect(el.className).toContain('bg-zinc-100')
    })
  })

  describe('Size', () => {
    it('uses default size of 128', () => {
      render(<PaymentQR {...validProps} />)
      expect(screen.getByTestId('payment-qr')).toHaveAttribute('data-size', '128')
    })

    it('accepts custom size', () => {
      render(<PaymentQR {...validProps} size={240} />)
      expect(screen.getByTestId('payment-qr')).toHaveAttribute('data-size', '240')
    })

    it('sizes placeholder to match requested size', () => {
      render(<PaymentQR size={200} />)
      const el = screen.getByTestId('payment-qr-placeholder')
      expect(el.style.width).toBe('200px')
      expect(el.style.height).toBe('200px')
    })
  })
})
