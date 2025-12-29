/**
 * InvoicePreviewModal component tests
 * Feature: 014-invoice-paper-widget
 */
import { describe, expect, it, vi } from 'vitest'
import { renderWithUser, screen } from '@/shared/ui/__tests__/test-utils'
import { InvoicePreviewModal } from '../InvoicePreviewModal'
import { InvoiceSchemaV1 } from '@/entities/invoice'

// Mock data
const mockInvoiceData: Partial<InvoiceSchemaV1> = {
  id: 'INV-001',
  iss: 1704067200, // 2024-01-01
  due: 1706745600, // 2024-02-01
  net: 1,
  cur: 'USDC',
  dec: 6,
  f: {
    n: 'Acme Corp',
    a: '0x1234567890abcdef1234567890abcdef12345678',
    e: 'billing@acme.com',
  },
  c: {
    n: 'Client Inc',
  },
  it: [{ d: 'Development services', q: 10, r: '100' }],
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

    it('renders invoice ID in accessible title', () => {
      renderWithUser(
        <InvoicePreviewModal data={mockInvoiceData} open={true} onOpenChange={() => {}} />
      )

      expect(screen.getByText(/Invoice Preview.*INV-001/)).toBeInTheDocument()
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
})
