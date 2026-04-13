'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/shared/ui/button'
import { Loader2Icon, CheckCircleIcon, XIcon } from '@/shared/ui/icons'
import { formatAmount } from '@/shared/lib/amount-utils'
import { useWagmiHydrating } from '@/shared/lib'
import { motion } from '@/shared/ui/motion'
import { FluidOverlay } from './FluidOverlay'
import { usePaymentFlow } from '../model/use-payment-flow'
import { usePaymentToast } from '../model/use-payment-toast'
import { parseDevOverride } from '../model/types'
import type { SmartPayButtonProps, PaymentStep, IdleSubState } from '../model/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IN_PROGRESS_STEPS = new Set<PaymentStep>(['connecting', 'switching', 'sending', 'confirming'])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStepCount(idleSubState: IdleSubState): { total: number; offset: number } {
  // offset = how many steps are skipped (already done)
  if (idleSubState === 'disconnected') return { total: 3, offset: 0 }  // connect → switch → send
  if (idleSubState === 'wrong-network') return { total: 2, offset: 0 } // switch → send
  return { total: 1, offset: 0 }                                       // send only
}

function getButtonLabel(
  step: PaymentStep,
  idleSubState: IdleSubState,
  currency: string,
  subtotal: string,
  decimals: number,
): { primary: string; secondary?: string } {
  const { total } = getStepCount(idleSubState)

  switch (step) {
    case 'idle': {
      if (idleSubState === 'disconnected')
        return { primary: 'Connect Wallet', secondary: 'To proceed with payment' }
      if (idleSubState === 'wrong-network')
        return { primary: 'Switch Network', secondary: 'Required for this payment' }
      return { primary: `Pay ${formatAmount(subtotal, decimals)} ${currency}` }
    }
    case 'connecting':
      return { primary: 'Connecting', secondary: `Step 1 of ${total}` }
    case 'switching': {
      const n = idleSubState === 'disconnected' ? 2 : 1
      return { primary: 'Switching', secondary: `Step ${n} of ${total}` }
    }
    case 'sending':
      return total > 1
        ? { primary: 'Sending', secondary: `Step ${total} of ${total}` }
        : { primary: 'Sending' }
    case 'confirming':
      return { primary: 'Confirming', secondary: 'Verifying on-chain' }
    case 'success':
      return { primary: 'Transaction submitted' }
    default:
      return { primary: 'Pay' }
  }
}

/** Progress fraction (0–1) for the linear bar at the button bottom edge */
function getProgress(step: PaymentStep): number {
  switch (step) {
    case 'connecting':
      return 0.25
    case 'switching':
      return 0.45
    case 'sending':
      return 0.7
    case 'confirming':
      return 0.9
    case 'success':
      return 1
    default:
      return 0
  }
}

