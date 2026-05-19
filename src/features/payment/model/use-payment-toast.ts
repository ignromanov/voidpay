/**
 * Payment Toast — Step-by-step progress notifications
 *
 * Shows a single updating toast with checklist-style progress
 * during the SmartPayButton payment flow.
 */

import { useEffect, useRef, createElement } from 'react'
import { toast as sonnerToast } from 'sonner'
import { formatAmount } from '@/shared/lib/amount-utils'
import { useIsMobile } from '@/shared/lib'
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
  active: '\u25CF',   // ●
  done: '\u2713',     // ✓
  failed: '\u2717',   // ✗
}

function buildChecklist(steps: StepDef[], activeKey: string | null, failed: boolean): React.ReactNode {
  const lines = steps.map((s) => {
    const status = getStepStatus(s, activeKey, failed)
    const icon = STATUS_ICONS[status]
    const label = status === 'active' ? s.activeLabel : s.doneLabel
    const color =
      status === 'done' ? '#34d399' :     // emerald-400
      status === 'active' ? '#a78bfa' :   // violet-400
      status === 'failed' ? '#f87171' :   // red-400
      '#71717a'                            // zinc-500
    const fontWeight = status === 'active' ? '500' : '400'
    return createElement('div', {
      key: s.key,
      style: {
        color,
        fontWeight,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 0',
      },
    },
      createElement('span', {
        style: {
          width: '16px',
          textAlign: 'center' as const,
          fontSize: status === 'active' ? '10px' : '13px',
          ...(status === 'active' ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}),
        },
      }, icon),
      createElement('span', { style: { fontSize: '13px' } }, label),
    )
  })
  return createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1px',
      padding: '4px 0',
    },
  }, ...lines)
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
  const isMobile = useIsMobile()
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
        createElement('div', {
          key: s.key,
          style: {
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 0',
          },
        },
          createElement('span', { style: { width: '16px', textAlign: 'center' as const, fontSize: '13px' } }, '\u2713'),
          createElement('span', { style: { fontSize: '13px' } }, s.doneLabel),
        )
      )
      const finalizeLine = createElement('div', {
        key: 'finalize',
        style: {
          color: '#71717a',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 0',
          marginTop: '6px',
          borderTop: '1px solid rgba(63, 63, 70, 0.5)',
          paddingTop: '6px',
        },
      },
        createElement('span', {
          style: {
            width: '16px',
            textAlign: 'center' as const,
            fontSize: '10px',
            animation: 'pulse 1.5s ease-in-out infinite',
          },
        }, '\u25CF'),
        createElement('span', { style: { fontSize: '13px' } }, 'Finalizing on-chain...'),
      )

      sonnerToast.success('Payment sent \u2713', {
        id: TOAST_ID,
        description: createElement('div', {
          style: { display: 'flex', flexDirection: 'column' as const, gap: '1px', padding: '4px 0' },
        }, ...allDone, finalizeLine),
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

    // Active step — show/update progress toast (desktop only; mobile uses RainbowKit inline)
    if (activeKey && !isMobile) {
      const done = countDone(steps, activeKey)
      const checklist = buildChecklist(steps, activeKey, false)
      const title = `Payment Progress (${done + 1}/${steps.length})`

      sonnerToast.loading(title, {
        id: TOAST_ID,
        description: checklist,
        duration: Infinity,
      })
    }
  }, [step, idleSubState, currency, subtotal, decimals, networkId, error, devOverride, isMobile])

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
  const prevFinalized = useRef(finalized)

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
