'use client'

import { useState } from 'react'
import type { DevPaymentVisualStep } from '@/features/payment'

const DEV_STEPS: DevPaymentVisualStep[] = [
  'idle:disconnected',
  'idle:wrong-network',
  'idle:ready',
  'connecting',
  'switching',
  'sending',
  'confirming',
  'success',
]

interface DevPaymentStepToggleProps {
  onChange: (step: DevPaymentVisualStep | null) => void
}

/**
 * Inner component with hooks — only mounted in development.
 * Cycles through all SmartPayButton visual states for design preview.
 */
function DevPaymentStepToggleInner({ onChange }: DevPaymentStepToggleProps) {
  const [idx, setIdx] = useState<number | null>(null)

  const handleCycle = () => {
    if (idx === null) {
      setIdx(0)
      onChange(DEV_STEPS[0] ?? null)
    } else {
      // +1 slot for "off" (back to real mode)
      const next = (idx + 1) % (DEV_STEPS.length + 1)
      if (next === DEV_STEPS.length) {
        setIdx(null)
        onChange(null)
      } else {
        setIdx(next)
        onChange(DEV_STEPS[next] ?? null)
      }
    }
  }

  const label = idx !== null ? DEV_STEPS[idx] : 'real'
  const display = idx !== null ? `${idx + 1}/${DEV_STEPS.length} ${label}` : 'btn'

  return (
    <button
      data-testid="dev-payment-step-toggle"
      onClick={handleCycle}
      className="absolute top-2.5 right-[9rem] z-10 cursor-pointer rounded-lg px-2 py-1 font-mono text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
      title="Dev: cycle SmartPayButton visual states"
    >
      [{display}]
    </button>
  )
}

/**
 * Dev-only toggle that cycles through all SmartPayButton visual states.
 * Returns null in production → dead code eliminated by minifier.
 */
export function DevPaymentStepToggle(props: DevPaymentStepToggleProps) {
  if (process.env.NODE_ENV !== 'development') return null
  return <DevPaymentStepToggleInner {...props} />
}
