import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// Mock viem's waitForTransactionReceipt
const mockWaitForTransactionReceipt = vi.fn()

vi.mock('viem', () => ({
  waitForTransactionReceipt: (...args: unknown[]) => mockWaitForTransactionReceipt(...args),
}))

const BLOCK_HASH = '0xaaaa000000000000000000000000000000000000000000000000000000000001'

// Fixed block timestamp returned by getBlock mock.
const MOCK_BLOCK_TIMESTAMP_S = 1_700_000_000n
const MOCK_BLOCK_TIMESTAMP_MS = 1_700_000_000_000

// Mock wagmi usePublicClient
let mockFinalizedNumber = 100n

const mockPublicClient = {
  waitForTransactionReceipt: vi.fn(),
  getTransactionReceipt: vi.fn(),
  getBlock: vi.fn(),
}

vi.mock('wagmi', () => ({
  usePublicClient: vi.fn(() => mockPublicClient),
}))

// Mock invoice store
const { mockSetValidated, mockSetFinalized, mockResetPaymentState } = vi.hoisted(() => ({
  mockSetValidated: vi.fn(),
  mockSetFinalized: vi.fn(),
  mockResetPaymentState: vi.fn(),
}))

vi.mock('@/entities/invoice', () => {
  const storeState = {
    invoices: [] as Array<{ contentHash: string; invoiceId: string; finalized?: boolean }>,
    setValidated: mockSetValidated,
    setFinalized: mockSetFinalized,
    resetPaymentState: mockResetPaymentState,
  }
  return {
    useTrackedInvoiceStore: Object.assign(
      vi.fn((selector?: (s: typeof storeState) => unknown) => {
        return selector ? selector(storeState) : storeState
      }),
      { getState: () => storeState },
    ),
  }
})

// Mock toast
const mockToastError = vi.fn()
const mockToastWarning = vi.fn()

vi.mock('@/shared/lib/toast', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    warning: (...args: unknown[]) => mockToastWarning(...args),
  },
}))

// Mock shared lib — useIsMobile (QW2: reorg toast gating)
let mockIsMobile = false
vi.mock('@/shared/lib', () => ({
  useIsMobile: vi.fn(() => mockIsMobile),
}))

import {
  useFinalizationTracker,
  FINALITY_POLL_INTERVAL_MS,
  REORG_ABSENT_MIN_POLLS,
  REORG_ABSENT_MIN_SPAN_MS,
} from '../use-finalization-tracker'

const MOCK_TX_HASH = '0xdeadbeef00000000000000000000000000000000000000000000000000000001' as `0x${string}`

