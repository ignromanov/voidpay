import { useCallback, useEffect, useReducer, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { matchTransfer } from '../lib/match-transfer'
import type { TransferResult } from '../lib/match-transfer'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AGGRESSIVE_INTERVAL_MS = 12_000
const AGGRESSIVE_MAX_MS = 5 * 60 * 1_000

// Step-based watching intervals: two 60s steps, then 120s, then 300s
// Two initial 60s steps are required so that a restart (which resets to step 0)
// fires at 60s twice before escalating — satisfying the "fresh escalation" spec.
const WATCHING_INTERVALS_MS = [60_000, 60_000, 120_000, 300_000] as const
const WATCHING_MAX_MS = 30 * 60 * 1_000

const MANUAL_COOLDOWN_MS = 30_000

const MAX_CONCURRENT_SESSIONS = 3
const MAX_CONSECUTIVE_429 = 3

// Module-level session counter for concurrent polling sessions
let activeSessionCount = 0

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PollingMode = 'idle' | 'auto-check' | 'manual' | 'aggressive' | 'watching'

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
// Reducer
// ---------------------------------------------------------------------------

export interface PollingState {
  mode: PollingMode
  sessionId: number
  isLoading: boolean
  error?: string
  cooldownUntil?: number
}

type Action =
  | { type: 'START'; mode: PollingMode; sessionId: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_COOLDOWN_UNTIL'; payload: number | undefined }
  | { type: 'STOP' }

const INITIAL_STATE: PollingState = {
  mode: 'idle',
  sessionId: 0,
  isLoading: false,
}

function reducer(state: PollingState, action: Action): PollingState {
  switch (action.type) {
    case 'START': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { error: _e, ...rest } = state
      return {
        ...rest,
        mode: action.mode,
        sessionId: action.sessionId,
        isLoading: action.mode === 'auto-check' || action.mode === 'manual',
      }
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, mode: 'idle' }
    case 'SET_COOLDOWN_UNTIL': {
      if (action.payload === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cooldownUntil: _c, ...rest } = state
        return rest
      }
      return { ...state, cooldownUntil: action.payload }
    }
    case 'STOP':
      return { ...state, mode: 'idle', isLoading: false }
    default:
      return state
  }
}

