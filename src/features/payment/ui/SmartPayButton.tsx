'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Loader2Icon, CheckCircleIcon } from '@/shared/ui/icons'
import { formatAmount } from '@/shared/lib/amount-utils'
import { motion } from '@/shared/ui/motion'
import { BlackHoleOverlay, type BlackHoleState } from './BlackHoleOverlay'
import { usePaymentFlow } from '../model/use-payment-flow'
import type { SmartPayButtonProps, PaymentStep, IdleSubState, DevPaymentVisualStep } from '../model/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapToBlackHoleState(step: PaymentStep): BlackHoleState {
  switch (step) {
    case 'connecting':
    case 'switching':
      return 'active'
    case 'sending':
    case 'confirming':
      return 'intense'
    case 'success':
      return 'success'
    default:
      return 'idle'
  }
}

function getButtonLabel(
  step: PaymentStep,
  idleSubState: IdleSubState,
  currency: string,
  exactTotal: string,
  decimals: number,
): string {
  switch (step) {
    case 'idle': {
      if (idleSubState === 'disconnected') return 'Smart Pay'
      if (idleSubState === 'wrong-network') return 'Smart Switch'
      return `Pay ${formatAmount(exactTotal, decimals)} ${currency}`
    }
    case 'connecting':
      return 'Connecting wallet...'
    case 'switching':
      return 'Switching network...'
    case 'sending':
      return 'Sending funds...'
    case 'confirming':
      return 'Verifying on-chain...'
    case 'success':
      return 'Payment complete'
    default:
      return 'Pay'
  }
}

function getButtonSubtitle(step: PaymentStep, idleSubState: IdleSubState): string | null {
  if (step === 'idle') {
    if (idleSubState === 'disconnected') return 'Auto: Connect \u2192 Switch \u2192 Pay'
    if (idleSubState === 'wrong-network') return 'Auto: Switch \u2192 Pay'
    return null
  }
  if (step === 'connecting') return 'Step 1 of 3'
  if (step === 'switching') return 'Step 2 of 3'
  if (step === 'sending') return 'Step 3 of 3'
  if (step === 'confirming') return 'Almost there...'
  return null
}

function parseDevOverride(dev: DevPaymentVisualStep): { step: PaymentStep; idleSubState: IdleSubState } {
  if (dev.startsWith('idle:')) {
    return { step: 'idle', idleSubState: dev.slice(5) as IdleSubState }
  }
  return { step: dev as PaymentStep, idleSubState: 'ready' }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SmartPayButton({
  invoice,
  invoiceId,
  exactTotal,
  onSuccess,
  onError,
  onDismissError: _onDismissError,
  devOverride,
}: SmartPayButtonProps) {
  const { state, handlePay, idleSubState: realIdleSubState } = usePaymentFlow({
    invoice,
    invoiceId,
    exactTotal,
  })

  const { step: realStep, error, txHash } = state

  // Dev override: swap visual step while real flow continues underneath
  const { step, idleSubState } = devOverride
    ? parseDevOverride(devOverride)
    : { step: realStep, idleSubState: realIdleSubState }

  // Fire callbacks only for real flow
  useEffect(() => {
    if (error && onError && !devOverride) {
      onError(error)
    }
  }, [error, onError, devOverride])

  useEffect(() => {
    if (realStep === 'success' && txHash && onSuccess && !devOverride) {
      onSuccess(txHash)
    }
  }, [realStep, txHash, onSuccess, devOverride])

  const label = getButtonLabel(step, idleSubState, invoice.currency, exactTotal, invoice.decimals)
  const subtitle = getButtonSubtitle(step, idleSubState)
  const isInProgress = (['connecting', 'switching', 'sending', 'confirming'] as string[]).includes(step)
  const showSpinner = isInProgress
  const showCheck = step === 'success'
  const overlayState = mapToBlackHoleState(step)

  // Success: not disabled (keeps colorful overlay), but not interactive
  const buttonDisabled = devOverride ? false : isInProgress
  const isSuccessState = step === 'success' && !devOverride
  const canInteract = !buttonDisabled && !isSuccessState

  return (
    <motion.div
      className="relative w-full"
      {...(canInteract && {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.97 },
      })}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Button
        variant="void"
        size="lg"
        noOverlay
        className={`w-full ${isSuccessState ? 'pointer-events-none' : ''}`}
        disabled={buttonDisabled}
        onClick={devOverride ? undefined : handlePay}
      >
        <BlackHoleOverlay state={overlayState} />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {showSpinner && <Loader2Icon size={16} className="animate-spin" />}
          {showCheck && <CheckCircleIcon size={16} className="text-emerald-400" />}
          <span className="flex flex-col items-center">
            <span>{label}</span>
            {subtitle && (
              <span className="text-xs font-normal opacity-70">{subtitle}</span>
            )}
          </span>
        </span>
      </Button>
    </motion.div>
  )
}
