import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Polling constants used in assertions
// ---------------------------------------------------------------------------
const AGGRESSIVE_INTERVAL_MS = 12_000
const AGGRESSIVE_MAX_MS = 5 * 60 * 1_000
const WATCHING_INITIAL_MS = 60_000
const WATCHING_SECOND_MS = 120_000
const WATCHING_THIRD_MS = 300_000
const WATCHING_MAX_MS = 30 * 60 * 1_000
const MANUAL_COOLDOWN_MS = 30_000

// ---------------------------------------------------------------------------
// Active polling session counter (simulates module-level session limit)
// ---------------------------------------------------------------------------
let mockActiveSessionCount = 0

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
// Mock invoice store
// ---------------------------------------------------------------------------
const { mockSetTxHash, mockSetError } = vi.hoisted(() => ({
  mockSetTxHash: vi.fn(),
  mockSetError: vi.fn(),
}))

vi.mock('@/entities/invoice', () => {
  const store = {
    setTxHash: mockSetTxHash,
    setError: mockSetError,
  }
  const hook = vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
    return selector ? selector(store) : store
  })
  // Static methods used by the hook
  ;(hook as unknown as Record<string, unknown>).getState = () => ({ invoices: [] })
  ;(hook as unknown as Record<string, unknown>).persist = {
    hasHydrated: () => true,
    onFinishHydration: vi.fn(),
  }
  return { useTrackedInvoiceStore: hook }
})

// ---------------------------------------------------------------------------
// Module under test (imported after mocks — does not exist yet → tests FAIL)
// ---------------------------------------------------------------------------
import { usePaymentPolling } from '../use-payment-polling'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------
const BASE_PARAMS = {
  invoiceId: 'INV-POLL-001',
  toAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as const,
  chainId: 1,
  category: 'external' as const,
  exactTotal: 1_000_000_000_000_000_000n,
  fromBlock: '0x1',
}

const ERC20_PARAMS = {
  ...BASE_PARAMS,
  invoiceId: 'INV-POLL-ERC20',
  category: 'erc20' as const,
  contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  exactTotal: 1_000_000n,
}

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

const EMPTY_TRANSFERS_RESPONSE = { transfers: [] }

function makeTransfersResponse(transfers = [MOCK_TRANSFER]) {
  return { transfers }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mockFetchOk(body: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  })
}

