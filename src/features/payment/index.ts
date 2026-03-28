/**
 * Payment Feature — Public API
 *
 * Smart Pay Button: adaptive payment button with auto-chain flow.
 */

export { SmartPayButton } from './ui/SmartPayButton'
export type { SmartPayButtonProps, PaymentError, PaymentStep, DevPaymentVisualStep } from './model/types'

// Verification
export { verifyNativeReceipt, verifyErc20Receipt } from './lib/verify-receipt'
export type { VerificationResult } from './lib/verify-receipt'

// Confirmation config (canonical source: entities/network)
export { getSoftConfirmations, getFinalizationTimeout } from '@/entities/network'
export type { SoftConfirmationConfig } from '@/entities/network'

// Transfer matching
export { matchTransfer } from './lib/match-transfer'
export type { TransferResult } from './lib/match-transfer'

// Hooks
export { usePaymentVerification } from './model/use-payment-verification'
export { useFinalizationTracker } from './model/use-finalization-tracker'
export { usePaymentPolling, __resetPollingCounters } from './model/use-payment-polling'
export type { PollingMode, PollingState, UsePaymentPollingResult } from './model/use-payment-polling'
export { useManualVerify } from './model/use-manual-verify'
export { useBatchCheck } from './model/use-batch-check'
export type { DecodedBatchInvoice } from './model/use-batch-check'
export { useFinalizationToast } from './model/use-payment-toast'
