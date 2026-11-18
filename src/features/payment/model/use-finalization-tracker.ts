import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { toast } from '@/shared/lib/toast'
import { useIsMobile } from '@/shared/lib'
import { getFinalizationTimeout, getSoftConfirmations } from '@/entities/network'

export interface UseFinalizationTrackerParams {
  contentHash: string
  txHash: `0x${string}`
  networkId: number
  onReorgDetected?: (() => void) | undefined
  enabled?: boolean
}

type TrackingState = 'idle' | 'tracking' | 'finalized' | 'reorg' | 'timeout'

/** Poll cadence for the `finalized` block tag; RPC goes through the rate-limited /api/rpc proxy. */
export const FINALITY_POLL_INTERVAL_MS = 30_000

type TrackerClient = NonNullable<ReturnType<typeof usePublicClient>>
type Receipt = Awaited<ReturnType<TrackerClient['getTransactionReceipt']>>

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Resolves true once the `finalized` head >= receipt block AND the receipt is re-confirmed
 * (same blockHash, success). Resolves false if the receipt vanished/changed (reorg).
 * Transient RPC errors keep polling; cancellation resolves (caller re-checks its flag).
 */
async function waitForFinality(
  client: TrackerClient,
  receipt: Receipt,
  isCancelled: () => boolean,
): Promise<boolean> {
  for (;;) {
    if (isCancelled()) return false
    try {
      const finalized = await client.getBlock({ blockTag: 'finalized' })
      if (isCancelled()) return false
      if (finalized.number >= receipt.blockNumber) {
        try {
          const fresh = await client.getTransactionReceipt({ hash: receipt.transactionHash })
          return fresh.blockHash === receipt.blockHash && fresh.status === 'success'
        } catch {
          return false
        }
      }
    } catch {
      // transient RPC failure or tag unsupported: retry until the outer timeout
    }
    await sleep(FINALITY_POLL_INTERVAL_MS)
  }
}

export function useFinalizationTracker({
  contentHash,
  txHash,
  networkId,
  onReorgDetected,
  enabled = true,
}: UseFinalizationTrackerParams): void {
  const publicClient = usePublicClient({ chainId: networkId })
  const setFinalized = useTrackedInvoiceStore((s) => s.setFinalized)
  const setValidated = useTrackedInvoiceStore((s) => s.setValidated)
  const resetPaymentState = useTrackedInvoiceStore((s) => s.resetPaymentState)
  const isMobile = useIsMobile()
  // Internal state triggers re-render so waitFor can detect mock calls via MutationObserver
  const [, setTrackingState] = useState<TrackingState>('idle')

  useEffect(() => {
    if (!enabled) return
    const tracked = useTrackedInvoiceStore.getState().invoices.find(
      (inv) => inv.contentHash === contentHash,
    )
    if (tracked?.finalized) return
    if (!publicClient || !txHash || !contentHash) return

    const timeoutMs = getFinalizationTimeout(networkId)
    let cancelled = false

    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: fires once at effect entry to mark tracking start, guard above ensures single call
    setTrackingState('tracking')

    const timeoutId = setTimeout(() => {
      // W3-012: timeout — stay as paid, do NOT revert, no toast
      if (!cancelled) {
        cancelled = true
        setTrackingState('timeout')
      }
    }, timeoutMs)

    publicClient
      .waitForTransactionReceipt({ hash: txHash, confirmations: getSoftConfirmations(networkId) })
      .then(async (receipt) => {
        if (cancelled) return
        if (receipt.status === 'reverted') {
          clearTimeout(timeoutId)
          if (!isMobile) toast.error('Transaction reverted on-chain')
          resetPaymentState(contentHash)
          onReorgDetected?.()
          setTrackingState('reorg')
          return
        }
        // Best-effort fetch of the block's wall-clock timestamp so paidAt
        // records the on-chain time, not the verifier's wall clock. Store
        // falls back to Date.now() if this throws or returns undefined.
        let paidAtMs: number | undefined
        try {
          const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber })
          paidAtMs = Number(block.timestamp) * 1000
        } catch (err) {
          console.warn('[useFinalizationTracker] getBlock for paidAt failed:', err)
        }
        if (cancelled) return
        setValidated(contentHash, true, paidAtMs)

        // Constitution VII: only the `finalized` block tag is final. Poll until the finalized
        // head reaches the receipt's block, then re-verify the receipt (reorg guard).
        const isFinal = await waitForFinality(publicClient, receipt, () => cancelled)
        if (cancelled) return
        clearTimeout(timeoutId)
        if (!isFinal) {
          if (!isMobile) toast.error('Chain reorg detected — transaction not found on chain')
          resetPaymentState(contentHash)
          onReorgDetected?.()
          setTrackingState('reorg')
          return
        }
        setFinalized(contentHash)
        setTrackingState('finalized')
      })
      .catch((_err) => {
        if (cancelled) return
        clearTimeout(timeoutId)
        // Reorg: transaction disappeared from chain (desktop-only toast; mobile uses inline status)
        if (!isMobile) toast.error('Chain reorg detected — transaction not found on chain')
        resetPaymentState(contentHash)
        onReorgDetected?.()
        setTrackingState('reorg')
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [enabled, contentHash, txHash, networkId, publicClient, setFinalized, setValidated, resetPaymentState, onReorgDetected, isMobile])
}
