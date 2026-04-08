import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock entities/invoice store
const mockRemoveInvoice = vi.fn()
vi.mock('@/entities/invoice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/invoice')>()
  return {
    ...actual,
    useTrackedInvoiceStore: Object.assign(
      (selector: (s: { removeInvoice: typeof mockRemoveInvoice }) => unknown) =>
        selector({ removeInvoice: mockRemoveInvoice }),
      { persist: { hasHydrated: () => true } },
    ),
  }
})

// Mock duplicate-invoice
vi.mock('../lib/duplicate-invoice', () => ({
  duplicateFromUrl: vi.fn().mockResolvedValue('draft-123'),
}))

// Mock toast
vi.mock('@/shared/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { InvoiceList } from '../ui/InvoiceList'
import type { DecodedHistoryEntry } from '../lib/types'
import type { Invoice, TrackedInvoice, InvoiceStatus } from '@/entities/invoice'

function makeEntry(overrides: {
  invoiceId?: string
  networkId?: number
  currency?: string
  status?: InvoiceStatus
  clientName?: string
  total?: string
  decimals?: number
  dueAt?: number
} = {}): DecodedHistoryEntry {
  const tracked: TrackedInvoice = {
    invoiceId: overrides.invoiceId ?? 'INV-042',
    invoiceUrl: 'https://voidpay.xyz/pay#test',
    source: 'created',
    createdAt: '2026-04-03T10:00:00Z',
  }
  const invoice: Invoice = {
    invoiceId: overrides.invoiceId ?? 'INV-042',
    issuedAt: 1743667200,
    dueAt: overrides.dueAt ?? 1744704000,
    networkId: overrides.networkId ?? 1,
    currency: overrides.currency ?? 'USDC',
    decimals: overrides.decimals ?? 6,
    from: { name: 'Me', walletAddress: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}` },
    client: { name: overrides.clientName ?? 'Acme Corp' },
    items: [{ description: 'Service', quantity: 1, rate: '1250000000' }],
    total: overrides.total ?? '1250000000',
  }
  return { tracked, invoice, status: overrides.status ?? 'pending' }
}

describe('InvoiceList', () => {
  it('renders invoice ID', () => {
    render(<InvoiceList variant="created" entries={[makeEntry()]} debug={false} />)
    expect(screen.getByText('INV-042')).toBeInTheDocument()
  })

  it('renders client name', () => {
    render(<InvoiceList variant="created" entries={[makeEntry({ clientName: 'Acme Corp' })]} debug={false} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders network badge', () => {
    render(<InvoiceList variant="created" entries={[makeEntry({ networkId: 1 })]} debug={false} />)
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('renders amount without magic dust (subtotal)', () => {
    render(<InvoiceList variant="created" entries={[makeEntry({ total: '1250000000', decimals: 6 })]} debug={false} />)
    expect(screen.getByText(/1,250/)).toBeInTheDocument()
  })

  it('renders View button', () => {
    render(<InvoiceList variant="created" entries={[makeEntry()]} debug={false} />)
    expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
  })

  it('renders Template button', () => {
    render(<InvoiceList variant="created" entries={[makeEntry()]} debug={false} />)
    expect(screen.getByRole('button', { name: /template/i })).toBeInTheDocument()
  })

  it('renders Delete button', () => {
    render(<InvoiceList variant="created" entries={[makeEntry()]} debug={false} />)
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows empty state when no entries', () => {
    render(<InvoiceList variant="created" entries={[]} debug={false} />)
    expect(screen.getByText(/created invoices will appear here/i)).toBeInTheDocument()
  })
})
