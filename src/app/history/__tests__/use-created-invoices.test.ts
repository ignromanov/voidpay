/**
 * useCreatedInvoices hook tests
 *
 * Regression coverage for the stale-status bug: after `setTxHash` runs
 * (e.g. via Check Unpaid), the hook must recompute status from the
 * fresh tracked invoice instead of serving a cached 'pending'.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { useCreatedInvoices } from '../use-created-invoices'

vi.mock('@/features/invoice-codec', () => ({
  parseInvoiceHash: vi.fn(),
}))

vi.mock('@/entities/invoice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/invoice')>()
  return {
    ...actual,
    computeInvoiceStatus: vi.fn(),
  }
})

import { parseInvoiceHash } from '@/features/invoice-codec'
import { computeInvoiceStatus } from '@/entities/invoice'

const mockParseInvoiceHash = vi.mocked(parseInvoiceHash)
const mockComputeInvoiceStatus = vi.mocked(computeInvoiceStatus)

const TX_HASH: `0x${string}` =
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd'

const makeTracked = (overrides?: Record<string, unknown>) => ({
  contentHash: (overrides?.contentHash as string) ?? 'abc123hash',
  invoiceId: 'INV-001',
  invoiceUrl: 'https://voidpay.xyz/pay#abc123',
  source: 'created' as const,
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

describe('useCreatedInvoices', () => {
  beforeEach(() => {
    useTrackedInvoiceStore.setState({ invoices: [] })
    mockParseInvoiceHash.mockResolvedValue({
      success: true,
      data: mockInvoice,
    } as unknown as Awaited<ReturnType<typeof parseInvoiceHash>>)
    // Semantic mock: status derives from tracked.txHash like the real fn.
    mockComputeInvoiceStatus.mockImplementation((input) =>
      input.tracked?.txHash ? 'confirming' : 'pending',
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ignores invoices with source "received"', async () => {
    useTrackedInvoiceStore.setState({
      invoices: [makeTracked({ source: 'received' })],
    })

    const { result } = renderHook(() => useCreatedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(0)
    })
  })

  it('decodes created invoices and returns fresh status', async () => {
    useTrackedInvoiceStore.setState({ invoices: [makeTracked()] })

    const { result } = renderHook(() => useCreatedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })
    expect(result.current[0]!.status).toBe('pending')
    expect(result.current[0]!.invoice).toEqual(mockInvoice)
  })

  // Regression: Check Unpaid sets txHash but list kept showing 'pending'.
  // Root cause was caching `status` keyed by invoiceUrl. Ensure status is
  // recomputed from the fresh tracked invoice when the store updates.
  it('refreshes status when setTxHash updates an existing invoice', async () => {
    useTrackedInvoiceStore.setState({ invoices: [makeTracked()] })

    const { result } = renderHook(() => useCreatedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })
    expect(result.current[0]!.status).toBe('pending')

    // Simulate Check Unpaid finding a matching transfer.
    act(() => {
      useTrackedInvoiceStore.getState().setTxHash('abc123hash', TX_HASH, false)
    })

    await waitFor(() => {
      expect(result.current[0]!.status).toBe('confirming')
    })
    expect(result.current[0]!.tracked.txHash).toBe(TX_HASH)
  })

  it('reuses parsed invoice cache across store updates (no re-parse)', async () => {
    useTrackedInvoiceStore.setState({ invoices: [makeTracked()] })

    const { result } = renderHook(() => useCreatedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })
    expect(mockParseInvoiceHash).toHaveBeenCalledTimes(1)

    act(() => {
      useTrackedInvoiceStore.getState().setTxHash('abc123hash', TX_HASH, false)
    })

    await waitFor(() => {
      expect(result.current[0]!.status).toBe('confirming')
    })
    // Cache hit on the same invoiceUrl — no extra parse after the update.
    expect(mockParseInvoiceHash).toHaveBeenCalledTimes(1)
  })

  it('sets invoice to null when parsing fails', async () => {
    mockParseInvoiceHash.mockResolvedValue({
      success: false,
      error: new Error('parse error'),
    } as unknown as Awaited<ReturnType<typeof parseInvoiceHash>>)

    useTrackedInvoiceStore.setState({ invoices: [makeTracked()] })

    const { result } = renderHook(() => useCreatedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })
    expect(result.current[0]!.invoice).toBeNull()
  })

  it('handles invoiceUrl without a hash fragment', async () => {
    useTrackedInvoiceStore.setState({
      invoices: [makeTracked({ invoiceUrl: 'https://voidpay.xyz/pay' })],
    })

    const { result } = renderHook(() => useCreatedInvoices())

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })
    expect(result.current[0]!.invoice).toBeNull()
    expect(mockParseInvoiceHash).not.toHaveBeenCalled()
  })
})
