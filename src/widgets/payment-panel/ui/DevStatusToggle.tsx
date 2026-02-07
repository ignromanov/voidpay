'use client'

import { useState } from 'react'
import { useRichInvoiceStore } from '@/entities/invoice'
import type { PaymentPanelStatus } from '../types'

interface DevStatusToggleProps {
  invoiceId: string
  status: PaymentPanelStatus
}

/**
 * Dev state definitions — each maps to a set of store mutations.
 */
const DEV_STATES = [
  { label: 'pending' },
  { label: 'pending+err' },
  { label: 'confirming' },
  { label: 'paid' },
  { label: 'overdue' },
] as const

const FAKE_TX = '0x' + '0'.repeat(64)

/**
 * Inner component with hooks — only mounted in development.
 * Never imported/rendered in production → dead code eliminated by minifier.
 */
function DevStatusToggleInner({ invoiceId }: DevStatusToggleProps) {
  const { updateStatus, setTxHash, setConfirmations, setError } = useRichInvoiceStore()
  const [idx, setIdx] = useState(0)

  const handleCycle = () => {
    const next = (idx + 1) % DEV_STATES.length
    setIdx(next)

    // Reset transient fields first
    setError(invoiceId, null)
    setConfirmations(invoiceId, undefined)

    switch (next) {
      case 0: // pending
        updateStatus(invoiceId, 'pending')
        break
      case 1: // pending + error
        updateStatus(invoiceId, 'pending')
        setError(invoiceId, 'Insufficient funds for gas + value')
        break
      case 2: // confirming (tx detected, waiting for finalization)
        updateStatus(invoiceId, 'paid')
        setTxHash(invoiceId, FAKE_TX, false)
        setConfirmations(invoiceId, { current: 8, required: 15 })
        break
      case 3: // paid (fully validated)
        updateStatus(invoiceId, 'paid')
        setTxHash(invoiceId, FAKE_TX, true)
        break
      case 4: // overdue
        updateStatus(invoiceId, 'overdue')
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
 * Dev-only floating button that cycles through all payment panel states.
 * Thin wrapper — returns null in production before mounting inner component,
 * so hooks are never called and code is tree-shaken.
 */
export function DevStatusToggle(props: DevStatusToggleProps) {
  if (process.env.NODE_ENV !== 'development') return null
  return <DevStatusToggleInner {...props} />
}
