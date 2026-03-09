import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock fetch (used for /api/transfers requests)
// ---------------------------------------------------------------------------
const mockFetch = vi.fn()
global.fetch = mockFetch

// ---------------------------------------------------------------------------
// Mock parseInvoiceHash
// ---------------------------------------------------------------------------
const mockParseInvoiceHash = vi.fn()

vi.mock('@/features/invoice-codec', () => ({
  parseInvoiceHash: (...args: unknown[]) => mockParseInvoiceHash(...args),
}))

// ---------------------------------------------------------------------------
// Mock matchTransfer
// ---------------------------------------------------------------------------
const mockMatchTransfer = vi.fn()

vi.mock('../../lib/match-transfer', () => ({
  matchTransfer: (...args: unknown[]) => mockMatchTransfer(...args),
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
// Subject under test (imported after mocks — does not exist yet → RED phase)
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
    mockParseInvoiceHash.mockReturnValue({
      success: true,
      data: {
        version: 2,
        invoiceId: 'test',
        networkId: 1,
        currency: 'ETH',
        decimals: 18,
        total: '1000000000000000000',
        from: { walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
        items: [{ description: 'Test', quantity: 1, rate: '1000000000000000000' }],
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // -------------------------------------------------------------------------
  // TC01: Checks all pending `source:'created'` invoices (no txHash)
  // -------------------------------------------------------------------------
  it('TC01: checks all pending created invoices and ignores received/already-paid', async () => {
    mockInvoices = [
      makeInvoice('INV-001', 'created'),              // pending created → should check
      makeInvoice('INV-002', 'created'),              // pending created → should check
      makeInvoice('INV-003', 'received'),             // received → skip
      makeInvoice('INV-004', 'created', '0x' + 'a'.repeat(64)), // has txHash → skip
    ]

    const { result } = renderHook(() => useBatchCheck())

    // Initially not checking
    expect(result.current.isChecking).toBe(false)
    expect(result.current.progress).toEqual({ checked: 0, total: 0 })

    act(() => {
      result.current.checkAll()
    })

    expect(result.current.isChecking).toBe(true)
    expect(result.current.progress.total).toBe(2) // only 2 pending created

    // First invoice checked immediately
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
      fromBlock: '0x1',
    })

    // Advance past inter-invoice delay to trigger second check
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    // Wait for completion
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false)
    })

    // Received and paid invoices were NOT checked
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  // -------------------------------------------------------------------------
  // TC02: Sequential processing with 2s delay between calls (not parallel)
  // -------------------------------------------------------------------------
  it('TC02: processes invoices sequentially with 2s delay (not parallel)', async () => {
    mockInvoices = [
      makeInvoice('INV-SEQ-001', 'created'),
      makeInvoice('INV-SEQ-002', 'created'),
      makeInvoice('INV-SEQ-003', 'created'),
    ]

    // Use a slow-resolving fetch to detect parallelism
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

    const { result } = renderHook(() => useBatchCheck())

    act(() => {
      result.current.checkAll()
    })

    // First fetch starts immediately
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    // Before delay, only 1 fetch should have happened
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Advance past first delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    // Still sequential — max 1 concurrent fetch at any time
    expect(maxConcurrentFetches).toBe(1)

    // Advance past second delay
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

    // First invoice: no match; second invoice: match
    mockMatchTransfer
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(secondTransfer)

    mockFetchOk({ transfers: [MOCK_TRANSFER] })

    const { result } = renderHook(() => useBatchCheck())

    act(() => {
      result.current.checkAll()
    })

    // First check — no match
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
    expect(mockSetTxHash).not.toHaveBeenCalled()

    // Advance to trigger second check
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    // Match found on second invoice → setTxHash called
    await waitFor(() => {
      expect(mockSetTxHash).toHaveBeenCalledTimes(1)
      expect(mockSetTxHash).toHaveBeenCalledWith(
        'INV-MATCH-002',
        secondTransfer.hash,
        false, // not yet validated
      )
    })

    // matchTransfer called with exactTotal from decoded invoice
    expect(mockMatchTransfer).toHaveBeenCalledWith(
      expect.any(Array),
      BigInt('1000000000000000000'), // from decoded invoice.total
    )

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // TC04: Progress tracking exposed correctly
  // -------------------------------------------------------------------------
  it('TC04: progress.checked increments as each invoice is processed', async () => {
    mockInvoices = [
      makeInvoice('INV-PROG-001', 'created'),
      makeInvoice('INV-PROG-002', 'created'),
      makeInvoice('INV-PROG-003', 'created'),
    ]

    const { result } = renderHook(() => useBatchCheck())

    act(() => {
      result.current.checkAll()
    })

    expect(result.current.progress.total).toBe(3)
    expect(result.current.progress.checked).toBe(0)

    // After first check completes
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(result.current.progress.checked).toBe(1)
    })
    expect(result.current.progress.total).toBe(3)

    // Advance to second check
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS + 100)
    })

    await waitFor(() => {
      expect(result.current.progress.checked).toBe(2)
    })

    // Advance to third check
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

    const { result } = renderHook(() => useBatchCheck())

    act(() => {
      result.current.checkAll()
    })

    // Should complete immediately with no fetches
    await waitFor(() => {
      expect(result.current.isChecking).toBe(false)
    })

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result.current.progress).toEqual({ checked: 0, total: 0 })
  })

  // -------------------------------------------------------------------------
  // TC06: Abort on unmount — in-flight sequence is cancelled
  // -------------------------------------------------------------------------
  it('TC06: aborts remaining checks when hook unmounts mid-run', async () => {
    mockInvoices = [
      makeInvoice('INV-ABORT-001', 'created'),
      makeInvoice('INV-ABORT-002', 'created'),
      makeInvoice('INV-ABORT-003', 'created'),
    ]

    const { result, unmount } = renderHook(() => useBatchCheck())

    act(() => {
      result.current.checkAll()
    })

    // First fetch starts
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    // Unmount before remaining checks fire
    unmount()

    // Advance time — remaining checks should NOT fire
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELAY_MS * 5)
    })

    // Only 1 fetch should have occurred (unmounted before rest)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
