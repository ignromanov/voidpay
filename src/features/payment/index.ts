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

// Confirmation config
export { getSoftConfirmations, getFinalizationTimeout, getMaxBlockAge, getAvgBlockTimeMs, estimateFromBlockHex, estimateCurrentBlock } from './lib/confirmation-config'
export type { SoftConfirmationConfig } from './lib/confirmation-config'

// Transfer matching
export { matchTransfer } from './lib/match-transfer'
export type { TransferResult } from './lib/match-transfer'

// Hooks
export { usePaymentVerification } from './model/use-payment-verification'
export { useFinalizationTracker } from './model/use-finalization-tracker'
export { usePaymentPolling, __resetPollingCounters } from './model/use-payment-polling'
export type { PollingMode, PollingState } from './model/use-payment-polling'
export { useManualVerify } from './model/use-manual-verify'
export { useBatchCheck } from './model/use-batch-check'
export type { DecodedBatchInvoice } from './model/use-batch-check'
