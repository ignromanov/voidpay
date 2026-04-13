'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { WAGMI_STORAGE_KEY } from '@/shared/config'

function hasPersistedWalletConnection(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(`${WAGMI_STORAGE_KEY}.recentConnectorId`) !== null
  } catch {
    return false
  }
}

/**
 * True while wagmi is hydrating from localStorage or actively (re)connecting.
 *
 * Covers three states that should block interaction with connect/pay UI:
 *
 * 1. Pre-hydration gap — wagmi with `ssr: true` shows `status: 'disconnected'`
 *    on the first client render even when a persisted connection exists in
 *    localStorage. Without this, the pay button flashes "Connect Wallet",
 *    users click, `handlePay` fires with a stale `isConnected=false`, and a
 *    race with the background reconnect can strand the flow in 'connecting'.
 * 2. Reconnecting — wagmi is actively re-establishing a persisted connection.
 * 3. Connecting — wagmi is actively connecting a new wallet.
 *
 * The pre-hydration heuristic is dropped permanently once wagmi transitions
 * out of the initial `disconnected` snapshot, so later manual
 * disconnect → reconnect cycles render as usual.
 */
export function useWagmiHydrating(): boolean {
  const { status } = useAccount()
  const [hadPersistedAtMount] = useState(() => hasPersistedWalletConnection())
  const [sawNonDisconnected, setSawNonDisconnected] = useState(false)

  useEffect(() => {
    if (status !== 'disconnected') setSawNonDisconnected(true)
  }, [status])

  if (status === 'connecting' || status === 'reconnecting') return true
  if (hadPersistedAtMount && !sawNonDisconnected) return true
  return false
}
