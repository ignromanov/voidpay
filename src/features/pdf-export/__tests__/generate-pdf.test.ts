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

const mockBuildDocument = vi.fn(() => ({ pageSize: 'A4', content: [] }))
const mockBuildFilename = vi.fn(() => 'voidpay-INV-001-1000.00-USDC.pdf')

vi.mock('../lib/build-document', () => ({
  buildDocument: (...args: unknown[]) => mockBuildDocument(...(args as Parameters<typeof mockBuildDocument>)),
  buildFilename: (...args: unknown[]) => mockBuildFilename(...(args as Parameters<typeof mockBuildFilename>)),
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
    mockBuildDocument.mockReturnValue({ pageSize: 'A4', content: [] })
    mockBuildFilename.mockReturnValue('voidpay-INV-001-1000.00-USDC.pdf')
  })

  it('calls pdfmake createPdf and download with correct filename', async () => {
    await exportInvoicePdf(MOCK_INVOICE, {})
    expect(mockCreatePdf).toHaveBeenCalledTimes(1)
    expect(mockDownload).toHaveBeenCalledWith('voidpay-INV-001-1000.00-USDC.pdf')
  })

  it('passes document definition to createPdf', async () => {
    const mockDoc = { pageSize: 'A4', content: [], watermark: { text: 'PAID' } }
    mockBuildDocument.mockReturnValue(mockDoc)
    await exportInvoicePdf(MOCK_INVOICE, { status: 'paid' })
    expect(mockCreatePdf).toHaveBeenCalledWith(mockDoc)
  })

  it('shows error toast when createPdf throws', async () => {
    mockCreatePdf.mockImplementationOnce(() => { throw new Error('PDF error') })
    await exportInvoicePdf(MOCK_INVOICE, {})
    expect(toast.error).toHaveBeenCalledWith('Failed to generate PDF')
  })
})
