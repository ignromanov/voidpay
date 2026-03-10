'use client'

import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import type { PaymentPanelStatus } from '../types'

interface DevStatusToggleProps {
  invoiceId: string
  status: PaymentPanelStatus
}

/**
 * Dev state definitions — each manipulates TrackedInvoice facts.
 * Status is always computed, never stored.
 */
const DEV_STATES = [
  { label: 'pending' },
  { label: 'confirming' },
  { label: 'paid' },
] as const

const FAKE_TX = ('0x' + '0'.repeat(64)) as `0x${string}`

/**
 * Inner component with hooks — only mounted in development.
 * Never imported/rendered in production → dead code eliminated by minifier.
 */
function DevStatusToggleInner({ invoiceId }: DevStatusToggleProps) {
  const { setTxHash, setConfirmations, setError, resetPaymentState } =
    useTrackedInvoiceStore(useShallow((s) => ({
      setTxHash: s.setTxHash,
      setConfirmations: s.setConfirmations,
      setError: s.setError,
      resetPaymentState: s.resetPaymentState,
    })))
  const [idx, setIdx] = useState(0)

  const handleCycle = () => {
    const next = (idx + 1) % DEV_STATES.length
    setIdx(next)

    // Reset error on every cycle
    setError(invoiceId, null)

    switch (next) {
      case 0: // pending — clear all payment facts
        resetPaymentState(invoiceId)
        break
      case 1: // confirming — unvalidated tx with partial confirmations
        setTxHash(invoiceId, FAKE_TX, false)
        setConfirmations(invoiceId, { current: 8, required: 15 })
        break
      case 2: // paid — validated tx
        setTxHash(invoiceId, FAKE_TX, true)
        break
    }
  }

  const state = DEV_STATES[idx]

  return (
    <button
      data-testid="dev-status-toggle"
      onClick={handleCycle}
      className="absolute top-2.5 right-12 z-10 cursor-pointer rounded-lg px-2 py-1 font-mono text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
      title="Dev: cycle payment status"
    >
      [{idx + 1}/{DEV_STATES.length} {state?.label}]
    </button>
  )
}

/**
 * Dev-only floating button that cycles through payment panel states
 * by manipulating facts (txHash, confirmations) instead of stored status.
 * Thin wrapper — returns null in production before mounting inner component,
 * so hooks are never called and code is tree-shaken.
 */
export function DevStatusToggle(props: DevStatusToggleProps) {
  if (process.env.NODE_ENV !== 'development') return null
  return <DevStatusToggleInner {...props} />
}
