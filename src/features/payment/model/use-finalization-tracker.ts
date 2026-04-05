import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { toast } from '@/shared/lib/toast'
import { getFinalizationTimeout } from '@/entities/network'

export interface UseFinalizationTrackerParams {
  invoiceKey: string
  txHash: `0x${string}`
  networkId: number
  onReorgDetected?: (() => void) | undefined
  enabled?: boolean
}

type TrackingState = 'idle' | 'tracking' | 'finalized' | 'reorg' | 'timeout'

export function useFinalizationTracker({
  invoiceKey,
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
      (inv) => inv.key === invoiceKey,
    )
    if (tracked?.finalized) return
    if (!publicClient || !txHash || !invoiceKey) return

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
        setValidated(invoiceKey, true)
        setFinalized(invoiceKey)
        setTrackingState('finalized')
      })
      .catch((_err) => {
        if (cancelled) return
        clearTimeout(timeoutId)
        // Reorg: transaction disappeared from chain
        toast.error('Chain reorg detected — transaction not found on chain')
        resetPaymentState(invoiceKey)
        onReorgDetected?.()
        setTrackingState('reorg')
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [enabled, invoiceKey, txHash, networkId, publicClient, setFinalized, setValidated, resetPaymentState, onReorgDetected])
}
