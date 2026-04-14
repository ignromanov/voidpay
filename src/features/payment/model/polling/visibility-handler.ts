import type { MutableRefObject } from 'react'
import type { TransferResult } from '../../lib/match-transfer'
import { AGGRESSIVE_MAX_MS, WATCHING_MAX_MS } from './constants'
import type { PollingMode } from './reducer'

// ---------------------------------------------------------------------------
// Tab visibility handler
// ---------------------------------------------------------------------------

export interface VisibilityHandlerRefs {
  isActiveRef: MutableRefObject<boolean>
  sessionModeRef: MutableRefObject<PollingMode>
  sessionStartedAtRef: MutableRefObject<number>
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
  visHandlerRef: MutableRefObject<(() => void) | null>
}

export interface VisibilityHandlerCallbacks {
  doFetch: () => Promise<TransferResult | null>
  setTxHash: (contentHash: string, hash: `0x${string}`, validated: boolean) => void
  flushStop: (isError?: boolean, errorMsg?: string) => void
  aggressiveLoopRef: MutableRefObject<() => void>
  watchingLoopRef: MutableRefObject<() => void>
}

export function setupVisibilityHandler(
  contentHash: string,
  refs: VisibilityHandlerRefs,
  callbacks: VisibilityHandlerCallbacks,
): void {
  if (refs.visHandlerRef.current) {
    document.removeEventListener('visibilitychange', refs.visHandlerRef.current)
  }

  const handler = () => {
    if (!refs.isActiveRef.current) return
    const mode = refs.sessionModeRef.current
    if (mode !== 'aggressive' && mode !== 'watching') return

    if (document.visibilityState === 'hidden') {
      if (refs.timerRef.current !== null) {
        clearTimeout(refs.timerRef.current)
        refs.timerRef.current = null
      }
      return
    }

    // Tab became visible — wall-clock check
    const elapsed = Date.now() - refs.sessionStartedAtRef.current
    const maxMs = mode === 'aggressive' ? AGGRESSIVE_MAX_MS : WATCHING_MAX_MS
    if (elapsed >= maxMs) {
      callbacks.flushStop()
      return
    }

    // Catch-up fetch
    void (async () => {
      const matched = await callbacks.doFetch()
      if (!refs.isActiveRef.current) return
      if (matched) {
        callbacks.setTxHash(contentHash, matched.hash, false)
        callbacks.flushStop()
        return
      }
      if (refs.sessionModeRef.current === 'aggressive') callbacks.aggressiveLoopRef.current()
      else if (refs.sessionModeRef.current === 'watching') callbacks.watchingLoopRef.current()
    })()
  }

  refs.visHandlerRef.current = handler
  document.addEventListener('visibilitychange', handler)
}
