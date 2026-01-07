/**
 * InvoicePreviewModal component tests
 * Feature: 014-invoice-paper-widget
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderWithUser, screen } from '@/shared/ui/__tests__/test-utils'
import { InvoicePreviewModal } from '../InvoicePreviewModal'
import { PartialInvoice } from '@/entities/invoice'

// Mock generateInvoiceUrl
vi.mock('@/features/invoice-codec', () => ({
  generateInvoiceUrl: vi.fn(),
}))

// Mock data
const mockInvoiceData: PartialInvoice = {
  invoiceId: 'INV-001',
  issuedAt: 1704067200, // 2024-01-01
  dueAt: 1706745600, // 2024-02-01
  networkId: 1,
  currency: 'USDC',
  decimals: 6,
  from: {
    name: 'Acme Corp',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    email: 'billing@acme.com',
  },
  client: {
    name: 'Client Inc',
  },
  items: [{ description: 'Development services', quantity: 10, rate: '100' }],
}

describe('InvoicePreviewModal', () => {
  describe('rendering', () => {
    it('renders when open', () => {
      renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render content when closed', () => {
      renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={false} onOpenChange={() => {}} />
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders document preview title', () => {
      renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      // v3 design uses "Document Preview" header title
      expect(screen.getByText(/Document Preview/)).toBeInTheDocument()
    })

    it('renders reading mode badge', () => {
      renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      expect(screen.getByText(/Reading Mode/)).toBeInTheDocument()
    })

    it('renders close button', () => {
      renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      expect(screen.getByLabelText(/close preview/i)).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onOpenChange when close button clicked', async () => {
      const onOpenChange = vi.fn()
      const { user } = renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={onOpenChange} />
      )

      await user.click(screen.getByLabelText(/close preview/i))

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange when ESC pressed', async () => {
      const onOpenChange = vi.fn()
      const { user } = renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={onOpenChange} />
      )

      await user.keyboard('{Escape}')

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('status handling', () => {
    it('renders with default pending status', () => {
      renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      // Status is pending by default, no badge shown
      expect(screen.queryByText('pending')).not.toBeInTheDocument()
    })

    it('renders with paid status', () => {
      renderWithUser(
        <InvoicePreviewModal
          data={mockInvoiceData}
          status="paid"
          open={true}
          onOpenChange={() => {}}
        />
      )

      // Should show PAID badge and watermark
      expect(screen.getAllByText(/paid/i).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('keyboard shortcuts', () => {
    const originalPrint = window.print

    beforeEach(() => {
      // happy-dom doesn't have window.print, so we need to define it
      window.print = vi.fn()
    })

    afterEach(() => {
      window.print = originalPrint
    })

    it('triggers print when P key is pressed', async () => {
      const { user } = renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      // Focus the dialog first
      await user.keyboard('p')

      expect(window.print).toHaveBeenCalled()
    })

    it('does not trigger print when P is pressed with Cmd/Ctrl', async () => {
      const { user } = renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      // Cmd+P should not trigger our handler (browser handles it)
      await user.keyboard('{Meta>}p{/Meta}')

      expect(window.print).not.toHaveBeenCalled()
    })

    it('does not trigger print when modal is closed', async () => {
      renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={false} onOpenChange={() => {}} />
      )

      // Simulate keydown event when modal is closed
      const event = new KeyboardEvent('keydown', { key: 'p' })
      window.dispatchEvent(event)

      expect(window.print).not.toHaveBeenCalled()
    })
  })

  describe('URL generation error handling', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('silently handles URL generation errors', async () => {
      // Import the mock to control its behavior
      const { generateInvoiceUrl } = await import('@/features/invoice-codec')
      const mockGenerateInvoiceUrl = vi.mocked(generateInvoiceUrl)
      mockGenerateInvoiceUrl.mockImplementation(() => {
        throw new Error('Encoding failed')
      })

      // Should not throw - component handles errors gracefully via try/catch
      expect(() => {
        renderWithUser(
          <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
        )
      }).not.toThrow()
    })

    it('generates URL when data is valid', async () => {
      const { generateInvoiceUrl } = await import('@/features/invoice-codec')
      const mockGenerateInvoiceUrl = vi.mocked(generateInvoiceUrl)
      mockGenerateInvoiceUrl.mockReturnValue('https://voidpay.xyz/pay#abc123')

      renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      // generateInvoiceUrl should be called with valid data
      expect(mockGenerateInvoiceUrl).toHaveBeenCalled()
    })

    it('skips URL generation when required fields missing', async () => {
      const incompleteData: PartialInvoice = {
        // Missing invoiceId, from.walletAddress, networkId
        items: [{ description: 'Test', quantity: 1, rate: '100' }],
      }

      renderWithUser(
        <InvoicePreviewModal data={incompleteData} open={true} onOpenChange={() => {}} />
      )

      // Should not call generateInvoiceUrl at all
      const { generateInvoiceUrl } = await import('@/features/invoice-codec')
      expect(generateInvoiceUrl).not.toHaveBeenCalled()
    })
  })

  describe('action buttons', () => {
    const originalPrint = window.print

    beforeEach(() => {
      window.print = vi.fn()
    })

    afterEach(() => {
      window.print = originalPrint
    })

    it('triggers print when Print button is clicked', async () => {
      const { user } = renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      const printButton = screen.getByRole('button', { name: /print/i })
      await user.click(printButton)

      expect(window.print).toHaveBeenCalled()
    })

    it('triggers print when Download PDF button is clicked', async () => {
      const { user } = renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      const downloadButton = screen.getByRole('button', { name: /download pdf|pdf/i })
      await user.click(downloadButton)

      expect(window.print).toHaveBeenCalled()
    })
  })
})
