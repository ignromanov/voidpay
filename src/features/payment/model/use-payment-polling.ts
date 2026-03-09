import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import {
  reducer,
  INITIAL_STATE,
  createDoFetch,
  assignAggressiveLoop,
  assignWatchingLoop,
  setupVisibilityHandler,
  MANUAL_COOLDOWN_MS,
  MAX_CONCURRENT_SESSIONS,
  nextSessionId,
  activeSessionCount,
  incrementActiveSessionCount,
  decrementActiveSessionCount,
  __resetPollingCounters,
} from './polling'
import type { PollingMode, PollingState } from './polling'

// ---------------------------------------------------------------------------
// Re-exports (public API must not change)
// ---------------------------------------------------------------------------

export { __resetPollingCounters }
export type { PollingMode, PollingState }

export interface UsePaymentPollingParams {
  invoiceId: string
  toAddress: string
  chainId: number
  contractAddress?: string
  category: 'external' | 'erc20'
  exactTotal: bigint
  fromBlock: string
}

export interface UsePaymentPollingResult {
  mode: PollingMode
  isLoading: boolean
  error?: string
  cooldownUntil?: number
  startAutoCheck: () => void
  startManualCheck: () => void
  startAggressivePolling: () => void
  startWatching: () => void
  stop: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePaymentPolling(params: UsePaymentPollingParams): UsePaymentPollingResult {
  const { invoiceId, toAddress, chainId, contractAddress, category, exactTotal, fromBlock } = params

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const setTxHash = useTrackedInvoiceStore((s) => s.setTxHash)

  // ---- Refs ----
  const isActiveRef = useRef(false)
  const sessionStartedAtRef = useRef(0)
  const sessionModeRef = useRef<PollingMode>('idle')
  const holdsSlotRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const watchStepRef = useRef(0)
  const consec429Ref = useRef(0)
  const visHandlerRef = useRef<(() => void) | null>(null)
  const aggressiveLoopRef = useRef<() => void>(() => {})
  const watchingLoopRef = useRef<() => void>(() => {})

  // ---- flushStop ----
  const flushStop = useCallback((isError = false, errorMsg?: string) => {
    isActiveRef.current = false
    sessionModeRef.current = 'idle'

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (holdsSlotRef.current) {
      decrementActiveSessionCount()
      holdsSlotRef.current = false
    }

    if (isError && errorMsg) {
      flushSync(() => dispatch({ type: 'SET_ERROR', payload: errorMsg }))
    } else {
      flushSync(() => dispatch({ type: 'STOP' }))
    }
  }, [])

  // ---- doFetch (memoised factory) ----
  const doFetch = useMemo(
    () => createDoFetch(
      { toAddress, chainId, category, fromBlock, ...(contractAddress ? { contractAddress } : {}), exactTotal },
      { abortRef, consec429Ref },
      dispatch,
      flushStop,
    ),
    [toAddress, chainId, category, fromBlock, contractAddress, exactTotal, flushStop],
  )

  // ---- Loop assignments (updated every render via .current) ----
  const loopRefs = { isActiveRef, sessionModeRef, sessionStartedAtRef, timerRef }
  assignAggressiveLoop(aggressiveLoopRef, loopRefs, doFetch, setTxHash, invoiceId, flushStop)
  assignWatchingLoop(watchingLoopRef, watchStepRef, loopRefs, doFetch, setTxHash, invoiceId, flushStop)

  // ---- Visibility handler ----
  const handleVisibilitySetup = useCallback(() => {
    setupVisibilityHandler(invoiceId, {
      isActiveRef, sessionModeRef, sessionStartedAtRef, timerRef, visHandlerRef,
    }, {
      doFetch, setTxHash, flushStop, aggressiveLoopRef, watchingLoopRef,
    })
  }, [doFetch, invoiceId, setTxHash, flushStop])

  // ---- Public actions ----
  const startAutoCheck = useCallback(() => {
    isActiveRef.current = true
    sessionStartedAtRef.current = Date.now()
    sessionModeRef.current = 'auto-check'
    dispatch({ type: 'START', mode: 'auto-check', sessionId: nextSessionId() })
  }, [])

  const startManualCheck = useCallback(() => {
    if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null }
    isActiveRef.current = true
    sessionStartedAtRef.current = Date.now()
    sessionModeRef.current = 'manual'
    dispatch({ type: 'START', mode: 'manual', sessionId: nextSessionId() })
  }, [])