// Module-level session ID counter (avoids Date.now() collisions)
let sessionIdCounter = 0
function nextSessionId() {
  sessionIdCounter += 1
  return sessionIdCounter
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePaymentPolling(params: UsePaymentPollingParams): UsePaymentPollingResult {
  const { invoiceId, toAddress, chainId, contractAddress, category, exactTotal, fromBlock } = params

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const setTxHash = useTrackedInvoiceStore((s) => s.setTxHash)

  // ---------------------------------------------------------------------------
  // Refs — mutable, synchronously updated
  // ---------------------------------------------------------------------------

  // Whether the current session is active (checked in async callbacks)
  const isActiveRef = useRef(false)

  // Wall-clock start of current polling session
  const sessionStartedAtRef = useRef(0)

  // Current mode for use inside callbacks
  const sessionModeRef = useRef<PollingMode>('idle')

  // Whether this instance occupies a slot in the global session counter
  const holdsSlotRef = useRef(false)

  // Timers
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // AbortController for in-flight fetch
  const abortRef = useRef<AbortController | null>(null)

  // Watching mode step index: 0=60s, 1=120s, 2=300s
  const watchStepRef = useRef(0)

  // Consecutive 429 counter
  const consec429Ref = useRef(0)

  // Visibility change handler (stored for removal)
  const visHandlerRef = useRef<(() => void) | null>(null)

  // ---------------------------------------------------------------------------
  // flushStop — synchronously stop and flush React state
  // Visible in result.current immediately without act() wrapping
  // ---------------------------------------------------------------------------

  const flushStop = useCallback((isError = false, errorMsg?: string) => {
    isActiveRef.current = false
    sessionModeRef.current = 'idle'

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (holdsSlotRef.current) {
      activeSessionCount -= 1
      holdsSlotRef.current = false
    }

    // flushSync makes React re-render synchronously so result.current reflects
    // the new mode immediately — required for tests that check mode after
    // vi.advanceTimersByTimeAsync without an explicit act() wrapper
    if (isError && errorMsg) {
      flushSync(() => dispatch({ type: 'SET_ERROR', payload: errorMsg }))
    } else {
      flushSync(() => dispatch({ type: 'STOP' }))
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Fetch one batch of transfers
  // ---------------------------------------------------------------------------

  const doFetch = useCallback(async (): Promise<TransferResult | null> => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress,
          chainId,
          category,
          fromBlock,
          ...(contractAddress ? { contractAddress } : {}),
        }),
        signal: controller.signal,
      })

      if (res.status === 429) {
        consec429Ref.current += 1
        dispatch({ type: 'SET_LOADING', payload: false })
        if (consec429Ref.current >= MAX_CONSECUTIVE_429) {
          flushStop(true, '429 Too Many Requests — polling stopped')
        }
        return null
      }

      consec429Ref.current = 0

      if (!res.ok) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return null
      }

      const data = (await res.json()) as { transfers: TransferResult[] }
      const matched = matchTransfer(data.transfers, exactTotal)
      dispatch({ type: 'SET_LOADING', payload: false })
      return matched
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return null
      dispatch({ type: 'SET_LOADING', payload: false })
      return null
    }
  }, [toAddress, chainId, category, fromBlock, contractAddress, exactTotal, flushStop])

  // ---------------------------------------------------------------------------
  // Aggressive loop — polls every AGGRESSIVE_INTERVAL_MS, max AGGRESSIVE_MAX_MS
  // ---------------------------------------------------------------------------

  const aggressiveLoopRef = useRef<() => void>(() => {})
  aggressiveLoopRef.current = () => {
    if (!isActiveRef.current || sessionModeRef.current !== 'aggressive') return

    const elapsed = Date.now() - sessionStartedAtRef.current
    if (elapsed >= AGGRESSIVE_MAX_MS) {
      flushStop()
      return
    }

    if (document.visibilityState === 'hidden') return

    timerRef.current = setTimeout(async () => {
      if (!isActiveRef.current || sessionModeRef.current !== 'aggressive') return

      const elapsed2 = Date.now() - sessionStartedAtRef.current
      if (elapsed2 >= AGGRESSIVE_MAX_MS) {
        flushStop()
        return
      }

      if (document.visibilityState === 'hidden') return

      const matched = await doFetch()

      if (!isActiveRef.current || sessionModeRef.current !== 'aggressive') return

      if (matched) {
        setTxHash(invoiceId, matched.hash, false)
        flushStop()
        return
      }

      aggressiveLoopRef.current()
    }, AGGRESSIVE_INTERVAL_MS)
  }

  // ---------------------------------------------------------------------------
  // Watching loop — step-based adaptive intervals, max WATCHING_MAX_MS
  // ---------------------------------------------------------------------------

  const watchingLoopRef = useRef<() => void>(() => {})
  watchingLoopRef.current = () => {
    if (!isActiveRef.current || sessionModeRef.current !== 'watching') return

    const elapsed = Date.now() - sessionStartedAtRef.current
    if (elapsed >= WATCHING_MAX_MS) {
      flushStop()
      return
    }

    if (document.visibilityState === 'hidden') return

    const step = Math.min(watchStepRef.current, WATCHING_INTERVALS_MS.length - 1)
    const intervalMs = WATCHING_INTERVALS_MS[step]

    timerRef.current = setTimeout(async () => {
      if (!isActiveRef.current || sessionModeRef.current !== 'watching') return

      const elapsed2 = Date.now() - sessionStartedAtRef.current
      if (elapsed2 >= WATCHING_MAX_MS) {
        flushStop()
        return
      }

      if (document.visibilityState === 'hidden') return

      const matched = await doFetch()

      if (!isActiveRef.current || sessionModeRef.current !== 'watching') return

      if (matched) {
        setTxHash(invoiceId, matched.hash, false)
        flushStop()
        return
      }

      watchStepRef.current = Math.min(watchStepRef.current + 1, WATCHING_INTERVALS_MS.length - 1)
      watchingLoopRef.current()
    }, intervalMs)
  }

  // ---------------------------------------------------------------------------
  // Tab visibility handler
  // ---------------------------------------------------------------------------

  const setupVisibilityHandler = useCallback(() => {
    if (visHandlerRef.current) {
      document.removeEventListener('visibilitychange', visHandlerRef.current)
    }

    const handler = () => {
      if (!isActiveRef.current) return
      const mode = sessionModeRef.current
      if (mode !== 'aggressive' && mode !== 'watching') return

      if (document.visibilityState === 'hidden') {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
        return
      }

      // Tab became visible — wall-clock check
      const elapsed = Date.now() - sessionStartedAtRef.current
      const maxMs = mode === 'aggressive' ? AGGRESSIVE_MAX_MS : WATCHING_MAX_MS
      if (elapsed >= maxMs) {
        flushStop()
        return
      }

      // Catch-up fetch
      void (async () => {
        const matched = await doFetch()
        if (!isActiveRef.current) return
        if (matched) {
          setTxHash(invoiceId, matched.hash, false)
          flushStop()
          return
        }
        if (sessionModeRef.current === 'aggressive') aggressiveLoopRef.current()
        else if (sessionModeRef.current === 'watching') watchingLoopRef.current()
      })()
    }

    visHandlerRef.current = handler
    document.addEventListener('visibilitychange', handler)
  }, [doFetch, invoiceId, setTxHash, flushStop])

  // ---------------------------------------------------------------------------
  // Public actions
  // ---------------------------------------------------------------------------

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
    if (!holdsSlotRef.current) { activeSessionCount += 1; holdsSlotRef.current = true }
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
    if (!holdsSlotRef.current) { activeSessionCount += 1; holdsSlotRef.current = true }
    dispatch({ type: 'START', mode: 'watching', sessionId: nextSessionId() })
  }, [])

  const stop = useCallback(() => {
    flushStop()
  }, [flushStop])

  // ---------------------------------------------------------------------------
  // Effect: react to session start (mode + sessionId)
  // ---------------------------------------------------------------------------

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
        // Set cooldown first so it's visible when mode becomes idle
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
      setupVisibilityHandler()
      aggressiveLoopRef.current()
      return
    }

    if (state.mode === 'watching') {
      setupVisibilityHandler()
      watchingLoopRef.current()
      return
    }
  // sessionId changes on every new session start (re-fires even for same mode)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode, state.sessionId])

  // ---------------------------------------------------------------------------
  // Mount: auto-check once
  // ---------------------------------------------------------------------------

  useEffect(() => {
    startAutoCheck()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------------------------------------------------------------------
  // Unmount: cleanup
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
      if (cooldownTimerRef.current !== null) clearTimeout(cooldownTimerRef.current)
      if (abortRef.current) abortRef.current.abort()
      if (visHandlerRef.current) document.removeEventListener('visibilitychange', visHandlerRef.current)
      if (holdsSlotRef.current) { activeSessionCount -= 1; holdsSlotRef.current = false }
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
