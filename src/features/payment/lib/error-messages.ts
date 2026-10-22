/**
 * User-Friendly Payment Error Messages
 *
 * Maps PaymentErrorType to human-readable messages.
 * Raw viem/wagmi errors are replaced with concise, actionable text.
 */

import type { PaymentErrorType } from '../model/types'

export type ErrorSeverity = 'info' | 'warning' | 'error'

export interface ErrorMessage {
  title: string
  description: string
  severity: ErrorSeverity
}

/**
 * Canonical canceled copy — Shade S7 (spec 095): only UserRejectedRequestError / EIP-1193 4001
 * maps here. All other errors must NOT imply a user action.
 */
export const CANCELED_COPY = {
  title: 'You canceled',
  description: 'Tap Send when ready.',
} as const

const ERROR_MESSAGES: Record<PaymentErrorType, ErrorMessage> = {
  USER_REJECTED: { ...CANCELED_COPY, severity: 'info' },
  INSUFFICIENT_FUNDS: {
    title: 'Insufficient balance',
    description: 'Not enough tokens in your wallet to complete this payment.',
    severity: 'warning',
  },
  INSUFFICIENT_GAS: {
    title: 'Insufficient gas',
    description: 'Not enough native tokens to cover transaction fees.',
    severity: 'warning',
  },
  NETWORK_SWITCH_FAILED: {
    title: 'Switch network',
    description: 'Switch to the correct network in your wallet.',
    severity: 'error',
  },
  TX_REVERTED: {
    title: 'Transaction failed',
    description: 'Transaction was rejected by the blockchain. Please try again.',
    severity: 'error',
  },
  RPC_ERROR: {
    title: 'Connection issue',
    description: 'Could not reach the network. Check your connection and try again.',
    severity: 'error',
  },
  INVALID_INVOICE: {
    title: 'Invalid invoice',
    description: 'This payment link contains invalid data. Ask the sender for a new link.',
    severity: 'error',
  },
  UNKNOWN: {
    title: 'Something went wrong',
    description: 'Try again.',
    severity: 'error',
  },
}

/** Get user-friendly error message for a payment error type */
export function getErrorMessage(type: PaymentErrorType): ErrorMessage {
  return ERROR_MESSAGES[type]
}

/** Compose a single-line message from error type (for string-based consumers) */
export function formatErrorMessage(type: PaymentErrorType): string {
  const { title, description } = ERROR_MESSAGES[type]
  return `${title}: ${description}`
}
