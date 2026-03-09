import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { DecodedBatchInvoice } from '../use-batch-check'

// ---------------------------------------------------------------------------
// Mock fetch (used for /api/transfers requests)
// ---------------------------------------------------------------------------
const mockFetch = vi.fn()
global.fetch = mockFetch

// ---------------------------------------------------------------------------
// Mock matchTransfer
// ---------------------------------------------------------------------------
const mockMatchTransfer = vi.fn()

vi.mock('../../lib/match-transfer', () => ({
  matchTransfer: (...args: unknown[]) => mockMatchTransfer(...args),
}))

// ---------------------------------------------------------------------------
// Mock estimateFromBlockHex
// ---------------------------------------------------------------------------
vi.mock('@/entities/network', () => ({
  estimateFromBlockHex: (_chainId: number, _issuedAt: number) => '0xabc123',
}))

// ---------------------------------------------------------------------------
// Mock invoice store
// ---------------------------------------------------------------------------
const mockSetTxHash = vi.fn()
let mockInvoices: Array<{
  invoiceId: string
  source: 'created' | 'received'
  txHash?: string
  invoiceUrl: string
  createdAt: string
}> = []

vi.mock('@/entities/invoice', () => ({
  useTrackedInvoiceStore: vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
    const store = {
      invoices: mockInvoices,
      setTxHash: mockSetTxHash,
    }
    return selector ? selector(store) : store
  }),
}))

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------
import { useBatchCheck } from '../use-batch-check'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------
const MOCK_TRANSFER = {
  hash: '0xdeadbeef00000000000000000000000000000000000000000000000000000001' as `0x${string}`,
  rawContract: {
    value: '1000000000000000000',
    address: null,
    decimal: '18',
  },
  category: 'external' as const,
  blockTimestamp: '2024-01-01T00:00:00Z',
}

const DECODED_INVOICE: DecodedBatchInvoice = {
  toAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  networkId: 1,
  total: '1000000000000000000',
  issuedAt: Math.floor(Date.now() / 1000) - 3600,
}

const mockDecoder = vi.fn<(url: string) => DecodedBatchInvoice | null>()

function makeInvoice(
  id: string,
  source: 'created' | 'received' = 'created',
  txHash?: string,
) {
  return {
    invoiceId: id,
    source,
    invoiceUrl: `https://voidpay.xyz/pay#${id}`,
    createdAt: new Date().toISOString(),
    ...(txHash ? { txHash } : {}),
  }
}

function mockFetchOk(body: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  })
}

