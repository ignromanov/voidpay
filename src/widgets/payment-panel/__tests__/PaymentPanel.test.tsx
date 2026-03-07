import { render, screen, userEvent } from '@/shared/lib/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { PaymentPanel } from '../ui/PaymentPanel'
import type { Invoice } from '@/shared/lib/invoice-types'

const mockInvoice: Invoice = {
  version: 2,
  invoiceId: 'INV-TEST-001',
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
}

describe('PaymentPanel', () => {
  describe('pending state', () => {
    it('renders payment panel with data-testid', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.getByTestId('payment-panel')).toBeInTheDocument()
    })

    it('shows AmountDisplay with correct values', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.getByText('Total Due')).toBeInTheDocument()
      expect(screen.getByText('USDC')).toBeInTheDocument()
    })

    it('renders violet gradient bar for pending', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      const panel = screen.getByTestId('payment-panel')
      const gradientBar = panel.querySelector('[data-testid="gradient-bar"]')
      expect(gradientBar).toBeInTheDocument()
      expect(gradientBar!.className).toContain('from-violet-500')
    })

    it('shows Magic Dust exact amount when present', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.getByText(/Exact amount/i)).toBeInTheDocument()
    })

    it('renders data-status attribute', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      const panel = screen.getByTestId('payment-panel')
      expect(panel.getAttribute('data-status')).toBe('pending')
    })
  })

  describe('paid state', () => {
    it('shows green gradient bar', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
        />
      )
      const gradientBar = screen.getByTestId('gradient-bar')
      expect(gradientBar.className).toContain('from-emerald-500')
    })

    it('shows PaidConfirmation with success heading', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
        />
      )
      expect(screen.getByText('Payment Successful')).toBeInTheDocument()
    })

    it('does not show ActionSlot when paid', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
        >
          <button>Pay Now</button>
        </PaymentPanel>
      )
      expect(screen.queryByText('Pay Now')).toBeNull()
      expect(screen.queryByText('Connect Wallet to Pay')).toBeNull()
    })

    it('adds emerald border when paid', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
        />
      )
      const panel = screen.getByTestId('payment-panel')
      expect(panel.className).toContain('border-emerald-500/30')
    })

    it('does not show pulse when paid', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
        />
      )
      const gradientBar = screen.getByTestId('gradient-bar')
      expect(gradientBar.className).not.toContain('animate-pulse')
    })
  })

  describe('confirming state', () => {
    it('shows blue gradient bar', () => {
      render(
        <PaymentPanel invoice={mockInvoice} status="confirming" txHash="0xabc123" />
      )
      const gradientBar = screen.getByTestId('gradient-bar')
      expect(gradientBar.className).toContain('from-blue-500')
    })

    it('shows pulse animation', () => {
      render(
        <PaymentPanel invoice={mockInvoice} status="confirming" txHash="0xabc123" />
      )
      const gradientBar = screen.getByTestId('gradient-bar')
      expect(gradientBar.className).toContain('animate-pulse')
    })

    it('shows PaidConfirmation', () => {
      render(
        <PaymentPanel invoice={mockInvoice} status="confirming" txHash="0xabc123" />
      )
      expect(screen.getByText('Payment Successful')).toBeInTheDocument()
    })

    it('does not show ActionSlot when confirming', () => {
      render(
        <PaymentPanel invoice={mockInvoice} status="confirming" txHash="0xabc123">
          <button>Pay Now</button>
        </PaymentPanel>
      )
      expect(screen.queryByText('Pay Now')).toBeNull()
    })

    it('does not show error banner when confirming', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="confirming"
          txHash="0xabc123"
          error="Some error"
          onDismissError={() => {}}
        />
      )
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  describe('overdue state', () => {
    it('shows red gradient bar', () => {
      render(<PaymentPanel invoice={mockInvoice} status="overdue" />)
      const gradientBar = screen.getByTestId('gradient-bar')
      expect(gradientBar.className).toContain('from-red-500')
    })

    it('shows ExpiredState with expired message', () => {
      render(<PaymentPanel invoice={mockInvoice} status="overdue" />)
      expect(screen.getByText('This invoice has expired')).toBeInTheDocument()
    })

    it('does not show ActionSlot when overdue', () => {
      render(
        <PaymentPanel invoice={mockInvoice} status="overdue">
          <button>Pay Now</button>
        </PaymentPanel>
      )
      expect(screen.queryByText('Pay Now')).toBeNull()
      expect(screen.queryByText('Connect Wallet to Pay')).toBeNull()
    })
  })

  describe('action slot (US4)', () => {
    it('renders children in ActionSlot when pending', () => {
      render(
        <PaymentPanel invoice={mockInvoice} status="pending">
          <button>Pay Now</button>
        </PaymentPanel>
      )
      expect(screen.getByText('Pay Now')).toBeInTheDocument()
    })

    it('shows default prompt when no children on pending', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.getByText('Connect Wallet to Pay')).toBeInTheDocument()
    })
  })

  describe('error banner (US5)', () => {
    it('shows error banner when error prop is set on pending', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          error="Transaction failed"
          onDismissError={() => {}}
        />
      )
      expect(screen.getByText('Transaction failed')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('fires onDismissError when error is dismissed', async () => {
      const onDismiss = vi.fn()
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          error="Test error"
          onDismissError={onDismiss}
        />
      )
      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      await userEvent.click(dismissButton)
      expect(onDismiss).toHaveBeenCalledOnce()
    })

    it('does not show error banner when no error', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.queryByRole('alert')).toBeNull()
    })

    it('does not show error banner when paid', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
          error="Some error"
          onDismissError={() => {}}
        />
      )
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  describe('QR code button', () => {
    it('renders Show QR button when pending', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.getByRole('button', { name: /show qr/i })).toBeInTheDocument()
    })

    it('hides Show QR button when status is paid', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
        />
      )
      expect(screen.queryByRole('button', { name: /show qr/i })).toBeNull()
    })

    it('hides Show QR button when status is overdue', () => {
      render(<PaymentPanel invoice={mockInvoice} status="overdue" />)
      expect(screen.queryByRole('button', { name: /show qr/i })).toBeNull()
    })

    it('Show QR button has hidden md:inline-flex for desktop-only', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      const btn = screen.getByRole('button', { name: /show qr/i })
      expect(btn.className).toContain('hidden')
      expect(btn.className).toContain('md:inline-flex')
    })

    it('Show QR button has cursor-pointer', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      const btn = screen.getByRole('button', { name: /show qr/i })
      expect(btn.className).toContain('cursor-pointer')
    })
  })

  describe('footer', () => {
    it('renders Download PDF button (disabled)', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      const downloadBtn = screen.getByRole('button', { name: /download pdf/i })
      expect(downloadBtn).toBeInTheDocument()
      expect(downloadBtn.hasAttribute('disabled')).toBe(true)
    })

    it('renders Report abuse button', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      const reportBtn = screen.getByRole('button', { name: /report abuse/i })
      expect(reportBtn).toBeInTheDocument()
    })

    it('renders View Tx link in footer when paid', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
        />
      )
      const link = screen.getByRole('link', { name: /view tx/i })
      expect(link).toBeInTheDocument()
    })

    it('does not render View Tx link in footer when pending', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.queryByRole('link', { name: /view tx/i })).toBeNull()
    })

    it('renders gradient separator', () => {
      const { container } = render(
        <PaymentPanel invoice={mockInvoice} status="pending" />
      )
      const separator = container.querySelector('.via-zinc-800')
      expect(separator).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('calculates total from items when no total field', () => {
      const invoiceNoTotal: Invoice = {
        ...mockInvoice,
        total: undefined,
        magicDust: undefined,
      }
      render(<PaymentPanel invoice={invoiceNoTotal} status="pending" />)
      expect(screen.getByText('Total Due')).toBeInTheDocument()
    })

    it('handles decimals=0', () => {
      const integerInvoice: Invoice = {
        ...mockInvoice,
        decimals: 0,
        total: '100',
        magicDust: '5',
      }
      render(<PaymentPanel invoice={integerInvoice} status="pending" />)
      expect(screen.getByText('Total Due')).toBeInTheDocument()
    })

    it('handles magicDust in total but magicDust field absent', () => {
      const noMagicDust: Invoice = {
        ...mockInvoice,
        total: '1500000000',
        magicDust: undefined,
      }
      render(<PaymentPanel invoice={noMagicDust} status="pending" />)
      expect(screen.getByText('Manual verification required')).toBeInTheDocument()
    })

    it('defaults unknown status to pending behavior', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status={'unknown' as any}
        />
      )
      expect(screen.getByText('Total Due')).toBeInTheDocument()
    })

    it('renders paid state without txHash with fallback', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
        />
      )
      const panel = screen.getByTestId('payment-panel')
      expect(panel.getAttribute('data-status')).toBe('paid')
      expect(screen.queryByText('Payment Successful')).toBeNull()
      expect(screen.getByTestId('paid-fallback')).toBeInTheDocument()
      expect(screen.getByText('Payment detected')).toBeInTheDocument()
      expect(screen.getByText('Verifying transaction...')).toBeInTheDocument()
    })
  })

  describe("I've paid button (T018)", () => {
    it("renders I've paid button when onIvePaid prop is provided for pending status", () => {
      render(
        <PaymentPanel invoice={mockInvoice} status="pending" onIvePaid={vi.fn()} />
      )
      expect(screen.getByTestId('ive-paid-button')).toBeInTheDocument()
      expect(screen.getByText("I've paid")).toBeInTheDocument()
    })

    it("does not render I've paid button when onIvePaid is not provided", () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.queryByTestId('ive-paid-button')).toBeNull()
    })

    it("does not render I've paid button for paid status", () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
          onIvePaid={vi.fn()}
        />
      )
      expect(screen.queryByTestId('ive-paid-button')).toBeNull()
    })

    it("calls onIvePaid when button is clicked", async () => {
      const onIvePaid = vi.fn()
      render(
        <PaymentPanel invoice={mockInvoice} status="pending" onIvePaid={onIvePaid} />
      )
      await userEvent.click(screen.getByTestId('ive-paid-button'))
      expect(onIvePaid).toHaveBeenCalledOnce()
    })

    it('shows PollingStatus when pollingMode is aggressive', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onIvePaid={vi.fn()}
          pollingMode="aggressive"
        />
      )
      expect(screen.getByText('Searching for your payment...')).toBeInTheDocument()
    })

    it('does not show PollingStatus when pollingMode is idle', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onIvePaid={vi.fn()}
          pollingMode="idle"
        />
      )
      expect(screen.queryByText('Searching for your payment...')).toBeNull()
      expect(screen.queryByText('Checking...')).toBeNull()
    })
  })

  describe('Check payment button (T019)', () => {
    it('renders Check payment button when onCheckPayment prop is provided', () => {
      render(
        <PaymentPanel invoice={mockInvoice} status="pending" onCheckPayment={vi.fn()} />
      )
      expect(screen.getByTestId('check-payment-button')).toBeInTheDocument()
      expect(screen.getByText('Check payment')).toBeInTheDocument()
    })

    it('does not render Check payment button when onCheckPayment is not provided', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.queryByTestId('check-payment-button')).toBeNull()
    })

    it('calls onCheckPayment when button is clicked', async () => {
      const onCheckPayment = vi.fn()
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onCheckPayment={onCheckPayment}
        />
      )
      await userEvent.click(screen.getByTestId('check-payment-button'))
      expect(onCheckPayment).toHaveBeenCalledOnce()
    })

    it('is disabled and shows countdown when cooldownUntil is in the future', () => {
      const cooldownUntil = Date.now() + 25_000
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onCheckPayment={vi.fn()}
          cooldownUntil={cooldownUntil}
        />
      )
      const btn = screen.getByTestId('check-payment-button')
      expect(btn).toBeDisabled()
      expect(btn.textContent).toMatch(/Check payment \(\d+s\)/)
    })

    it('is enabled when cooldownUntil is in the past', () => {
      const cooldownUntil = Date.now() - 1000
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onCheckPayment={vi.fn()}
          cooldownUntil={cooldownUntil}
        />
      )
      const btn = screen.getByTestId('check-payment-button')
      expect(btn).not.toBeDisabled()
      expect(btn.textContent).toBe('Check payment')
    })

    it('does not render Check payment button for paid status', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
          onCheckPayment={vi.fn()}
        />
      )
      expect(screen.queryByTestId('check-payment-button')).toBeNull()
    })
  })

  describe('Watch for payment toggle (T020)', () => {
    it('renders Watch for payment button when onStartWatching is provided', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onStartWatching={vi.fn()}
        />
      )
      expect(screen.getByTestId('start-watching-button')).toBeInTheDocument()
      expect(screen.getByText('Watch for payment')).toBeInTheDocument()
    })

    it('calls onStartWatching when Watch for payment is clicked', async () => {
      const onStartWatching = vi.fn()
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onStartWatching={onStartWatching}
        />
      )
      await userEvent.click(screen.getByTestId('start-watching-button'))
      expect(onStartWatching).toHaveBeenCalledOnce()
    })

    it('shows Stop watching button and PollingStatus when pollingMode is watching', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onStartWatching={vi.fn()}
          onStopWatching={vi.fn()}
          pollingMode="watching"
        />
      )
      expect(screen.getByTestId('stop-watching-button')).toBeInTheDocument()
      expect(screen.getByText('Stop watching')).toBeInTheDocument()
      expect(screen.getByText('Watching for payment...')).toBeInTheDocument()
    })

    it('calls onStopWatching when Stop watching is clicked', async () => {
      const onStopWatching = vi.fn()
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onStartWatching={vi.fn()}
          onStopWatching={onStopWatching}
          pollingMode="watching"
        />
      )
      await userEvent.click(screen.getByTestId('stop-watching-button'))
      expect(onStopWatching).toHaveBeenCalledOnce()
    })

    it('does not render Watch button for paid status', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
          onStartWatching={vi.fn()}
        />
      )
      expect(screen.queryByTestId('start-watching-button')).toBeNull()
    })
  })

  describe('Verify by txHash (T021)', () => {
    it('renders toggle when onVerifyTxHash is provided', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onVerifyTxHash={vi.fn()}
        />
      )
      expect(screen.getByTestId('verify-txhash-toggle')).toBeInTheDocument()
      expect(screen.getByText('Verify by transaction hash')).toBeInTheDocument()
    })

    it('does not render toggle when onVerifyTxHash is not provided', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.queryByTestId('verify-txhash-toggle')).toBeNull()
    })

    it('expands section on toggle click', async () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onVerifyTxHash={vi.fn()}
        />
      )
      expect(screen.queryByTestId('verify-txhash-section')).toBeNull()
      await userEvent.click(screen.getByTestId('verify-txhash-toggle'))
      expect(screen.getByTestId('verify-txhash-section')).toBeInTheDocument()
      expect(screen.getByTestId('txhash-input')).toBeInTheDocument()
    })

    it('collapses section on second toggle click', async () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onVerifyTxHash={vi.fn()}
        />
      )
      const toggle = screen.getByTestId('verify-txhash-toggle')
      await userEvent.click(toggle)
      expect(screen.getByTestId('verify-txhash-section')).toBeInTheDocument()
      await userEvent.click(toggle)
      expect(screen.queryByTestId('verify-txhash-section')).toBeNull()
    })

    it('Verify button is disabled with invalid txHash input', async () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onVerifyTxHash={vi.fn()}
        />
      )
      await userEvent.click(screen.getByTestId('verify-txhash-toggle'))
      await userEvent.type(screen.getByTestId('txhash-input'), 'not-a-hash')
      expect(screen.getByTestId('verify-txhash-button')).toBeDisabled()
    })

    it('Verify button is enabled with valid 0x + 64 hex chars', async () => {
      const validHash = '0x' + 'a'.repeat(64)
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onVerifyTxHash={vi.fn()}
        />
      )
      await userEvent.click(screen.getByTestId('verify-txhash-toggle'))
      await userEvent.type(screen.getByTestId('txhash-input'), validHash)
      expect(screen.getByTestId('verify-txhash-button')).not.toBeDisabled()
    })

    it('calls onVerifyTxHash with txHash when Verify is clicked', async () => {
      const validHash = '0x' + 'b'.repeat(64)
      const onVerifyTxHash = vi.fn()
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          onVerifyTxHash={onVerifyTxHash}
        />
      )
      await userEvent.click(screen.getByTestId('verify-txhash-toggle'))
      await userEvent.type(screen.getByTestId('txhash-input'), validHash)
      await userEvent.click(screen.getByTestId('verify-txhash-button'))
      expect(onVerifyTxHash).toHaveBeenCalledWith({ txHash: validHash })
    })

    it('does not render for paid status', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
          onVerifyTxHash={vi.fn()}
        />
      )
      expect(screen.queryByTestId('verify-txhash-toggle')).toBeNull()
    })
  })

  describe('accessibility', () => {
    it('error banner has role="alert"', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          error="Network error"
          onDismissError={() => {}}
        />
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('dismiss button has aria-label', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="pending"
          error="Test"
          onDismissError={() => {}}
        />
      )
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
    })

    it('MagicDustBadge renders for pending state with dust', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.getByText(/Exact amount/i)).toBeInTheDocument()
    })

    it('Download PDF button has aria-label', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
    })

    it('Report abuse button has aria-label', () => {
      render(<PaymentPanel invoice={mockInvoice} status="pending" />)
      expect(screen.getByRole('button', { name: /report abuse/i })).toBeInTheDocument()
    })

    it('View Tx link opens in new tab', () => {
      render(
        <PaymentPanel
          invoice={mockInvoice}
          status="paid"
          txHash="0xabc123"
        />
      )
      const link = screen.getByRole('link', { name: /view tx/i })
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
    })
  })
})
