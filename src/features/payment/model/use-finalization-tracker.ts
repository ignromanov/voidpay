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

/** Receipt must be absent on at least this many consecutive polls before it counts as a reorg. */
export const REORG_ABSENT_MIN_POLLS = 3
/** ...and the absence must span at least this long, so a lagging node cannot trigger a reset. */
export const REORG_ABSENT_MIN_SPAN_MS = 90_000

type FinalityOutcome = 'finalized' | 'reverted' | 'reorg' | 'cancelled'

function isReceiptNotFound(err: unknown): boolean {
  return err instanceof Error && err.name === 'TransactionReceiptNotFoundError'
}

/**
 * Polls until the `finalized` head covers the tx block and the receipt is re-confirmed.
 * Only a `reverted` receipt, or a receipt that stays absent (not-found, never a generic RPC
 * error) for REORG_ABSENT_MIN_POLLS polls over REORG_ABSENT_MIN_SPAN_MS after the finalized
 * head passed the original block, is negative. Re-inclusion in another block is adopted.
 * Every other failure keeps polling; the caller's overall timeout bounds the loop.
 */
async function waitForFinality(
  client: TrackerClient,
  receipt: Receipt,
  isCancelled: () => boolean,
  sleep: (ms: number) => Promise<void>,
): Promise<FinalityOutcome> {
  let current = receipt
  let absentPolls = 0
  let absentSince = 0
  for (;;) {
    if (isCancelled()) return 'cancelled'
    try {
      const finalized = await client.getBlock({ blockTag: 'finalized' })
      if (isCancelled()) return 'cancelled'
      if (finalized.number >= current.blockNumber) {
        try {
          const fresh = await client.getTransactionReceipt({ hash: receipt.transactionHash })
          if (isCancelled()) return 'cancelled'
          absentPolls = 0
          if (fresh.status === 'reverted') return 'reverted'
          if (fresh.blockHash === current.blockHash) return 'finalized'
          // Re-included in another block: same tx, adopt it and wait for finality of the new block.
          current = fresh
        } catch (err) {
          if (isReceiptNotFound(err)) {
            if (absentPolls === 0) absentSince = Date.now()
            absentPolls++
            if (
              absentPolls >= REORG_ABSENT_MIN_POLLS &&
              Date.now() - absentSince >= REORG_ABSENT_MIN_SPAN_MS
            ) {
              return 'reorg'
            }
          } else {
            absentPolls = 0
          }
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
    let sleepTimer: ReturnType<typeof setTimeout> | undefined
    let wake: (() => void) | undefined
    const sleep = (ms: number): Promise<void> =>
      new Promise((resolve) => {
        wake = resolve
        sleepTimer = setTimeout(resolve, ms)
      })
    const stopSleeping = (): void => {
      clearTimeout(sleepTimer)
      wake?.()
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: fires once at effect entry to mark tracking start, guard above ensures single call
    setTrackingState('tracking')

    const timeoutId = setTimeout(() => {
      // W3-012: timeout — stay as paid, do NOT revert, no toast
      if (!cancelled) {
        cancelled = true
        stopSleeping()
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
        const outcome = await waitForFinality(publicClient, receipt, () => cancelled, sleep)
        if (cancelled || outcome === 'cancelled') return
        clearTimeout(timeoutId)
        if (outcome !== 'finalized') {
          if (!isMobile) {
            toast.error(
              outcome === 'reverted'
                ? 'Transaction reverted on-chain'
                : 'Chain reorg detected — transaction not found on chain',
            )
          }
          resetPaymentState(contentHash)
          onReorgDetected?.()
          setTrackingState('reorg')
          return
        }
        setFinalized(contentHash)
        setTrackingState('finalized')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        clearTimeout(timeoutId)
        // Timeout / 503 / rate-limiter fail-closed are not evidence of a reorg: keep "paid, not
        // finalized". The tracker re-mounts on reload; only a reverted receipt resets state.
        console.warn('[useFinalizationTracker] receipt wait failed, keeping paid state:', err)
        setTrackingState('timeout')
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      stopSleeping()
    }
  }, [enabled, contentHash, txHash, networkId, publicClient, setFinalized, setValidated, resetPaymentState, onReorgDetected, isMobile])
}
