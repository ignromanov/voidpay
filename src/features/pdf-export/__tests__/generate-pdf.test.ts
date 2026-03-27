import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDownload = vi.fn()
const mockCreatePdf = vi.fn(() => ({ download: mockDownload }))

vi.mock('pdfmake/build/pdfmake', () => ({
  default: { createPdf: mockCreatePdf },
  createPdf: mockCreatePdf,
  addVirtualFileSystem: vi.fn(),
}))

vi.mock('pdfmake/build/vfs_fonts', () => ({
  default: { 'Roboto-Regular.ttf': 'mock-font-data' },
}))

vi.mock('@/shared/lib/toast', () => ({
  toast: { error: vi.fn() },
}))

import { exportInvoicePdf } from '../lib/generate-pdf'
import { toast } from '@/shared/lib/toast'
import type { PartialInvoice } from '@/shared/lib/invoice-types'

const MOCK_INVOICE: PartialInvoice = {
  invoiceId: 'INV-001',
  issuedAt: 1710000000,
  dueAt: 1712678400,
  networkId: 42161,
  currency: 'USDC',
  decimals: 6,
  from: { name: 'Acme Corp', walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
  client: { name: 'Client Inc' },
  items: [{ description: 'Service', quantity: 1, rate: '1000000000' }],
  total: '1000000000',
}

describe('exportInvoicePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls pdfmake createPdf and download with correct filename', async () => {
    await exportInvoicePdf(MOCK_INVOICE, {})
    expect(mockCreatePdf).toHaveBeenCalledTimes(1)
    expect(mockDownload).toHaveBeenCalledWith('voidpay-INV-001-1000.00-USDC.pdf')
  })

  it('passes document definition to createPdf', async () => {
    await exportInvoicePdf(MOCK_INVOICE, { status: 'paid' })
    const docDef = mockCreatePdf.mock.calls[0]?.[0] as Record<string, unknown> | undefined
    expect(docDef).toBeDefined()
    expect(docDef?.pageSize).toBe('A4')
    expect(docDef?.watermark).toBeDefined()
  })

  it('shows error toast when createPdf throws', async () => {
    mockCreatePdf.mockImplementationOnce(() => { throw new Error('PDF error') })
    await exportInvoicePdf(MOCK_INVOICE, {})
    expect(toast.error).toHaveBeenCalledWith('Failed to generate PDF')
  })
})