const DELAY_MS = 2_000

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useBatchCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockInvoices = []
    mockMatchTransfer.mockReturnValue(null)
    mockFetchOk({ transfers: [] })
    mockDecoder.mockReturnValue(DECODED_INVOICE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const renderBatchCheck = () =>
    renderHook(() => useBatchCheck({ decodeInvoiceUrl: mockDecoder }))

  // -------------------------------------------------------------------------
  // TC01: Checks all pending `source:'created'` invoices (no txHash)
  // -------------------------------------------------------------------------
  it('TC01: checks all pending created invoices and ignores received/already-paid', async () => {
    mockInvoices = [
      makeInvoice('INV-001', 'created'),
      makeInvoice('INV-002', 'created'),
      makeInvoice('INV-003', 'received'),
      makeInvoice('INV-004', 'created', '0x' + 'a'.repeat(64)),
    ]

    const { result } = renderBatchCheck()

    expect(result.current.isChecking).toBe(false)
    expect(result.current.progress).toEqual({ checked: 0, total: 0 })

    act(() => {
      result.current.checkAll()
    })

    expect(result.current.isChecking).toBe(true)
    expect(result.current.progress.total).toBe(2)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/transfers')
    expect(init.method).toBe('POST')
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    expect(body).toMatchObject({
      toAddress: expect.any(String),
      chainId: expect.any(Number),
      category: expect.stringMatching(/^(external|erc20)$/),
      fromBlock: '0xabc123',
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  // -------------------------------------------------------------------------
  // TC02: Sequential processing with 2s delay
  // -------------------------------------------------------------------------
  it('TC02: processes invoices sequentially with 2s delay (not parallel)', async () => {
    mockInvoices = [
      makeInvoice('INV-SEQ-001', 'created'),
      makeInvoice('INV-SEQ-002', 'created'),
      makeInvoice('INV-SEQ-003', 'created'),
    ]

    let concurrentFetchCount = 0
    let maxConcurrentFetches = 0

    mockFetch.mockImplementation(() => {
      concurrentFetchCount++
      maxConcurrentFetches = Math.max(maxConcurrentFetches, concurrentFetchCount)
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => {
          concurrentFetchCount--
          return { transfers: [] }
        },
      })
    })

    const { result } = renderBatchCheck()

    act(() => {
      result.current.checkAll()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    expect(maxConcurrentFetches).toBe(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    expect(maxConcurrentFetches).toBe(1)
  })

  // -------------------------------------------------------------------------
  // TC03: Found payments update store via setTxHash
  // -------------------------------------------------------------------------
  it('TC03: calls setTxHash when a matching transfer is found', async () => {
    mockInvoices = [
      makeInvoice('INV-MATCH-001', 'created'),
      makeInvoice('INV-MATCH-002', 'created'),
    ]

    const secondTransfer = {
      ...MOCK_TRANSFER,
      hash: '0x' + 'b'.repeat(64) as `0x${string}`,
    }

    mockMatchTransfer
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(secondTransfer)

    mockFetchOk({ transfers: [MOCK_TRANSFER] })

    const { result } = renderBatchCheck()

    act(() => {
      result.current.checkAll()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
    expect(mockSetTxHash).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    await waitFor(() => {
      expect(mockSetTxHash).toHaveBeenCalledTimes(1)
      expect(mockSetTxHash).toHaveBeenCalledWith(
        'INV-MATCH-002',
        secondTransfer.hash,
        false,
      )
    })

    // matchTransfer called with exactTotal + optional contract
    expect(mockMatchTransfer).toHaveBeenCalledWith(
      expect.any(Array),
      BigInt('1000000000000000000'),
      undefined, // no tokenAddress in DECODED_INVOICE
    )

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // TC04: Progress tracking
  // -------------------------------------------------------------------------
  it('TC04: progress.checked increments as each invoice is processed', async () => {
    mockInvoices = [
      makeInvoice('INV-PROG-001', 'created'),
      makeInvoice('INV-PROG-002', 'created'),
      makeInvoice('INV-PROG-003', 'created'),
    ]

    const { result } = renderBatchCheck()

    act(() => {
      result.current.checkAll()
    })

    expect(result.current.progress.total).toBe(3)
    expect(result.current.progress.checked).toBe(0)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(result.current.progress.checked).toBe(1)
    })
    expect(result.current.progress.total).toBe(3)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(result.current.progress.checked).toBe(2)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(result.current.progress.checked).toBe(3)
      expect(result.current.isChecking).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // TC05: Empty store — checkAll is a no-op
  // -------------------------------------------------------------------------
  it('TC05: does nothing when there are no pending created invoices', async () => {
    mockInvoices = [
      makeInvoice('INV-RECV', 'received'),
      makeInvoice('INV-PAID', 'created', '0x' + 'c'.repeat(64)),
    ]

    const { result } = renderBatchCheck()

    act(() => {
      result.current.checkAll()
    })

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false)
    })

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result.current.progress).toEqual({ checked: 0, total: 0 })
  })

  // -------------------------------------------------------------------------
  // TC06: Abort on unmount
  // -------------------------------------------------------------------------
  it('TC06: aborts remaining checks when hook unmounts mid-run', async () => {
    mockInvoices = [
      makeInvoice('INV-ABORT-001', 'created'),
      makeInvoice('INV-ABORT-002', 'created'),
      makeInvoice('INV-ABORT-003', 'created'),
    ]

    const { result, unmount } = renderBatchCheck()

    act(() => {
      result.current.checkAll()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS * 5)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  // -------------------------------------------------------------------------
  // TC07: Decoder returning null skips that invoice
  // -------------------------------------------------------------------------
  it('TC07: skips invoices where decoder returns null', async () => {
    mockInvoices = [
      makeInvoice('INV-NULL-001', 'created'),
      makeInvoice('INV-NULL-002', 'created'),
    ]

    mockDecoder
      .mockReturnValueOnce(null) // first invoice can't be decoded
      .mockReturnValueOnce(DECODED_INVOICE) // second succeeds

    const { result } = renderBatchCheck()

    act(() => {
      result.current.checkAll()
    })

    // First invoice skipped (decoder returned null), second needs delay
    // Advance past inter-invoice delay so second invoice can process
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false)
    })

    // Only 1 fetch — first invoice was skipped by decoder
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockDecoder).toHaveBeenCalledTimes(2)
  })
})
