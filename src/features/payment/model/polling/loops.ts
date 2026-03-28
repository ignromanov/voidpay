import type { MutableRefObject } from 'react'
import type { TransferResult } from '../../lib/match-transfer'
import {
  AGGRESSIVE_INTERVAL_MS,
  AGGRESSIVE_MAX_MS,
  WATCHING_INTERVALS_MS,
  WATCHING_MAX_MS,
} from './constants'
import type { PollingMode } from './reducer'

// ---------------------------------------------------------------------------
// Shared refs interface used by both loops
// ---------------------------------------------------------------------------

export interface LoopRefs {
  isActiveRef: MutableRefObject<boolean>
  sessionModeRef: MutableRefObject<PollingMode>
  sessionStartedAtRef: MutableRefObject<number>
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
}

// ---------------------------------------------------------------------------
// Aggressive loop — polls every AGGRESSIVE_INTERVAL_MS, max AGGRESSIVE_MAX_MS
// ---------------------------------------------------------------------------

export function assignAggressiveLoop(
  loopRef: MutableRefObject<() => void>,
  refs: LoopRefs,
  doFetch: () => Promise<TransferResult | null>,
  setTxHash: (invoiceId: string, hash: `0x${string}`, validated: boolean) => void,
  invoiceId: string,
  flushStop: (isError?: boolean, errorMsg?: string) => void,
): void {
  loopRef.current = () => {
    if (!refs.isActiveRef.current || refs.sessionModeRef.current !== 'aggressive') return

    const elapsed = Date.now() - refs.sessionStartedAtRef.current
    if (elapsed >= AGGRESSIVE_MAX_MS) {
      flushStop()
      return
    }

    if (document.visibilityState === 'hidden') return

    refs.timerRef.current = setTimeout(async () => {
      if (!refs.isActiveRef.current || refs.sessionModeRef.current !== 'aggressive') return

      const elapsed2 = Date.now() - refs.sessionStartedAtRef.current
      if (elapsed2 >= AGGRESSIVE_MAX_MS) {
        flushStop()
        return
      }

      if (document.visibilityState === 'hidden') return

      const matched = await doFetch()

      if (!refs.isActiveRef.current || refs.sessionModeRef.current !== 'aggressive') return

      if (matched) {
        setTxHash(invoiceId, matched.hash, false)
        flushStop()
        return
      }

      loopRef.current()
    }, AGGRESSIVE_INTERVAL_MS)
  }
}

// ---------------------------------------------------------------------------
// Watching loop — step-based adaptive intervals, max WATCHING_MAX_MS
// ---------------------------------------------------------------------------

export function assignWatchingLoop(
  loopRef: MutableRefObject<() => void>,
  watchStepRef: MutableRefObject<number>,
  refs: LoopRefs,
  doFetch: () => Promise<TransferResult | null>,
  setTxHash: (invoiceId: string, hash: `0x${string}`, validated: boolean) => void,
  invoiceId: string,
  flushStop: (isError?: boolean, errorMsg?: string) => void,
): void {
  loopRef.current = () => {
    if (!refs.isActiveRef.current || refs.sessionModeRef.current !== 'watching') return

    const elapsed = Date.now() - refs.sessionStartedAtRef.current
    if (elapsed >= WATCHING_MAX_MS) {
      flushStop()
      return
    }

    if (document.visibilityState === 'hidden') return

    const step = Math.min(watchStepRef.current, WATCHING_INTERVALS_MS.length - 1)
    const intervalMs = WATCHING_INTERVALS_MS[step]

    refs.timerRef.current = setTimeout(async () => {
      if (!refs.isActiveRef.current || refs.sessionModeRef.current !== 'watching') return

      const elapsed2 = Date.now() - refs.sessionStartedAtRef.current
      if (elapsed2 >= WATCHING_MAX_MS) {
        flushStop()
        return
      }

      if (document.visibilityState === 'hidden') return

      const matched = await doFetch()

      if (!refs.isActiveRef.current || refs.sessionModeRef.current !== 'watching') return

      if (matched) {
        setTxHash(invoiceId, matched.hash, false)
        flushStop()
        return
      }

      watchStepRef.current = Math.min(watchStepRef.current + 1, WATCHING_INTERVALS_MS.length - 1)
      loopRef.current()
    }, intervalMs)
  }
}
