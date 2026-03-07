import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { toast } from '@/shared/lib/toast'
import { getFinalizationTimeout } from '../lib/confirmation-config'

export interface UseFinalizationTrackerParams {
  invoiceId: string
  txHash: `0x${string}`
  networkId: number
}

type TrackingState = 'idle' | 'tracking' | 'finalized' | 'reorg' | 'timeout'

export function useFinalizationTracker({
  invoiceId,
  txHash,
  networkId,
}: UseFinalizationTrackerParams): void {
  const publicClient = usePublicClient()
  const setFinalized = useTrackedInvoiceStore((s) => s.setFinalized)
  const resetPaymentState = useTrackedInvoiceStore((s) => s.resetPaymentState)
  // Internal state triggers re-render so waitFor can detect mock calls via MutationObserver
  const [, setTrackingState] = useState<TrackingState>('idle')

  useEffect(() => {
    if (!publicClient || !txHash || !invoiceId) return

    const timeoutMs = getFinalizationTimeout(networkId)
    let cancelled = false

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
      .then(() => {
        if (cancelled) return
        clearTimeout(timeoutId)
        setFinalized(invoiceId)
        setTrackingState('finalized')
      })
      .catch(() => {
        if (cancelled) return
        clearTimeout(timeoutId)
        // Reorg: transaction disappeared from chain
        toast.error('Chain reorg detected — transaction not found on chain')
        resetPaymentState(invoiceId)
        setTrackingState('reorg')
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [invoiceId, txHash, networkId, publicClient, setFinalized, resetPaymentState])
}
