/**
 * Payment Toast — Step-by-step progress notifications
 *
 * Shows a single updating toast with checklist-style progress
 * during the SmartPayButton payment flow.
 */

import { useEffect, useRef, createElement } from 'react'
import { toast as sonnerToast } from 'sonner'
import { formatAmount } from '@/shared/lib/amount-utils'
import { getNetworkName } from '@/entities/network'
import type { PaymentStep, IdleSubState } from './types'

const TOAST_ID = 'payment-progress'

type StepStatus = 'pending' | 'active' | 'done' | 'failed'

interface StepDef {
  key: string
  activeLabel: string
  doneLabel: string
}

function buildSteps(
  idleSubState: IdleSubState,
  currency: string,
  formattedAmount: string,
): StepDef[] {
  const steps: StepDef[] = []

  if (idleSubState === 'disconnected') {
    steps.push({
      key: 'connect',
      activeLabel: 'Connecting wallet...',
      doneLabel: 'Connect wallet',
    })
  }

  if (idleSubState === 'disconnected' || idleSubState === 'wrong-network') {
    steps.push({
      key: 'switch',
      activeLabel: 'Switching network...',
      doneLabel: 'Switch network',
    })
  }

  steps.push({
    key: 'send',
    activeLabel: `Sending ${formattedAmount} ${currency}...`,
    doneLabel: `Send ${formattedAmount} ${currency}`,
  })

  steps.push({
    key: 'verify',
    activeLabel: 'Verifying on-chain...',
    doneLabel: 'Verify on-chain',
  })

  return steps
}

function stepToKey(step: PaymentStep): string | null {
  switch (step) {
    case 'connecting':
      return 'connect'
    case 'switching':
      return 'switch'
    case 'sending':
      return 'send'
    case 'confirming':
      return 'verify'
    default:
      return null
  }
}

function getStepStatus(stepDef: StepDef, activeKey: string | null, failed: boolean): StepStatus {
  if (failed && stepDef.key === activeKey) return 'failed'
  if (stepDef.key === activeKey) return 'active'

  const order = ['connect', 'switch', 'send', 'verify']
  const activeIdx = activeKey ? order.indexOf(activeKey) : -1
  const stepIdx = order.indexOf(stepDef.key)

  if (activeIdx >= 0 && stepIdx < activeIdx) return 'done'
  return 'pending'
}

const STATUS_ICONS: Record<StepStatus, string> = {
  pending: '\u25CB',  // ○
  active: '\u27F3',   // ⟳
  done: '\u2713',     // ✓
  failed: '\u2717',   // ✗
}

function buildChecklist(steps: StepDef[], activeKey: string | null, failed: boolean): React.ReactNode {
  const lines = steps.map((s) => {
    const status = getStepStatus(s, activeKey, failed)
    const icon = STATUS_ICONS[status]
    const label = status === 'active' ? s.activeLabel : s.doneLabel
    const color =
      status === 'done' ? 'rgb(74 222 128)' :     // green-400
      status === 'active' ? 'rgb(196 181 253)' :   // violet-300
      status === 'failed' ? 'rgb(248 113 113)' :   // red-400
      'rgb(161 161 170)'                            // zinc-400
    return createElement('div', { key: s.key, style: { color } }, `${icon} ${label}`)
  })
  return createElement('div', { style: { display: 'flex', flexDirection: 'column' as const, gap: '2px', fontSize: '13px' } }, ...lines)
}

function countDone(steps: StepDef[], activeKey: string | null): number {
  const order = ['connect', 'switch', 'send', 'verify']
  const activeIdx = activeKey ? order.indexOf(activeKey) : -1
  return steps.filter((s) => {
    const idx = order.indexOf(s.key)
    return idx < activeIdx
  }).length
}

interface UsePaymentToastParams {
  step: PaymentStep
  idleSubState: IdleSubState
  currency: string
  subtotal: string
  decimals: number
  networkId: number
  error: { message: string } | null
  devOverride?: boolean
}

