'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWagmiHydrating } from '@/shared/lib'
import { usePaymentFlow } from '../model/use-payment-flow'
import { usePaymentToast } from '../model/use-payment-toast'
import { parseDevOverride } from '../model/types'
import type { SmartPayButtonProps } from '../model/types'
import { IN_PROGRESS_STEPS } from '../model/types'
import { SmartPayButtonView } from './SmartPayButtonView'

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

  // Hydration takes priority over idle labels — suppress clickable state
  // during wagmi's SSR hydration gap (devOverride bypasses this).
  const isHydratingActive = isHydrating && !devOverride

  const isRealInProgress = IN_PROGRESS_STEPS.has(step)
  const isSuccessState = step === 'success' && !devOverride
  const canCancel = isRealInProgress && step !== 'confirming' && !devOverride

  // Cancel overlay state (hover on desktop, tap-toggle on mobile)
  const [showCancel, setShowCancel] = useState(false)
  useEffect(() => { setShowCancel(false) }, [step])

  const handleMouseEnter = useCallback(() => { if (canCancel) setShowCancel(true) }, [canCancel])
  const handleMouseLeave = useCallback(() => { setShowCancel(false) }, [])

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

  return (
    <SmartPayButtonView
      step={step}
      idleSubState={idleSubState}
      currency={invoice.currency}
      subtotal={subtotal}
      decimals={invoice.decimals}
      isHydrating={isHydratingActive}
      showCancel={showCancel && canCancel}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  )
}
