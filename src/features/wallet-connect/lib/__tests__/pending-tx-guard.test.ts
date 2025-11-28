/**
 * T034-test: Unit test for pending transaction network switch blocking
 *
 * Tests that network switching is blocked when there are pending transactions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Store the callback to simulate transactions
let watchCallback: ((hashes: `0x${string}`[]) => void) | null = null

// Mock wagmi
vi.mock('wagmi', () => ({
  useWatchPendingTransactions: vi.fn(({ onTransactions }) => {
    watchCallback = onTransactions
  }),
}))

describe('pending-tx-guard', () => {
  beforeEach(() => {
    vi.resetModules()
    watchCallback = null
  })

  describe('shouldBlockNetworkSwitch', () => {
    it('should export shouldBlockNetworkSwitch function', async () => {
      const { shouldBlockNetworkSwitch } = await import('../pending-tx-guard')
      expect(shouldBlockNetworkSwitch).toBeDefined()
    })

    it('should return false when no pending transactions', async () => {
      const { shouldBlockNetworkSwitch } = await import('../pending-tx-guard')
      const result = shouldBlockNetworkSwitch({ pendingTxCount: 0 })
      expect(result).toBe(false)
    })

    it('should return true when there are pending transactions', async () => {
      const { shouldBlockNetworkSwitch } = await import('../pending-tx-guard')
      const result = shouldBlockNetworkSwitch({ pendingTxCount: 1 })
      expect(result).toBe(true)
    })

    it('should return true for multiple pending transactions', async () => {
      const { shouldBlockNetworkSwitch } = await import('../pending-tx-guard')
      const result = shouldBlockNetworkSwitch({ pendingTxCount: 5 })
      expect(result).toBe(true)
    })
  })

  describe('getPendingTxWarningMessage', () => {
    it('should export getPendingTxWarningMessage function', async () => {
      const { getPendingTxWarningMessage } = await import('../pending-tx-guard')
      expect(getPendingTxWarningMessage).toBeDefined()
    })

    it('should return appropriate message for single pending tx', async () => {
      const { getPendingTxWarningMessage } = await import('../pending-tx-guard')
      const message = getPendingTxWarningMessage(1)
      expect(message).toContain('1')
      expect(message.toLowerCase()).toContain('pending')
    })

    it('should return appropriate message for multiple pending txs', async () => {
      const { getPendingTxWarningMessage } = await import('../pending-tx-guard')
      const message = getPendingTxWarningMessage(3)
      expect(message).toContain('3')
    })
  })

  describe('usePendingTxGuard', () => {
    it('should export usePendingTxGuard hook', async () => {
      const { usePendingTxGuard } = await import('../pending-tx-guard')
      expect(usePendingTxGuard).toBeDefined()
    })

    it('should start with zero pending transactions', async () => {
      const { usePendingTxGuard } = await import('../pending-tx-guard')
      const { result } = renderHook(() => usePendingTxGuard())

      expect(result.current.pendingTxCount).toBe(0)
      expect(result.current.shouldBlock).toBe(false)
      expect(result.current.warningMessage).toBeNull()
    })

    it('should update when pending transactions are added', async () => {
      const { usePendingTxGuard } = await import('../pending-tx-guard')
      const { result } = renderHook(() => usePendingTxGuard())

      // Simulate incoming pending transaction
      act(() => {
        if (watchCallback) {
          watchCallback(['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'])
        }
      })

      expect(result.current.pendingTxCount).toBe(1)
      expect(result.current.shouldBlock).toBe(true)
      expect(result.current.warningMessage).not.toBeNull()
    })

    it('should track multiple pending transactions', async () => {
      const { usePendingTxGuard } = await import('../pending-tx-guard')
      const { result } = renderHook(() => usePendingTxGuard())

      // Simulate multiple pending transactions
      act(() => {
        if (watchCallback) {
          watchCallback([
            '0x1111111111111111111111111111111111111111111111111111111111111111',
            '0x2222222222222222222222222222222222222222222222222222222222222222',
          ])
        }
      })

      expect(result.current.pendingTxCount).toBe(2)
      expect(result.current.shouldBlock).toBe(true)
      expect(result.current.warningMessage).toContain('2')
    })

    it('should not add duplicate transaction hashes', async () => {
      const { usePendingTxGuard } = await import('../pending-tx-guard')
      const { result } = renderHook(() => usePendingTxGuard())

      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as const

      act(() => {
        if (watchCallback) {
          watchCallback([txHash])
        }
      })

      expect(result.current.pendingTxCount).toBe(1)

      // Add same hash again
      act(() => {
        if (watchCallback) {
          watchCallback([txHash])
        }
      })

      // Should still be 1 due to Set deduplication
      expect(result.current.pendingTxCount).toBe(1)
    })
  })
})
