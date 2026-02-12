/**
 * Tests for ShareModal component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/shared/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { ShareModal } from '../ui/ShareModal'
import type { Invoice } from '@/shared/lib/invoice-types'

// Mock createPortal to render inline for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  }
})

// Mock framer-motion to avoid animation issues in tests
vi.mock('@/shared/ui/motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock QRTab and PaymentQR from features/payment-qr
vi.mock('@/features/payment-qr', () => ({
  QRTab: ({ invoice }: { invoice: Invoice }) => (
    <div data-testid="qr-tab">
      <svg data-testid="qr-code" data-invoice-id={invoice.invoiceId} />
      <p>Scan with your mobile wallet to pay</p>
    </div>
  ),
  PaymentQR: () => <svg data-testid="payment-qr" />,
}))

// Mock QRCodeSVG — renders <svg> stub (canonical shape)
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg data-testid="qr-code" data-value={value} />
  ),
}))

// Mock next/dynamic to eagerly resolve dynamic imports in tests
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    let Resolved: React.ComponentType<unknown> | null = null
    loader().then((mod) => {
      Resolved = mod.default ?? mod
    })
    return function DynamicMock(props: Record<string, unknown>) {
      return Resolved ? <Resolved {...props} /> : null
    }
  },
}))

const VALID_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const TEST_URL = 'https://voidpay.xyz/pay#H123abc'

const mockInvoice: Invoice = {
  invoiceId: 'INV-001',
  iss: '2026-01-26',
  from: {
    name: 'Sender Company',
    walletAddress: VALID_ADDRESS,
  },
  client: {
    name: 'Client Company',
  },
  items: [
    {
      description: 'Web Development',
      quantity: 10,
      rate: '100000000',
    },
  ],
  networkId: 1,
  currency: 'USDC',
  decimals: 6,
}

describe('ShareModal', () => {
  const defaultProps = {
    url: TEST_URL,
    invoice: mockInvoice,
    open: true,
    onOpenChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock clipboard API using defineProperty
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })
  })

  describe('rendering', () => {
    it('renders when open is true', () => {
      render(<ShareModal {...defaultProps} />)

      expect(screen.getByText('Invoice Generated')).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
      render(<ShareModal {...defaultProps} open={false} />)

      expect(screen.queryByText('Invoice Generated')).not.toBeInTheDocument()
    })

    it('displays success message in header', () => {
      render(<ShareModal {...defaultProps} />)

      expect(screen.getByText('Invoice Generated')).toBeInTheDocument()
      expect(
        screen.getByText(/Your stateless invoice is ready/)
      ).toBeInTheDocument()
    })

    it('displays Link and QR Code tabs', () => {
      render(<ShareModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Link/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /QR Code/i })).toBeInTheDocument()
    })
  })

  describe('Link tab', () => {
    it('displays URL in styled container', () => {
      render(<ShareModal {...defaultProps} />)

      // URL is displayed in a styled div, split into basePath and rest
      expect(screen.getByText('https://voidpay.xyz/pay')).toBeInTheDocument()
      expect(screen.getByText('#H123abc')).toBeInTheDocument()
    })

    it('displays Copy button', () => {
      render(<ShareModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()
    })

    it('copies URL to clipboard when Copy button clicked', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })

      render(<ShareModal {...defaultProps} />)

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith(TEST_URL)
      })
    })

    it('shows "Copied" state after successful copy', async () => {
      const user = userEvent.setup()
      render(<ShareModal {...defaultProps} />)

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copied')).toBeInTheDocument()
      })
    })

    it('displays Telegram share button', () => {
      render(<ShareModal {...defaultProps} />)

      const telegramLink = screen.getByRole('link', { name: /Telegram/i })
      expect(telegramLink).toHaveAttribute('href', expect.stringContaining('t.me/share'))
    })

    it('displays Twitter share button', () => {
      render(<ShareModal {...defaultProps} />)

      const twitterLink = screen.getByRole('link', { name: /Twitter/i })
      expect(twitterLink).toHaveAttribute('href', expect.stringContaining('twitter.com/intent'))
    })

    it('displays privacy warning', () => {
      render(<ShareModal {...defaultProps} />)

      expect(
        screen.getByText(/VoidPay is stateless/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/invoice is lost forever/)
      ).toBeInTheDocument()
    })
  })

  describe('QR tab', () => {
    it('switches to QR tab when clicked', async () => {
      const user = userEvent.setup()
      render(<ShareModal {...defaultProps} />)

      const qrTab = screen.getByRole('button', { name: /QR Code/i })
      await user.click(qrTab)

      expect(screen.getByTestId('qr-code')).toBeInTheDocument()
    })

    it('renders QR code with invoice data', async () => {
      const user = userEvent.setup()
      render(<ShareModal {...defaultProps} />)

      const qrTab = screen.getByRole('button', { name: /QR Code/i })
      await user.click(qrTab)

      const qrCode = screen.getByTestId('qr-code')
      expect(qrCode).toHaveAttribute('data-invoice-id', mockInvoice.invoiceId)
    })

    it('displays helper text for mobile scanning', async () => {
      const user = userEvent.setup()
      render(<ShareModal {...defaultProps} />)

      const qrTab = screen.getByRole('button', { name: /QR Code/i })
      await user.click(qrTab)

      expect(
        screen.getByText(/Scan with your mobile wallet to pay/)
      ).toBeInTheDocument()
    })
  })

  describe('Open Invoice button', () => {
    it('displays Open Invoice button', () => {
      render(<ShareModal {...defaultProps} />)

      expect(screen.getByRole('link', { name: /Open Invoice/i })).toBeInTheDocument()
    })

    it('links to invoice URL', () => {
      render(<ShareModal {...defaultProps} />)

      const openLink = screen.getByRole('link', { name: /Open Invoice/i })
      expect(openLink).toHaveAttribute('href', TEST_URL)
    })

    it('opens in new tab', () => {
      render(<ShareModal {...defaultProps} />)

      const openLink = screen.getByRole('link', { name: /Open Invoice/i })
      expect(openLink).toHaveAttribute('target', '_blank')
    })
  })

  describe('close behavior', () => {
    it('calls onOpenChange when close button clicked', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(<ShareModal {...defaultProps} onOpenChange={onOpenChange} />)

      const closeButton = screen.getByRole('button', { name: /Close modal/i })
      await user.click(closeButton)

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange when backdrop clicked', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(<ShareModal {...defaultProps} onOpenChange={onOpenChange} />)

      // Find backdrop by class (it's the first div with backdrop-blur)
      const backdrop = document.querySelector('.backdrop-blur-sm')
      if (backdrop) {
        await user.click(backdrop as HTMLElement)
        expect(onOpenChange).toHaveBeenCalledWith(false)
      }
    })
  })

  describe('accessibility', () => {
    it('close button has aria-label', () => {
      render(<ShareModal {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /Close modal/i })
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
    })

    it('social links open in new tab with proper rel', () => {
      render(<ShareModal {...defaultProps} />)

      const telegramLink = screen.getByRole('link', { name: /Telegram/i })
      const twitterLink = screen.getByRole('link', { name: /Twitter/i })

      expect(telegramLink).toHaveAttribute('rel', 'noopener noreferrer')
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