export function usePaymentToast({
  step,
  idleSubState,
  currency,
  subtotal,
  decimals,
  networkId,
  error,
  devOverride,
}: UsePaymentToastParams): void {
  const stepsRef = useRef<StepDef[] | null>(null)
  const startSubStateRef = useRef<IdleSubState>(idleSubState)

  // Capture steps at flow start (when transitioning from idle)
  const prevStepRef = useRef<PaymentStep>('idle')

  useEffect(() => {
    if (devOverride) return

    const prevStep = prevStepRef.current
    prevStepRef.current = step

    const formattedAmount = formatAmount(subtotal, decimals)

    // Flow just started — capture steps based on starting state
    if (prevStep === 'idle' && step !== 'idle' && step !== 'success') {
      startSubStateRef.current = idleSubState === 'ready'
        ? (step === 'connecting' ? 'disconnected' : step === 'switching' ? 'wrong-network' : 'ready')
        : idleSubState
      stepsRef.current = buildSteps(startSubStateRef.current, currency, formattedAmount)
    }

    const steps = stepsRef.current
    if (!steps) return

    const activeKey = stepToKey(step)

    // Success — update toast to success + pending finalization
    if (step === 'success') {
      const allDone = steps.map((s) =>
        createElement('div', { key: s.key, style: { color: 'rgb(74 222 128)' } }, `\u2713 ${s.doneLabel}`)
      )
      const finalizeLine = createElement('div', {
        key: 'finalize',
        style: { color: 'rgb(161 161 170)', marginTop: '4px', borderTop: '1px solid rgb(63 63 70)', paddingTop: '4px' },
      }, '\u25CB Finalizing on-chain...')

      sonnerToast.success('Payment sent \u2713', {
        id: TOAST_ID,
        description: createElement('div', { style: { display: 'flex', flexDirection: 'column' as const, gap: '2px', fontSize: '13px' } }, ...allDone, finalizeLine),
        duration: 15000,
      })
      stepsRef.current = null
      return
    }

    // Error — update toast to show failure
    if (step === 'idle' && error && prevStep !== 'idle') {
      const checklist = buildChecklist(steps, stepToKey(prevStep), true)
      sonnerToast.error('Payment failed', {
        id: TOAST_ID,
        description: checklist,
        duration: 8000,
      })
      stepsRef.current = null
      return
    }

    // Reset (user canceled) — dismiss
    if (step === 'idle' && prevStep !== 'idle') {
      sonnerToast.dismiss(TOAST_ID)
      stepsRef.current = null
      return
    }

    // Active step — show/update progress toast
    if (activeKey) {
      const done = countDone(steps, activeKey)
      const checklist = buildChecklist(steps, activeKey, false)
      const title = `Payment Progress (${done + 1}/${steps.length})`

      sonnerToast.loading(title, {
        id: TOAST_ID,
        description: checklist,
        duration: Infinity,
      })
    }
  }, [step, idleSubState, currency, subtotal, decimals, networkId, error, devOverride])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sonnerToast.dismiss(TOAST_ID)
    }
  }, [])
}

const FINALIZATION_TOAST_ID = 'payment-finalization'

/**
 * Shows a toast when payment is finalized (deep confirmation).
 * Call from PayWorkspace/InvoiceWorkspace level where `finalized` is available.
 */
export function useFinalizationToast({
  finalized,
  currency,
  subtotal,
  decimals,
  networkId,
}: {
  finalized: boolean
  currency: string
  subtotal: string
  decimals: number
  networkId: number
}): void {
  const prevFinalized = useRef(false)

  useEffect(() => {
    if (finalized && !prevFinalized.current) {
      prevFinalized.current = true
      const formattedAmount = formatAmount(subtotal, decimals)
      const networkName = getNetworkName(networkId)

      // Update the existing payment toast if still visible
      sonnerToast.dismiss(TOAST_ID)

      sonnerToast.success('Payment finalized \u2713\u2713', {
        id: FINALIZATION_TOAST_ID,
        description: `${formattedAmount} ${currency} confirmed on ${networkName}`,
        duration: 6000,
      })
    }
  }, [finalized, currency, subtotal, decimals, networkId])
}
