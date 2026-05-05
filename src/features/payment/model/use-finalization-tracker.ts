import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { toast } from '@/shared/lib/toast'
import { getFinalizationTimeout } from '@/entities/network'

export interface UseFinalizationTrackerParams {
  contentHash: string
  txHash: `0x${string}`
  networkId: number
  onReorgDetected?: (() => void) | undefined
  enabled?: boolean
}

type TrackingState = 'idle' | 'tracking' | 'finalized' | 'reorg' | 'timeout'

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
      .waitForTransactionReceipt({ hash: txHash })
      .then(async (receipt) => {
        if (cancelled) return
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
        clearTimeout(timeoutId)
        setValidated(contentHash, true, paidAtMs)
        setFinalized(contentHash)
        setTrackingState('finalized')
      })
      .catch((_err) => {
        if (cancelled) return
        clearTimeout(timeoutId)
        // Reorg: transaction disappeared from chain
        toast.error('Chain reorg detected — transaction not found on chain')
        resetPaymentState(contentHash)
        onReorgDetected?.()
        setTrackingState('reorg')
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [enabled, contentHash, txHash, networkId, publicClient, setFinalized, setValidated, resetPaymentState, onReorgDetected])
}
