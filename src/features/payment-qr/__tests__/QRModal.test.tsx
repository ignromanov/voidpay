import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { QRModal } from '../ui/QRModal'
import type { Invoice } from '@/shared/lib/invoice-types'

// Mock PaymentQR — expose individual props for assertions
vi.mock('../ui/PaymentQR', () => ({
  PaymentQR: (props: {
    recipientAddress?: string
    chainId?: number
    amount?: string
    tokenAddress?: string
    variant?: string
    showLogo?: boolean
  }) => (
    <div
      data-testid="payment-qr"
      data-recipient={props.recipientAddress}
      data-chain-id={props.chainId}
      data-amount={props.amount}
      data-token={props.tokenAddress}
      data-variant={props.variant}
      data-show-logo={props.showLogo}
    >
      QR Code
    </div>
  ),
}))

const mockInvoice: Invoice = {
  invoiceId: 'INV-001',
  issuedAt: 1704067200,
  dueAt: 1706745600,
  networkId: 1,
  currency: 'USDC',
  decimals: 6,
  from: {
    name: 'Sender',
    walletAddress: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  },
  client: { name: 'Client' },
  items: [{ description: 'Service', quantity: 1, rate: '1500000000' }],
  total: '1500000042',
  magicDust: '42',
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
}

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  invoice: mockInvoice,
  amount: '1,500.000042',
  exactTotal: '1500000042',
}

describe('QRModal', () => {
  it('renders dialog with Scan to Pay title', () => {
    render(<QRModal {...defaultProps} />)
    expect(screen.getByText('Scan to Pay')).toBeInTheDocument()
  })

  it('passes invoice data to PaymentQR', () => {
    render(<QRModal {...defaultProps} />)
    const qr = screen.getByTestId('payment-qr')
    expect(qr).toHaveAttribute('data-recipient', '0x1234567890123456789012345678901234567890')
    expect(qr).toHaveAttribute('data-chain-id', '1')
    expect(qr).toHaveAttribute('data-amount', '1500000042')
    expect(qr).toHaveAttribute('data-token', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
  })

  it('uses dark variant with logo', () => {
    render(<QRModal {...defaultProps} />)
    const qr = screen.getByTestId('payment-qr')
    expect(qr).toHaveAttribute('data-variant', 'dark')
    expect(qr).toHaveAttribute('data-show-logo', 'true')
  })

  it('displays formatted amount and currency', () => {
    render(<QRModal {...defaultProps} />)
    expect(screen.getByText('1,500.000042')).toBeInTheDocument()
    expect(screen.getByText('USDC')).toBeInTheDocument()
  })

  it('displays network name', () => {
    render(<QRModal {...defaultProps} />)
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('displays full recipient address', () => {
    render(<QRModal {...defaultProps} />)
    expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument()
  })

  it('has copy button for recipient address', () => {
    render(<QRModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /copy recipient/i })).toBeInTheDocument()
  })

  it('has copy button for payment URI', () => {
    render(<QRModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /copy payment uri/i })).toBeInTheDocument()
  })

  it('shows helper text', () => {
    render(<QRModal {...defaultProps} />)
    expect(
      screen.getByText('Scan with your mobile wallet to initiate the payment transaction')
    ).toBeInTheDocument()
  })

  it('has only one close button (built-in DialogContent)', () => {
    render(<QRModal {...defaultProps} />)
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    expect(closeButtons).toHaveLength(1)
  })
})