describe('useFinalizationTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockIsMobile = false
    mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
      transactionHash: MOCK_TX_HASH,
    })
    mockPublicClient.getTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
      transactionHash: MOCK_TX_HASH,
    })
    mockFinalizedNumber = 100n
    mockPublicClient.getBlock.mockImplementation(async (args: { blockTag?: string }) =>
      args.blockTag === 'finalized'
        ? { number: mockFinalizedNumber }
        : { timestamp: MOCK_BLOCK_TIMESTAMP_S },
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Test case 1: Successful finalization → setFinalized called silently (no toast)
  it('calls setFinalized silently when finalization succeeds', async () => {
    mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
      transactionHash: MOCK_TX_HASH,
    })

    renderHook(() =>
      useFinalizationTracker({
        contentHash: 'inv001-hash',
        txHash: MOCK_TX_HASH,
        networkId: 1, // Ethereum — 60 min timeout
      })
    )

    await waitFor(() => {
      expect(mockSetFinalized).toHaveBeenCalledWith('inv001-hash')
    })

    // Silent — no toast on success
    expect(mockToastError).not.toHaveBeenCalled()
    expect(mockToastWarning).not.toHaveBeenCalled()
    expect(mockResetPaymentState).not.toHaveBeenCalled()
  })

  // Regression: paidAt must come from the block's wall-clock timestamp, not Date.now().
  it('passes block timestamp to setValidated as paidAtMs', async () => {
    mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
      transactionHash: MOCK_TX_HASH,
    })
    
    renderHook(() =>
      useFinalizationTracker({
        contentHash: 'inv-paidat-hash',
        txHash: MOCK_TX_HASH,
        networkId: 1,
      })
    )

    await waitFor(() => {
      expect(mockSetValidated).toHaveBeenCalledWith('inv-paidat-hash', true, MOCK_BLOCK_TIMESTAMP_MS)
    })

    expect(mockPublicClient.getBlock).toHaveBeenCalledWith({ blockNumber: 100n })
  })

  // Regression: when getBlock throws, paidAtMs is undefined but finalization still completes.
  it('falls back to undefined paidAtMs when getBlock fails', async () => {
    mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
      transactionHash: MOCK_TX_HASH,
    })
    mockPublicClient.getBlock.mockImplementation(async (args: { blockTag?: string }) => {
      if (args.blockTag === 'finalized') return { number: mockFinalizedNumber }
      throw new Error('rpc error')
    })

    renderHook(() =>
      useFinalizationTracker({
        contentHash: 'inv-fallback-hash',
        txHash: MOCK_TX_HASH,
        networkId: 1,
      })
    )

    await waitFor(() => {
      expect(mockSetValidated).toHaveBeenCalledWith('inv-fallback-hash', true, undefined)
    })

    expect(mockSetFinalized).toHaveBeenCalledWith('inv-fallback-hash')
  })

  // Test case 2: Timeout (60 min ETH / 30 min L2) → invoice remains paid, no revert (W3-012)
  it('ETH: does NOT revert payment state after 60-minute finalization timeout', async () => {
    // Finalization never resolves within timeout
    mockPublicClient.waitForTransactionReceipt.mockImplementation(
      () => new Promise(() => {}) // never resolves
    )

    renderHook(() =>
      useFinalizationTracker({
        contentHash: 'inv001-hash',
        txHash: MOCK_TX_HASH,
        networkId: 1, // Ethereum — 60 min timeout
      })
    )

    // Advance past the 60-minute ETH finalization timeout
    await vi.advanceTimersByTimeAsync(61 * 60 * 1000)

    // W3-012: timeout must NOT revert payment state — invoice stays "Paid"
    expect(mockResetPaymentState).not.toHaveBeenCalled()
    expect(mockSetFinalized).not.toHaveBeenCalled()
    // No alarming toast on timeout (silent degradation)
    expect(mockToastError).not.toHaveBeenCalled()
  })

  it('L2 (Arbitrum): does NOT revert payment state after 30-minute finalization timeout', async () => {
    mockPublicClient.waitForTransactionReceipt.mockImplementation(
      () => new Promise(() => {}) // never resolves
    )

    renderHook(() =>
      useFinalizationTracker({
        contentHash: 'inv-l2-001-hash',
        txHash: MOCK_TX_HASH,
        networkId: 42161, // Arbitrum — 30 min timeout
      })
    )

    // Advance past the 30-minute L2 finalization timeout
    await vi.advanceTimersByTimeAsync(31 * 60 * 1000)

    // W3-012: timeout must NOT revert — invoice stays "Paid"
    expect(mockResetPaymentState).not.toHaveBeenCalled()
    expect(mockSetFinalized).not.toHaveBeenCalled()
  })

  // Test case: enabled=false prevents all finalization side effects
  it('enabled=false: does not start finalization tracking', async () => {
    mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
      transactionHash: MOCK_TX_HASH,
    })

    renderHook(() =>
      useFinalizationTracker({
        contentHash: 'inv001-hash',
        txHash: MOCK_TX_HASH,
        networkId: 1,
        enabled: false,
      })
    )

    // Advance past the 60-minute ETH finalization timeout
    await vi.advanceTimersByTimeAsync(61 * 60 * 1000)

    expect(mockPublicClient.waitForTransactionReceipt).not.toHaveBeenCalled()
    expect(mockSetFinalized).not.toHaveBeenCalled()
    expect(mockResetPaymentState).not.toHaveBeenCalled()
  })

  // Test case: enabled false→true starts tracking
  it('enabled false→true: starts finalization tracking on re-enable', async () => {
    mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
      transactionHash: MOCK_TX_HASH,
    })

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useFinalizationTracker({
          contentHash: 'inv001-hash',
          txHash: MOCK_TX_HASH,
          networkId: 1,
          enabled,
        }),
      { initialProps: { enabled: false } }
    )

    // Nothing started yet
    expect(mockPublicClient.waitForTransactionReceipt).not.toHaveBeenCalled()

    // Re-enable
    rerender({ enabled: true })

    await waitFor(() => {
      expect(mockSetFinalized).toHaveBeenCalledWith('inv001-hash')
    })
  })

  // Receipt wait errors (viem 180s timeout, 503 from the fail-closed limiter) are not reorg evidence.
  it.each([
    ['viem timeout', Object.assign(new Error('Timed out while waiting for transaction'), { name: 'WaitForTransactionReceiptTimeoutError' })],
    ['503 from rate limiter', new Error('HTTP request failed. Status: 503')],
  ])('waitForTransactionReceipt %s: keeps paid state, no reset, no toast', async (_n, err) => {
    mockPublicClient.waitForTransactionReceipt.mockRejectedValue(err)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    renderHook(() =>
      useFinalizationTracker({ contentHash: 'inv-wait-err-hash', txHash: MOCK_TX_HASH, networkId: 1 }),
    )
    await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS * 3)

    expect(mockResetPaymentState).not.toHaveBeenCalled()
    expect(mockSetFinalized).not.toHaveBeenCalled()
    expect(mockToastError).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('reverted: calls resetPaymentState and does NOT mark validated or finalized', async () => {
    mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
      status: 'reverted',
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
      transactionHash: MOCK_TX_HASH,
    })

    renderHook(() =>
      useFinalizationTracker({
        contentHash: 'inv-reverted-hash',
        txHash: MOCK_TX_HASH,
        networkId: 1,
      })
    )

    await waitFor(() => {
      expect(mockResetPaymentState).toHaveBeenCalledWith('inv-reverted-hash')
    })

    expect(mockSetValidated).not.toHaveBeenCalled()
    expect(mockSetFinalized).not.toHaveBeenCalled()
    expect(mockToastError).toHaveBeenCalledWith('Transaction reverted on-chain')
  })
  describe('finality gating (Constitution VII)', () => {
    const renderTracker = (hash = 'inv-final-hash') =>
      renderHook(() =>
        useFinalizationTracker({ contentHash: hash, txHash: MOCK_TX_HASH, networkId: 1 }),
      )

    it('does not finalize until finalized.number >= receipt.blockNumber', async () => {
      mockFinalizedNumber = 98n
      renderTracker()

      await vi.advanceTimersByTimeAsync(0)
      expect(mockSetValidated).toHaveBeenCalled()
      expect(mockSetFinalized).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS * 3)
      expect(mockSetFinalized).not.toHaveBeenCalled()
      expect(mockPublicClient.getTransactionReceipt).not.toHaveBeenCalled()

      mockFinalizedNumber = 100n
      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS)
      expect(mockPublicClient.getTransactionReceipt).toHaveBeenCalledWith({ hash: MOCK_TX_HASH })
      expect(mockSetFinalized).toHaveBeenCalledWith('inv-final-hash')
    })

    it('polls no faster than the configured interval', async () => {
      mockFinalizedNumber = 1n
      renderTracker()
      await vi.advanceTimersByTimeAsync(0)
      const finalizedCalls = () =>
        mockPublicClient.getBlock.mock.calls.filter(
          (call) => (call[0] as { blockTag?: string }).blockTag === 'finalized',
        ).length
      expect(finalizedCalls()).toBe(1)
      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS - 1)
      expect(finalizedCalls()).toBe(1)
      await vi.advanceTimersByTimeAsync(1)
      expect(finalizedCalls()).toBe(2)
    })

    const notFound = (): Error =>
      Object.assign(new Error('Transaction receipt not found'), {
        name: 'TransactionReceiptNotFoundError',
      })
    const OTHER_HASH = '0xbbbb000000000000000000000000000000000000000000000000000000000002'

    it('receipt not-found on first post-finality fetch, found on second: finalizes, no reset', async () => {
      mockPublicClient.getTransactionReceipt
        .mockRejectedValueOnce(notFound())
        .mockResolvedValue({
          status: 'success',
          blockNumber: 100n,
          blockHash: BLOCK_HASH,
          transactionHash: MOCK_TX_HASH,
        })
      renderTracker('inv-lag-hash')
      await vi.advanceTimersByTimeAsync(0)
      expect(mockResetPaymentState).not.toHaveBeenCalled()
      expect(mockSetFinalized).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS)
      expect(mockSetFinalized).toHaveBeenCalledWith('inv-lag-hash')
      expect(mockResetPaymentState).not.toHaveBeenCalled()
      expect(mockToastError).not.toHaveBeenCalled()
    })

    it('RPC error at finality fetch keeps polling, no reset', async () => {
      mockPublicClient.getTransactionReceipt
        .mockRejectedValueOnce(new Error('HTTP request failed. Status: 503'))
        .mockResolvedValue({
          status: 'success',
          blockNumber: 100n,
          blockHash: BLOCK_HASH,
          transactionHash: MOCK_TX_HASH,
        })
      renderTracker('inv-rpc-err-hash')
      await vi.advanceTimersByTimeAsync(0)
      expect(mockResetPaymentState).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS)
      expect(mockSetFinalized).toHaveBeenCalledWith('inv-rpc-err-hash')
      expect(mockResetPaymentState).not.toHaveBeenCalled()
    })

    it('persistent RPC errors never reset', async () => {
      mockPublicClient.getTransactionReceipt.mockRejectedValue(new Error('rpc 503'))
      renderTracker('inv-rpc-down-hash')
      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS * 10)
      expect(mockResetPaymentState).not.toHaveBeenCalled()
      expect(mockSetFinalized).not.toHaveBeenCalled()
    })

    it('re-included in a different block: adopts it, waits for its finality, then finalizes', async () => {
      mockFinalizedNumber = 100n
      mockPublicClient.getTransactionReceipt.mockResolvedValue({
        status: 'success',
        blockNumber: 105n,
        blockHash: OTHER_HASH,
        transactionHash: MOCK_TX_HASH,
      })
      renderTracker('inv-reinclude-hash')
      await vi.advanceTimersByTimeAsync(0)
      expect(mockResetPaymentState).not.toHaveBeenCalled()
      expect(mockSetFinalized).not.toHaveBeenCalled()

      // finalized head still below the new block: keep polling
      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS * 2)
      expect(mockSetFinalized).not.toHaveBeenCalled()
      expect(mockResetPaymentState).not.toHaveBeenCalled()

      mockFinalizedNumber = 105n
      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS)
      expect(mockSetFinalized).toHaveBeenCalledWith('inv-reinclude-hash')
      expect(mockResetPaymentState).not.toHaveBeenCalled()
    })

    it('receipt absent for N polls over the minimum span with finalized head past the block: resets', async () => {
      mockPublicClient.getTransactionReceipt.mockRejectedValue(notFound())
      renderTracker('inv-vanished-hash')
      await vi.advanceTimersByTimeAsync(0)
      // polls at t=0, 30s, 60s: N reached but span (60s) < minimum
      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS * (REORG_ABSENT_MIN_POLLS - 1))
      expect(mockResetPaymentState).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(REORG_ABSENT_MIN_SPAN_MS - FINALITY_POLL_INTERVAL_MS * (REORG_ABSENT_MIN_POLLS - 1))
      expect(mockResetPaymentState).toHaveBeenCalledWith('inv-vanished-hash')
      expect(mockSetFinalized).not.toHaveBeenCalled()
    })

    it('a not-found streak broken by a RPC error does not reset', async () => {
      mockPublicClient.getTransactionReceipt
        .mockRejectedValueOnce(notFound())
        .mockRejectedValueOnce(notFound())
        .mockRejectedValueOnce(new Error('rpc 503'))
        .mockRejectedValue(notFound())
      renderTracker('inv-broken-streak-hash')
      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS * 4)
      expect(mockResetPaymentState).not.toHaveBeenCalled()
    })

    it('absence before the finalized head reaches the block is never counted', async () => {
      mockFinalizedNumber = 90n
      mockPublicClient.getTransactionReceipt.mockRejectedValue(notFound())
      renderTracker('inv-prefinal-hash')
      await vi.advanceTimersByTimeAsync(REORG_ABSENT_MIN_SPAN_MS * 3)
      expect(mockResetPaymentState).not.toHaveBeenCalled()
      expect(mockPublicClient.getTransactionReceipt).not.toHaveBeenCalled()
    })

    it('reverted receipt at finality does not finalize', async () => {
      mockPublicClient.getTransactionReceipt.mockResolvedValue({
        status: 'reverted',
        blockNumber: 100n,
        blockHash: BLOCK_HASH,
        transactionHash: MOCK_TX_HASH,
      })
      renderTracker('inv-rev-final-hash')
      await vi.advanceTimersByTimeAsync(0)

      expect(mockSetFinalized).not.toHaveBeenCalled()
      expect(mockResetPaymentState).toHaveBeenCalledWith('inv-rev-final-hash')
    })

    it('unmount clears the pending poll timer', async () => {
      mockFinalizedNumber = 1n
      const { unmount } = renderTracker('inv-timer-hash')
      await vi.advanceTimersByTimeAsync(0)
      // 30s sleep timer + 60min overall timeout
      expect(vi.getTimerCount()).toBe(2)
      unmount()
      expect(vi.getTimerCount()).toBe(0)
    })

    it('transient finalized-tag RPC error keeps polling', async () => {
      let calls = 0
      mockPublicClient.getBlock.mockImplementation(async (args: { blockTag?: string }) => {
        if (args.blockTag !== 'finalized') return { timestamp: MOCK_BLOCK_TIMESTAMP_S }
        calls++
        if (calls === 1) throw new Error('rpc 503')
        return { number: 100n }
      })
      renderTracker('inv-transient-hash')
      await vi.advanceTimersByTimeAsync(0)
      expect(mockSetFinalized).not.toHaveBeenCalled()
      expect(mockResetPaymentState).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS)
      expect(mockSetFinalized).toHaveBeenCalledWith('inv-transient-hash')
    })

    it('unmount stops polling', async () => {
      mockFinalizedNumber = 1n
      const { unmount } = renderTracker('inv-unmount-hash')
      await vi.advanceTimersByTimeAsync(0)
      const before = mockPublicClient.getBlock.mock.calls.length

      unmount()
      mockFinalizedNumber = 100n
      await vi.advanceTimersByTimeAsync(FINALITY_POLL_INTERVAL_MS * 5)

      expect(mockPublicClient.getBlock.mock.calls.length).toBe(before)
      expect(mockSetFinalized).not.toHaveBeenCalled()
    })
  })
})
