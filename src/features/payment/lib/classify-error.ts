/**
 * Payment Error Classification
 *
 * Classifies wallet/network/transaction errors into user-friendly categories.
 * Uses pattern matching on error messages and names (wagmi/viem convention).
 */

import type { PaymentErrorType, PaymentStep } from '../model/types'

interface ErrorWithShortMessage extends Error {
  shortMessage?: string
}

/**
 * Classify a wallet/transaction error into a PaymentErrorType.
 *
 * Detection priority:
 * 1. User rejection (by name or message)
 * 2. Insufficient gas (before general insufficient funds — more specific)
 * 3. Insufficient funds
 * 4. Network switch failure (step-based)
 * 5. Transaction reverted
 * 6. RPC/network errors
 * 7. Unknown fallback
 */
export function classifyPaymentError(error: Error, step: PaymentStep): PaymentErrorType {
  const err = error as ErrorWithShortMessage
  const msg = err.shortMessage ?? err.message ?? ''
  const name = error.name ?? ''
  const lower = msg.toLowerCase()

  // User rejection patterns
  if (
    name.includes('UserRejected') ||
    lower.includes('user rejected') ||
    lower.includes('user denied')
  ) {
    return 'USER_REJECTED'
  }

  // Insufficient gas (must check before general insufficient funds)
  if (lower.includes('insufficient funds for gas')) {
    return 'INSUFFICIENT_GAS'
  }

  // Insufficient funds / balance
  if (lower.includes('insufficient funds') || lower.includes('insufficient balance')) {
    return 'INSUFFICIENT_FUNDS'
  }

  // Network switch errors (step-based detection)
  if (step === 'switching') {
    return 'NETWORK_SWITCH_FAILED'
  }

  // Transaction reverted
  if (lower.includes('reverted')) {
    return 'TX_REVERTED'
  }

  // RPC / network errors
  if (lower.includes('rpc') || lower.includes('network') || lower.includes('timeout')) {
    return 'RPC_ERROR'
  }

  return 'UNKNOWN'
}