function mockFetch429() {
  mockFetch.mockResolvedValue({
    ok: false,
    status: 429,
    json: async () => ({ error: 'Too Many Requests' }),
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('usePaymentPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockActiveSessionCount = 0
    // Default: no matching transfer
    mockFetchOk(EMPTY_TRANSFERS_RESPONSE)
    mockMatchTransfer.mockReturnValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // -------------------------------------------------------------------------
  // TC01: auto-check mode — single fetch on mount, no polling interval
  // -------------------------------------------------------------------------
  it('auto-check: fires a single fetch on mount and stays idle afterward', async () => {
    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    expect(result.current.mode).toBe('auto-check')
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/transfers',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
        signal: expect.any(AbortSignal),
      }),
    )
    // Verify POST body shape
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(callBody).toEqual({
      toAddress: BASE_PARAMS.toAddress,
      chainId: BASE_PARAMS.chainId,
      category: BASE_PARAMS.category,
      fromBlock: BASE_PARAMS.fromBlock,
    })

    // Advance time well past any interval — should NOT fire again
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 3)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  // -------------------------------------------------------------------------
  // TC02: manual check — single fetch + 30s cooldown
  // -------------------------------------------------------------------------
  it('manual: fires once and enters 30s cooldown (isLoading=false, cooldownUntil set)', async () => {
    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const fetchCountAfterMount = mockFetch.mock.calls.length

    act(() => {
      result.current.startManualCheck()
    })

    expect(result.current.mode).toBe('manual')
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Exactly one additional fetch for the manual trigger
    expect(mockFetch).toHaveBeenCalledTimes(fetchCountAfterMount + 1)

    // Cooldown is active
    expect(result.current.cooldownUntil).toBeDefined()
    expect(result.current.cooldownUntil!).toBeGreaterThan(Date.now())

    // No additional fetches during cooldown
    await vi.advanceTimersByTimeAsync(MANUAL_COOLDOWN_MS - 1000)
    expect(mockFetch).toHaveBeenCalledTimes(fetchCountAfterMount + 1)

    // After cooldown expires, cooldownUntil clears
    await vi.advanceTimersByTimeAsync(2000)
    expect(result.current.cooldownUntil).toBeUndefined()
  })

  // -------------------------------------------------------------------------
  // TC03: aggressive mode — polls every 12s, stops after 5 minutes
  // -------------------------------------------------------------------------
  it('aggressive: polls every 12s and auto-stops after 5 minutes', async () => {
    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.startAggressivePolling()
    })

    expect(result.current.mode).toBe('aggressive')

    // Advance 4 intervals = 4 additional fetches
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 4)
    const countAt4Intervals = mockFetch.mock.calls.length

    // Should have fetched at least 4 times during aggressive polling
    expect(countAt4Intervals).toBeGreaterThanOrEqual(4)

    // Advance past max duration
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_MAX_MS)

    // Mode should revert to idle after max duration
    expect(result.current.mode).toBe('idle')

    const countAfterMax = mockFetch.mock.calls.length

    // No more fetches after stopping
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 3)
    expect(mockFetch).toHaveBeenCalledTimes(countAfterMax)
  })

  // -------------------------------------------------------------------------
  // TC04: watching mode — adaptive intervals (60s → 120s → 300s), max 30min
  // -------------------------------------------------------------------------
  it('watching: uses adaptive intervals 60s → 120s → 300s and stops after 30 minutes', async () => {
    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const baseCount = mockFetch.mock.calls.length

    act(() => {
      result.current.startWatching()
    })

    expect(result.current.mode).toBe('watching')

    // First interval: 60s — should fire fetch
    await vi.advanceTimersByTimeAsync(WATCHING_INITIAL_MS)
    expect(mockFetch).toHaveBeenCalledTimes(baseCount + 1)

    // Second interval: 120s — should fire again
    await vi.advanceTimersByTimeAsync(WATCHING_SECOND_MS)
    expect(mockFetch).toHaveBeenCalledTimes(baseCount + 2)

    // Third interval: 300s — should fire again
    await vi.advanceTimersByTimeAsync(WATCHING_THIRD_MS)
    expect(mockFetch).toHaveBeenCalledTimes(baseCount + 3)

    // Advance past 30-minute max duration
    await vi.advanceTimersByTimeAsync(WATCHING_MAX_MS)

    expect(result.current.mode).toBe('idle')
  })

  // -------------------------------------------------------------------------
  // TC05: watch restart — resets interval back to 60s
  // -------------------------------------------------------------------------
  it('watch restart: resets adaptive interval back to 60s', async () => {
    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.startWatching()
    })

    // Progress to second interval (120s)
    await vi.advanceTimersByTimeAsync(WATCHING_INITIAL_MS + WATCHING_SECOND_MS)
    const countBeforeRestart = mockFetch.mock.calls.length

    // Restart watching — interval resets to 60s
    act(() => {
      result.current.startWatching()
    })

    expect(result.current.mode).toBe('watching')

    // After 60s from restart, should fire
    await vi.advanceTimersByTimeAsync(WATCHING_INITIAL_MS)
    expect(mockFetch).toHaveBeenCalledTimes(countBeforeRestart + 1)

    // After another 60s (not 120s), should fire again (still at first step)
    await vi.advanceTimersByTimeAsync(WATCHING_INITIAL_MS)
    expect(mockFetch).toHaveBeenCalledTimes(countBeforeRestart + 2)
  })

  // -------------------------------------------------------------------------
  // TC06: tab hidden → pause — no fetches while document is hidden
  // -------------------------------------------------------------------------
  it('tab hidden: pauses polling while document.visibilityState is hidden', async () => {
    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.startAggressivePolling()
    })

    // Simulate tab becoming hidden
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    const countWhenHidden = mockFetch.mock.calls.length

    // Advance multiple intervals — should NOT fetch while hidden
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 5)
    expect(mockFetch).toHaveBeenCalledTimes(countWhenHidden)

    // Restore visibility
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    })
  })

  // -------------------------------------------------------------------------
  // TC07: tab visible → catch-up — immediate fetch when tab returns
  // -------------------------------------------------------------------------
  it('tab visible: fires catch-up fetch immediately when tab becomes visible again', async () => {
    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.startAggressivePolling()
    })

    // Hide tab
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    const countWhenHidden = mockFetch.mock.calls.length

    // Advance time while hidden (no fetches)
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 3)
    expect(mockFetch).toHaveBeenCalledTimes(countWhenHidden)

    // Show tab → immediate catch-up fetch
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(countWhenHidden + 1)
    })

    // Restore
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    })
  })

  // -------------------------------------------------------------------------
  // TC08: wall-clock maxDuration — tab hidden time counts toward max
  // -------------------------------------------------------------------------
  it('wall-clock: time spent with tab hidden counts toward maxDuration', async () => {
    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.startAggressivePolling()
    })

    // Hide tab for most of the max duration
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    // Advance past full max duration while hidden
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_MAX_MS + 1000)

    // Restore visibility
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    // Hook should have stopped — mode is idle, no catch-up fetch
    await waitFor(() => {
      expect(result.current.mode).toBe('idle')
    })
  })

  // -------------------------------------------------------------------------
  // TC09: 429 backoff — 3 consecutive 429s → stop polling
  // -------------------------------------------------------------------------
  it('429 backoff: stops polling after 3 consecutive 429 responses', async () => {
    mockFetch429()

    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.startAggressivePolling()
    })

    // Advance through 3 intervals — all return 429
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 1)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 1)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 1)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // After 3 consecutive 429s, polling stops
    expect(result.current.mode).toBe('idle')
    expect(result.current.error).toContain('429')

    const countAfterStop = mockFetch.mock.calls.length

    // No more fetches
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 5)
    expect(mockFetch).toHaveBeenCalledTimes(countAfterStop)
  })

  // -------------------------------------------------------------------------
  // TC10: AbortController cleanup — abort signal fires on unmount (W3-017)
  // -------------------------------------------------------------------------
  it('abort: AbortController signal fires when hook unmounts (W3-017)', async () => {
    let capturedSignal: AbortSignal | undefined

    // Intercept fetch to capture the abort signal
    mockFetch.mockImplementation((_url: string, options: RequestInit) => {
      capturedSignal = options?.signal as AbortSignal
      // Never resolve — keeps isLoading=true so we can unmount mid-request
      return new Promise(() => {})
    })

    const { unmount } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    // Wait until fetch is called and signal is captured
    await waitFor(() => {
      expect(capturedSignal).toBeDefined()
    })

    expect(capturedSignal!.aborted).toBe(false)

    // Unmount → cleanup → abort signal should fire
    unmount()

    expect(capturedSignal!.aborted).toBe(true)
  })

  // -------------------------------------------------------------------------
  // TC11: max 3 concurrent sessions — 4th session rejected
  // -------------------------------------------------------------------------
  it('session limit: rejects starting a new mode when 3 sessions are already active', async () => {
    // Render 3 hooks all in aggressive mode
    const hook1 = renderHook(() => usePaymentPolling({ ...BASE_PARAMS, invoiceId: 'INV-001' }))
    const hook2 = renderHook(() => usePaymentPolling({ ...BASE_PARAMS, invoiceId: 'INV-002' }))
    const hook3 = renderHook(() => usePaymentPolling({ ...BASE_PARAMS, invoiceId: 'INV-003' }))

    await waitFor(() => expect(hook1.result.current.isLoading).toBe(false))
    await waitFor(() => expect(hook2.result.current.isLoading).toBe(false))
    await waitFor(() => expect(hook3.result.current.isLoading).toBe(false))

    act(() => { hook1.result.current.startAggressivePolling() })
    act(() => { hook2.result.current.startAggressivePolling() })
    act(() => { hook3.result.current.startAggressivePolling() })

    expect(hook1.result.current.mode).toBe('aggressive')
    expect(hook2.result.current.mode).toBe('aggressive')
    expect(hook3.result.current.mode).toBe('aggressive')

    // 4th hook tries to start aggressive — should be rejected
    const hook4 = renderHook(() => usePaymentPolling({ ...BASE_PARAMS, invoiceId: 'INV-004' }))
    await waitFor(() => expect(hook4.result.current.isLoading).toBe(false))

    act(() => { hook4.result.current.startAggressivePolling() })

    // 4th hook should remain in idle (or auto-check) — not aggressive
    expect(hook4.result.current.mode).not.toBe('aggressive')
    expect(hook4.result.current.error).toBeDefined()

    hook1.unmount()
    hook2.unmount()
    hook3.unmount()
    hook4.unmount()
  })

  // -------------------------------------------------------------------------
  // TC12: match found — calls setTxHash and triggers verification flow
  // -------------------------------------------------------------------------
  it('match found: calls store.setTxHash and stops polling when transfer matches', async () => {
    mockFetchOk(makeTransfersResponse([MOCK_TRANSFER]))
    mockMatchTransfer.mockReturnValue(MOCK_TRANSFER)

    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    // auto-check fires on mount
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await waitFor(() => {
      expect(mockSetTxHash).toHaveBeenCalledWith(
        BASE_PARAMS.invoiceId,
        MOCK_TRANSFER.hash,
        false, // not yet validated
      )
    })

    // Polling stops after match — mode goes idle
    expect(result.current.mode).toBe('idle')

    // No further fetches
    const countAfterMatch = mockFetch.mock.calls.length
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 5)
    expect(mockFetch).toHaveBeenCalledTimes(countAfterMatch)
  })

  // -------------------------------------------------------------------------
  // TC12b: ERC-20 match — uses contractAddress in /api/transfers query
  // -------------------------------------------------------------------------
  it('ERC-20 match: includes contractAddress in fetch request and calls setTxHash', async () => {
    const erc20Transfer = {
      ...MOCK_TRANSFER,
      category: 'erc20' as const,
      rawContract: {
        value: '1000000',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimal: '6',
      },
    }
    mockFetchOk(makeTransfersResponse([erc20Transfer]))
    mockMatchTransfer.mockReturnValue(erc20Transfer)

    renderHook(() => usePaymentPolling(ERC20_PARAMS))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/transfers',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        }),
      )
    })
    // Verify contractAddress in POST body
    const erc20Body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(erc20Body.contractAddress).toBe(ERC20_PARAMS.contractAddress)

    await waitFor(() => {
      expect(mockSetTxHash).toHaveBeenCalledWith(
        ERC20_PARAMS.invoiceId,
        erc20Transfer.hash,
        false,
      )
    })
  })

  // -------------------------------------------------------------------------
  // TC13: stop() — exits any active polling mode immediately
  // -------------------------------------------------------------------------
  it('stop: exits aggressive mode immediately when stop() is called', async () => {
    const { result } = renderHook(() => usePaymentPolling(BASE_PARAMS))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.startAggressivePolling()
    })

    expect(result.current.mode).toBe('aggressive')

    act(() => {
      result.current.stop()
    })

    expect(result.current.mode).toBe('idle')

    const countAfterStop = mockFetch.mock.calls.length
    await vi.advanceTimersByTimeAsync(AGGRESSIVE_INTERVAL_MS * 10)
    expect(mockFetch).toHaveBeenCalledTimes(countAfterStop)
  })
})
