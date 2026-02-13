'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { VoidButtonOverlay } from '@/shared/ui/button-void-overlay'
import { Loader2Icon, CheckCircleIcon } from '@/shared/ui/icons'
import { formatAmount } from '@/shared/lib/amount-utils'
import { usePaymentFlow } from '../model/use-payment-flow'
import type { SmartPayButtonProps } from '../model/types'

function getButtonLabel(
  step: string,
  idleSubState: string,
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

function getButtonSubtitle(
  step: string,
  idleSubState: string,
): string | null {
  if (step !== 'idle') return null
  if (idleSubState === 'disconnected') return 'Auto: Connect \u2192 Switch \u2192 Pay'
  if (idleSubState === 'wrong-network') return 'Auto: Switch \u2192 Pay'
  return null
}

function isProcessing(step: string): boolean {
  return ['connecting', 'switching', 'sending', 'confirming', 'success'].includes(step)
}

export function SmartPayButton({
  invoice,
  invoiceId,
  exactTotal,
  onSuccess,
  onError,
  onDismissError: _onDismissError,
}: SmartPayButtonProps) {
  const { state, handlePay, idleSubState } = usePaymentFlow({
    invoice,
    invoiceId,
    exactTotal,
  })

  const { step, error, txHash } = state

  // Fire onError callback
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  // Fire onSuccess callback
  useEffect(() => {
    if (step === 'success' && txHash && onSuccess) {
      onSuccess(txHash)
    }
  }, [step, txHash, onSuccess])

  const label = getButtonLabel(step, idleSubState, invoice.currency, exactTotal, invoice.decimals)
  const subtitle = getButtonSubtitle(step, idleSubState)
  const disabled = isProcessing(step)
  const showSpinner = ['connecting', 'switching', 'sending', 'confirming'].includes(step)
  const showCheck = step === 'success'

  return (
    <Button
      variant="void"
      size="lg"
      className="relative w-full"
      disabled={disabled}
      onClick={handlePay}
    >
      <VoidButtonOverlay isLoading={showSpinner} isDisabled={disabled} />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {showSpinner && <Loader2Icon size={16} className="animate-spin" />}
        {showCheck && <CheckCircleIcon size={16} />}
        <span className="flex flex-col items-center">
          <span>{label}</span>
          {subtitle && (
            <span className="text-xs font-normal opacity-70">{subtitle}</span>
          )}
        </span>
      </span>
    </Button>
  )
}
