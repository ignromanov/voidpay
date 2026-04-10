import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// Mock viem's waitForTransactionReceipt
const mockWaitForTransactionReceipt = vi.fn()

vi.mock('viem', () => ({
  waitForTransactionReceipt: (...args: unknown[]) => mockWaitForTransactionReceipt(...args),
}))

// Mock wagmi usePublicClient
const mockPublicClient = {
  waitForTransactionReceipt: vi.fn(),
  getTransactionReceipt: vi.fn(),
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

import { useFinalizationTracker } from '../use-finalization-tracker'

const MOCK_TX_HASH = '0xdeadbeef00000000000000000000000000000000000000000000000000000001' as `0x${string}`

describe('useFinalizationTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      transactionHash: MOCK_TX_HASH,
    })
    mockPublicClient.getTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
      transactionHash: MOCK_TX_HASH,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Test case 1: Successful finalization → setFinalized called silently (no toast)
  it('calls setFinalized silently when finalization succeeds', async () => {
    mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      blockNumber: 100n,
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

  // Test case 3: Reorg detection (tx disappears) → toast + resetPaymentState (FR-011)
  it('reorg: shows toast and calls resetPaymentState when transaction disappears', async () => {
    // Simulate reorg: waitForTransactionReceipt rejects because tx is no longer on chain
    mockPublicClient.waitForTransactionReceipt.mockRejectedValue(
      new Error('Transaction not found — possible chain reorganization')
    )

    renderHook(() =>
      useFinalizationTracker({
        contentHash: 'inv-reorg-001-hash',
        txHash: MOCK_TX_HASH,
        networkId: 1,
      })
    )

    await waitFor(() => {
      expect(mockResetPaymentState).toHaveBeenCalledWith('inv-reorg-001-hash')
    })

    // Must alert user about reorg via toast
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining('reorg'),
    )
    expect(mockSetFinalized).not.toHaveBeenCalled()
  })
})
