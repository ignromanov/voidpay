/**
 * useReceivedInvoices hook tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { useReceivedInvoices } from '../use-received-invoices'

// Mock invoice-codec parseInvoiceHash
vi.mock('@/features/invoice-codec', () => ({
  parseInvoiceHash: vi.fn(),
}))

// Mock computeInvoiceStatus
vi.mock('@/entities/invoice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/invoice')>()
  return {
    ...actual,
    computeInvoiceStatus: vi.fn(() => 'pending'),
  }
})

import { parseInvoiceHash } from '@/features/invoice-codec'
import { computeInvoiceStatus } from '@/entities/invoice'

const mockParseInvoiceHash = vi.mocked(parseInvoiceHash)
const mockComputeInvoiceStatus = vi.mocked(computeInvoiceStatus)

const makeTracked = (overrides?: Record<string, unknown>) => ({
  contentHash: (overrides?.contentHash as string) ?? 'abc123hash',
  invoiceId: 'INV-001',
  invoiceUrl: 'https://voidpay.xyz/pay#abc123',
  source: 'received' as const,
  createdAt: '2024-01-15T10:00:00.000Z',
  ...overrides,
})

const mockInvoice = {
  invoiceId: 'INV-001',
  currency: 'USDC',
  networkId: 1,
  decimals: 6,
  from: { walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
  items: [],
}

describe('useReceivedInvoices', () => {
  beforeEach(() => {
    useTrackedInvoiceStore.setState({ invoices: [] })
    mockParseInvoiceHash.mockResolvedValue({ success: true, data: mockInvoice } as unknown as Awaited<ReturnType<typeof parseInvoiceHash>>)
    mockComputeInvoiceStatus.mockReturnValue('pending')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty array when no received invoices exist', async () => {
    useTrackedInvoiceStore.setState({ invoices: [] })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toEqual([])
    })
  })

  it('ignores invoices with source "created"', async () => {
    useTrackedInvoiceStore.setState({
      invoices: [makeTracked({ source: 'created' })],
    })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(0)
    })
  })

  it('decodes received invoices and returns results', async () => {
    useTrackedInvoiceStore.setState({
      invoices: [makeTracked()],
    })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })

    expect(result.current[0].invoice).toEqual(mockInvoice)
    expect(result.current[0].tracked).toEqual(makeTracked())
  })

  it('extracts the hash fragment from invoiceUrl', async () => {
    useTrackedInvoiceStore.setState({
      invoices: [makeTracked({ invoiceUrl: 'https://voidpay.xyz/pay#myhash' })],
    })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })

    expect(mockParseInvoiceHash).toHaveBeenCalledWith('myhash')
  })

  it('sets invoice to null when parsing fails', async () => {
    mockParseInvoiceHash.mockResolvedValue({ success: false, error: new Error('parse error') } as unknown as Awaited<ReturnType<typeof parseInvoiceHash>>)

    useTrackedInvoiceStore.setState({
      invoices: [makeTracked()],
    })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })

    expect(result.current[0].invoice).toBeNull()
  })

  it('computes status for each decoded invoice', async () => {
    mockComputeInvoiceStatus.mockReturnValue('paid')
    useTrackedInvoiceStore.setState({
      invoices: [makeTracked()],
    })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })

    expect(result.current[0].status).toBe('paid')
  })

  it('passes dueAt to computeInvoiceStatus when parse succeeds', async () => {
    const invoiceWithDue = { ...mockInvoice, dueAt: '2024-12-31T00:00:00.000Z' }
    mockParseInvoiceHash.mockResolvedValue({ success: true, data: invoiceWithDue } as unknown as Awaited<ReturnType<typeof parseInvoiceHash>>)

    useTrackedInvoiceStore.setState({
      invoices: [makeTracked()],
    })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })

    expect(mockComputeInvoiceStatus).toHaveBeenCalledWith(
      expect.objectContaining({ dueAt: '2024-12-31T00:00:00.000Z' }),
    )
  })

  it('passes undefined dueAt when parse fails', async () => {
    mockParseInvoiceHash.mockResolvedValue({ success: false, error: new Error('err') } as unknown as Awaited<ReturnType<typeof parseInvoiceHash>>)

    useTrackedInvoiceStore.setState({
      invoices: [makeTracked()],
    })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })

    expect(mockComputeInvoiceStatus).toHaveBeenCalledWith(
      expect.objectContaining({ dueAt: undefined }),
    )
  })

  it('handles invoiceUrl without a hash fragment', async () => {
    useTrackedInvoiceStore.setState({
      invoices: [makeTracked({ invoiceUrl: 'https://voidpay.xyz/pay' })],
    })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })

    expect(mockParseInvoiceHash).toHaveBeenCalledWith('')
  })

  it('decodes multiple received invoices', async () => {
    useTrackedInvoiceStore.setState({
      invoices: [
        makeTracked({ contentHash: 'hash1', invoiceId: 'INV-001', invoiceUrl: 'https://voidpay.xyz/pay#hash1' }),
        makeTracked({ contentHash: 'hash2', invoiceId: 'INV-002', invoiceUrl: 'https://voidpay.xyz/pay#hash2' }),
      ],
    })

    const { result } = renderHook(() => useReceivedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(2)
    })

    expect(mockParseInvoiceHash).toHaveBeenCalledTimes(2)
  })
})