/** Screen-reader label with full context */
function getAriaLabel(
  step: PaymentStep,
  idleSubState: IdleSubState,
  currency: string,
  subtotal: string,
  decimals: number,
): string {
  switch (step) {
    case 'idle': {
      if (idleSubState === 'disconnected') return 'Connect wallet to proceed with payment'
      if (idleSubState === 'wrong-network') return 'Switch network to continue payment'
      return `Pay ${formatAmount(subtotal, decimals)} ${currency}`
    }
    case 'connecting':
      return 'Connecting wallet. Step 1 of 3.'
    case 'switching':
      return 'Switching network. Step 2 of 3.'
    case 'sending':
      return 'Sending transaction. Step 3 of 3. Please confirm in your wallet.'
    case 'confirming':
      return 'Transaction submitted. Waiting for blockchain confirmation.'
    case 'success':
      return 'Transaction submitted successfully.'
    default:
      return 'Pay'
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SmartPayButton({
  invoice,
  contentHash,
  exactTotal,
  subtotal,
  onSuccess,
  onError,
  devOverride,
}: SmartPayButtonProps) {
  const { step: realStep, error, txHash, handlePay, handleCancel, idleSubState: realIdleSubState } = usePaymentFlow({
    invoice,
    contentHash,
    exactTotal,
  })

  const isHydrating = useWagmiHydrating()

  // Dev override: swap visual step while real flow continues underneath
  const { step, idleSubState } = devOverride
    ? parseDevOverride(devOverride)
    : { step: realStep, idleSubState: realIdleSubState }

  // Toast notifications for payment progress
  usePaymentToast({
    step: realStep,
    idleSubState: realIdleSubState,
    currency: invoice.currency,
    subtotal,
    decimals: invoice.decimals,
    networkId: invoice.networkId,
    error,
    devOverride: !!devOverride,
  })

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

  // Hydration (pre-mount with persisted connection, reconnect, or fresh
  // connect) takes priority over idle labels — visible spinner + "Reconnecting…"
  // so the button is obviously busy. Without this the button flashes a
  // clickable "Connect Wallet" during wagmi's SSR hydration gap, letting the
  // user race handlePay against the background reconnect.
  const isHydratingIdle = isHydrating && step === 'idle' && !devOverride
  const baseLabel = getButtonLabel(step, idleSubState, invoice.currency, subtotal, invoice.decimals)
  const label = isHydratingIdle
    ? { primary: 'Reconnecting…', secondary: 'Please wait' }
    : baseLabel
  const ariaLabel = isHydratingIdle
    ? 'Reconnecting wallet, please wait'
    : getAriaLabel(step, idleSubState, invoice.currency, subtotal, invoice.decimals)
  const progress = getProgress(step)
  const isRealInProgress = IN_PROGRESS_STEPS.has(step)
  const isInProgress = isRealInProgress || isHydratingIdle
  const isSuccess = step === 'success'
  const isSuccessState = isSuccess && !devOverride
  // Cancel available for real payment steps only — hydration is not cancelable.
  const canCancel = isRealInProgress && step !== 'confirming' && !devOverride

  // Cancel overlay state (hover on desktop, tap-toggle on mobile)
  const [showCancel, setShowCancel] = useState(false)
  useEffect(() => { setShowCancel(false) }, [step])

  const handleClick = useCallback(() => {
    if (devOverride) return
    if (canCancel && showCancel) {
      handleCancel()
      setShowCancel(false)
      return
    }
    if (canCancel) {
      setShowCancel(true)
      return
    }
    if (!isSuccessState) {
      handlePay()
    }
  }, [devOverride, canCancel, showCancel, handleCancel, handlePay, isSuccessState])

  const canInteract = !isHydrating && !isSuccessState

  return (
    <motion.div
      className="relative w-full"
      {...(!isInProgress && canInteract && {
        whileHover: { scale: 1.015 },
        whileTap: { scale: 0.985 },
      })}
      onMouseEnter={() => canCancel && setShowCancel(true)}
      onMouseLeave={() => setShowCancel(false)}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Button
        variant="void"
        size="lg"
        className={`h-14 w-full ${isSuccessState ? 'pointer-events-none' : ''}`}
        disabled={devOverride ? false : isHydrating}
        onClick={handleClick}
        aria-label={showCancel && canCancel ? 'Cancel transaction' : ariaLabel}
        aria-live="polite"
        aria-busy={isInProgress}
      >
        <FluidOverlay step={step} />

        <span className="relative z-10 flex items-center justify-center gap-2.5">
          {/* Cancel overlay — replaces spinner content on hover/tap */}
          {showCancel && canCancel ? (
            <motion.span
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
            >
              <XIcon size={18} />
              <span className="text-base font-medium">Cancel</span>
            </motion.span>
          ) : (
            <>
              {/* Spinner — gentle organic rotation.
                  Keyframes [0, 360] (not single value 360) — framer-motion v12 WAAPI
                  backend stalls single-value rotate on second iteration under some
                  wallet extensions (e.g. Rabby) which inject content scripts that
                  force a re-render mid-animation. */}
              {isInProgress && (
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2Icon size={18} className="opacity-80" />
                </motion.span>
              )}

              {/* Success checkmark — spring entrance */}
              {isSuccess && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                >
                  <CheckCircleIcon size={18} className="text-emerald-400" />
                </motion.span>
              )}

              {/* Labels — subtle breathing scale during loading */}
              <motion.span
                className="flex flex-col items-center gap-0.5"
                animate={isInProgress ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={
                  isInProgress
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.3 }
                }
              >
                <span className="text-base font-medium">{label.primary}</span>
                {label.secondary && (
                  <span className="text-xs font-normal opacity-60">{label.secondary}</span>
                )}
              </motion.span>
            </>
          )}
        </span>

        {/* Linear progress bar — bottom edge */}
        {progress > 0 && (
          <motion.div
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left"
            initial={{ scaleX: 0 }}
            animate={{
              scaleX: progress,
              backgroundColor: isSuccess
                ? 'oklch(78% 0.16 165)'
                : 'oklch(65% 0.22 280)',
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ backgroundColor: 'oklch(65% 0.22 280)' }}
          />
        )}
      </Button>
    </motion.div>
  )
}
