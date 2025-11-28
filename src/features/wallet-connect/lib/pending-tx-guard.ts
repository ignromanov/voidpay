/**
 * Pending Transaction Guard
 *
 * Utilities for preventing network switching when there are
 * pending transactions that could be affected.
 */

import { useMemo, useState, useEffect } from 'react'
import { useWatchPendingTransactions } from 'wagmi'

/**
 * Parameters for checking if network switch should be blocked
 */
export interface ShouldBlockNetworkSwitchParams {
  /** Number of pending transactions */
  pendingTxCount: number
}

/**
 * Check if network switching should be blocked
 *
 * Switching networks during pending transactions can cause:
 * - Transaction failures
 * - Stuck transactions on wrong chain
 * - User confusion
 *
 * @param params - Parameters including pending tx count
 * @returns True if network switch should be blocked
 */
export function shouldBlockNetworkSwitch(
  params: ShouldBlockNetworkSwitchParams
): boolean {
  return params.pendingTxCount > 0
}

/**
 * Get warning message for pending transactions
 *
 * @param pendingTxCount - Number of pending transactions
 * @returns User-friendly warning message
 */
export function getPendingTxWarningMessage(pendingTxCount: number): string {
  if (pendingTxCount === 1) {
    return 'Cannot switch networks: 1 pending transaction. Please wait for it to confirm.'
  }
  return `Cannot switch networks: ${pendingTxCount} pending transactions. Please wait for them to confirm.`
}

/**
 * Return type for usePendingTxGuard hook
 */
export interface UsePendingTxGuardReturn {
  /** Number of pending transactions */
  pendingTxCount: number
  /** Whether network switch should be blocked */
  shouldBlock: boolean
  /** Warning message if blocked */
  warningMessage: string | null
}

/**
 * Hook for guarding network switches against pending transactions
 *
 * Monitors pending transactions and provides blocking status
 * and warning messages.
 *
 * @returns Pending tx guard state
 */
export function usePendingTxGuard(): UsePendingTxGuardReturn {
  // Track pending transaction hashes
  const [pendingTxHashes, setPendingTxHashes] = useState<Set<`0x${string}`>>(
    new Set()
  )

  // Watch for new pending transactions
  useWatchPendingTransactions({
    onTransactions: (hashes) => {
      setPendingTxHashes((prev) => {
        const updated = new Set(prev)
        hashes.forEach((hash) => updated.add(hash))
        return updated
      })
    },
  })

  // Clean up old transactions periodically (after 5 minutes)
  useEffect(() => {
    const cleanup = setInterval(() => {
      // In a real app, you'd check transaction status
      // For now, we clear after 5 minutes as a fallback
      setPendingTxHashes(new Set())
    }, 5 * 60 * 1000)

    return () => clearInterval(cleanup)
  }, [])

  const pendingTxCount = pendingTxHashes.size
  const shouldBlock = shouldBlockNetworkSwitch({ pendingTxCount })

  return useMemo(
    () => ({
      pendingTxCount,
      shouldBlock,
      warningMessage: shouldBlock
        ? getPendingTxWarningMessage(pendingTxCount)
        : null,
    }),
    [pendingTxCount, shouldBlock]
  )
}
