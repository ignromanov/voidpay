import type { PaymentErrorType, PaymentStep } from '../model/types'
import {
  isUserRejected,
  isInsufficientFunds,
  isChainMismatch,
  isReceiptTimeout,
  isReceiptNotFound,
  isTxReverted,
} from '@/shared/lib/web3-errors'

interface ErrorWithShortMessage extends Error {
  shortMessage?: string
}

export function classifyPaymentError(error: Error, _step: PaymentStep): PaymentErrorType {
  // Priority 1: User intent (rejection) — typed detection via viem cause chain
  // Must be first: a rejected network switch must NOT be classified as NETWORK_SWITCH_FAILED.
  if (isUserRejected(error)) return 'USER_REJECTED'

  // Priority 2: Insufficient gas — more specific than general insufficient funds.
  // Kept as string match because viem's InsufficientFundsError doesn't distinguish gas vs balance.
  const err = error as ErrorWithShortMessage
  const msg = err.shortMessage ?? err.message ?? ''
  const lower = msg.toLowerCase()
  if (lower.includes('insufficient funds for gas')) return 'INSUFFICIENT_GAS'

  // Priority 3: Insufficient funds / balance — typed first, fallback to string
  if (isInsufficientFunds(error)) return 'INSUFFICIENT_FUNDS'

  // Priority 4: Transaction reverted on-chain
  if (isTxReverted(error)) return 'TX_REVERTED'

  // Priority 5: Receipt wait failures — timeout / not found → treated as RPC issues
  if (isReceiptTimeout(error) || isReceiptNotFound(error)) return 'RPC_ERROR'

  // Priority 6: Chain mismatch during transaction (wallet switched mid-flow)
  if (isChainMismatch(error)) return 'NETWORK_SWITCH_FAILED'

  // Priority 7: Generic RPC/network errors (fallback string match)
  if (lower.includes('rpc') || lower.includes('network') || lower.includes('timeout')) {
    return 'RPC_ERROR'
  }

  // NO step-based fallback for NETWORK_SWITCH_FAILED — USER_REJECTED catches real user rejections,
  // ChainMismatchError catches genuine chain mismatches, anything else during 'switching' is UNKNOWN.
  return 'UNKNOWN'
}
