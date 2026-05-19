'use client'

import React from 'react'
import { Button } from '@/shared/ui/button'
import { Loader2Icon, CheckCircleIcon, XIcon } from '@/shared/ui/icons'
import { formatAmount } from '@/shared/lib/amount-utils'
import { motion } from '@/shared/ui/motion'
import { FluidOverlay } from './FluidOverlay'
import { IN_PROGRESS_STEPS } from '../model/types'
import type { PaymentStep, AnimatedIdleSubState } from '../model/types'

function getStepCount(idleSubState: AnimatedIdleSubState): number {
  if (idleSubState === 'disconnected') return 3
  if (idleSubState === 'wrong-network') return 2
  return 1
}

function getButtonLabel(
  step: PaymentStep,
  idleSubState: AnimatedIdleSubState,
  currency: string,
  subtotal: string,
  decimals: number,
): { primary: string; secondary?: string } {
  const total = getStepCount(idleSubState)

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
  idleSubState: AnimatedIdleSubState,
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
// Props
// ---------------------------------------------------------------------------

export interface SmartPayButtonViewProps {
  step: PaymentStep
  idleSubState: AnimatedIdleSubState
  currency: string
  subtotal: string
  decimals: number
  /** When true, render Reconnecting label / disabled state. Default false. */
  isHydrating?: boolean
  /** When true, replace spinner content with "Cancel" pill. Default false. */
  showCancel?: boolean
  /** Click handler — wired in production wrapper, omitted in Remotion (per-frame static). */
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  /** ARIA — production wrapper computes; in Remotion same getAriaLabel applies. */
  ariaLabel?: string
}

// ---------------------------------------------------------------------------
// Module-level motion constants (stable references, never recreated per render)
// ---------------------------------------------------------------------------

const WHILE_HOVER = { scale: 1.015 } as const
const WHILE_TAP = { scale: 0.985 } as const
const SPRING_TRANSITION = { type: 'spring', stiffness: 300, damping: 25 } as const

const PROGRESS_INITIAL = { scaleX: 0 } as const
const PROGRESS_TRANSITION = { duration: 0.6, ease: 'easeOut' } as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SmartPayButtonView = React.memo(function SmartPayButtonView({
  step,
  idleSubState,
  currency,
  subtotal,
  decimals,
  isHydrating = false,
  showCancel = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ariaLabel,
}: SmartPayButtonViewProps) {
  const isHydratingIdle = isHydrating && step === 'idle'
  const baseLabel = getButtonLabel(step, idleSubState, currency, subtotal, decimals)
  const label = isHydratingIdle
    ? { primary: 'Reconnecting…', secondary: 'Please wait' }
    : baseLabel
  const computedAriaLabel = ariaLabel ?? (
    isHydratingIdle
      ? 'Reconnecting wallet, please wait'
      : getAriaLabel(step, idleSubState, currency, subtotal, decimals)
  )
  const progress = getProgress(step)
  const isRealInProgress = IN_PROGRESS_STEPS.has(step)
  const isInProgress = isRealInProgress || isHydratingIdle
  const isSuccess = step === 'success'
  const isSuccessState = isSuccess
  const canCancel = isRealInProgress && step !== 'confirming' && !isHydrating
  const canInteract = !isHydrating && !isSuccessState

  return (
    <motion.div
      className="relative w-full"
      {...(!isInProgress && canInteract && {
        whileHover: WHILE_HOVER,
        whileTap: WHILE_TAP,
      })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      transition={SPRING_TRANSITION}
    >
      <Button
        variant="void"
        size="lg"
        className={`h-14 w-full ${isSuccessState ? 'pointer-events-none' : ''}`}
        disabled={isHydrating}
        onClick={onClick}
        aria-label={showCancel && canCancel ? 'Cancel transaction' : computedAriaLabel}
        aria-live="polite"
        aria-busy={isInProgress}
      >
        <FluidOverlay step={step} />

        <span className="relative z-10 flex items-center justify-center gap-2.5">
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
              {isInProgress && (
                <span className="motion-safe:animate-[spin_1.5s_linear_infinite] inline-flex">
                  <Loader2Icon size={18} className="opacity-80" />
                </span>
              )}

              {isSuccess && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                >
                  <CheckCircleIcon size={18} className="text-emerald-400" />
                </motion.span>
              )}

              <span
                className={`flex flex-col items-center gap-0.5 ${
                  isInProgress ? 'motion-safe:animate-breathing' : ''
                }`}
              >
                <span className="text-base font-medium">{label.primary}</span>
                {label.secondary && (
                  <span className="text-xs font-normal opacity-60">{label.secondary}</span>
                )}
              </span>
            </>
          )}
        </span>

        {progress > 0 && (
          <motion.div
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left"
            initial={PROGRESS_INITIAL}
            animate={{
              scaleX: progress,
              backgroundColor: isSuccess
                ? 'oklch(78% 0.16 165)'
                : 'oklch(65% 0.22 280)',
            }}
            transition={PROGRESS_TRANSITION}
            style={{ backgroundColor: 'oklch(65% 0.22 280)' }}
          />
        )}
      </Button>
    </motion.div>
  )
})