  const startAggressivePolling = useCallback(() => {
    if (activeSessionCount >= MAX_CONCURRENT_SESSIONS) {
      dispatch({ type: 'SET_ERROR', payload: 'Max concurrent polling sessions reached' })
      return
    }
    if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null }
    consec429Ref.current = 0
    isActiveRef.current = true
    sessionStartedAtRef.current = Date.now()
    sessionModeRef.current = 'aggressive'
    if (!holdsSlotRef.current) { incrementActiveSessionCount(); holdsSlotRef.current = true }
    dispatch({ type: 'START', mode: 'aggressive', sessionId: nextSessionId() })
  }, [])

  const startWatching = useCallback(() => {
    if (activeSessionCount >= MAX_CONCURRENT_SESSIONS) {
      dispatch({ type: 'SET_ERROR', payload: 'Max concurrent polling sessions reached' })
      return
    }
    if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null }
    consec429Ref.current = 0
    watchStepRef.current = 0
    isActiveRef.current = true
    sessionStartedAtRef.current = Date.now()
    sessionModeRef.current = 'watching'
    if (!holdsSlotRef.current) { incrementActiveSessionCount(); holdsSlotRef.current = true }
    dispatch({ type: 'START', mode: 'watching', sessionId: nextSessionId() })
  }, [])

  const stop = useCallback(() => {
    flushStop()
  }, [flushStop])

  // ---- Effect: react to session start ----
  useEffect(() => {
    if (state.mode === 'auto-check') {
      void (async () => {
        const matched = await doFetch()
        if (!isActiveRef.current || sessionModeRef.current !== 'auto-check') return
        if (matched) setTxHash(invoiceId, matched.hash, false)
        isActiveRef.current = false
        sessionModeRef.current = 'idle'
        flushSync(() => dispatch({ type: 'STOP' }))
      })()
      return
    }

    if (state.mode === 'manual') {
      void (async () => {
        const matched = await doFetch()
        if (!isActiveRef.current || sessionModeRef.current !== 'manual') return

        if (matched) {
          setTxHash(invoiceId, matched.hash, false)
          isActiveRef.current = false
          sessionModeRef.current = 'idle'
          flushSync(() => dispatch({ type: 'STOP' }))
          return
        }

        const cooldownUntil = Date.now() + MANUAL_COOLDOWN_MS
        dispatch({ type: 'SET_COOLDOWN_UNTIL', payload: cooldownUntil })
        isActiveRef.current = false
        sessionModeRef.current = 'idle'
        flushSync(() => dispatch({ type: 'STOP' }))

        cooldownTimerRef.current = setTimeout(() => {
          flushSync(() => dispatch({ type: 'SET_COOLDOWN_UNTIL', payload: undefined }))
        }, MANUAL_COOLDOWN_MS)
      })()
      return
    }

    if (state.mode === 'aggressive') {
      handleVisibilitySetup()
      aggressiveLoopRef.current()
      return
    }

    if (state.mode === 'watching') {
      handleVisibilitySetup()
      watchingLoopRef.current()
      return
    }
  // sessionId changes on every new session start (re-fires even for same mode)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode, state.sessionId])

  // ---- Mount: auto-check once ----
  useEffect(() => {
    const check = () => {
      const tracked = useTrackedInvoiceStore.getState().invoices.find(
        (inv) => inv.invoiceId === invoiceId,
      )
      if (tracked?.txHash) return
      startAutoCheck()
    }

    if (useTrackedInvoiceStore.persist.hasHydrated()) {
      check()
      return
    }
    return useTrackedInvoiceStore.persist.onFinishHydration(check)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Unmount: cleanup ----
  // Refs must be read inside the cleanup function (not captured at mount time)
  // because they are set asynchronously during polling lifecycle.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
      if (cooldownTimerRef.current !== null) clearTimeout(cooldownTimerRef.current)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are set after mount, must read at cleanup
      if (abortRef.current) abortRef.current.abort()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are set after mount, must read at cleanup
      if (visHandlerRef.current) document.removeEventListener('visibilitychange', visHandlerRef.current)
      if (holdsSlotRef.current) { decrementActiveSessionCount(); holdsSlotRef.current = false }
      isActiveRef.current = false
    }
  }, [])

  return {
    mode: state.mode,
    isLoading: state.isLoading,
    ...(state.error !== undefined && { error: state.error }),
    ...(state.cooldownUntil !== undefined && { cooldownUntil: state.cooldownUntil }),
    startAutoCheck,
    startManualCheck,
    startAggressivePolling,
    startWatching,
    stop,
  }
}
