/**
 * Smart Pay Button — Type Definitions
 *
 * Core types for the payment state machine, error taxonomy,
 * and component props.
 */

import type { Invoice } from '@/entities/invoice'

/** Current step in the payment flow */
export type PaymentStep =
  | 'idle'
  | 'connecting'
  | 'switching'
  | 'sending'
  | 'confirming'
  | 'success'

/** Idle sub-states derived from wallet context (not stored in reducer) */
export type IdleSubState = 'disconnected' | 'wrong-network' | 'ready'

/**
 * Derive the idle sub-state from wallet connection context.
 * Used to determine button label and click behavior when step === 'idle'.
 */
export function deriveIdleSubState(
  isConnected: boolean,
  hasMismatch: boolean,
): IdleSubState {
  if (!isConnected) return 'disconnected'
  if (hasMismatch) return 'wrong-network'
  return 'ready'
}

/** Categorized error type for user-friendly messaging and recovery routing */
export type PaymentErrorType =
  | 'USER_REJECTED'
  | 'INSUFFICIENT_FUNDS'
  | 'INSUFFICIENT_GAS'
  | 'NETWORK_SWITCH_FAILED'
  | 'TX_REVERTED'
  | 'RPC_ERROR'
  | 'INVALID_INVOICE'
  | 'UNKNOWN'

/** Rich error object for the state machine */
export interface PaymentError {
  type: PaymentErrorType
  message: string
  /** Step where the error occurred — determines recovery state */
  step: PaymentStep
}

/** Core state managed by useReducer */
export interface PaymentState {
  /** Current step in the flow */
  step: PaymentStep
  /** Error information (null when no error) */
  error: PaymentError | null
  /** Transaction hash from sendTransaction/writeContract */
  txHash: `0x${string}` | null
  /** Intent flag — enables auto-progression through steps */
  intent: boolean
}

/** Reducer actions for the payment state machine */
export type PaymentAction =
  | { type: 'START'; fromStep: 'connecting' | 'switching' | 'sending' }
  | { type: 'CONNECTED' }
  | { type: 'SWITCHED' }
  | { type: 'TX_SUBMITTED'; hash: `0x${string}` }
  | { type: 'CONFIRMED' }
  | { type: 'ERROR'; error: PaymentError }
  | { type: 'RESET' }

/** Initial payment state */
export const INITIAL_PAYMENT_STATE: PaymentState = {
  step: 'idle',
  error: null,
  txHash: null,
  intent: false,
}

/** All visual states of SmartPayButton for dev preview */
export type DevPaymentVisualStep =
  | 'idle:disconnected'
  | 'idle:wrong-network'
  | 'idle:ready'
  | 'connecting'
  | 'switching'
  | 'sending'
  | 'confirming'
  | 'success'

/** Parse dev override string into step + idleSubState */
export function parseDevOverride(dev: DevPaymentVisualStep): { step: PaymentStep; idleSubState: IdleSubState } {
  if (dev.startsWith('idle:')) {
    return { step: 'idle', idleSubState: dev.slice(5) as IdleSubState }
  }
  return { step: dev as PaymentStep, idleSubState: 'ready' }
}

/** Props for the SmartPayButton component */
export interface SmartPayButtonProps {
  /** Decoded invoice data */
  invoice: Invoice
  /** Stable storage key derived from URL hash (unique identifier) */
  invoiceKey: string
  /** Invoice ID for display purposes (may collide across senders) */
  invoiceId: string
  /** Exact total in atomic units (from computeAmounts — computed by parent) */
  exactTotal: string
  /** Clean subtotal in atomic units (without Magic Dust) for button label display */
  subtotal: string
  /** Callback when payment succeeds (txHash persisted) */
  onSuccess?: (txHash: `0x${string}`) => void
  /** Callback when error occurs (for parent error display) */
  onError?: (error: PaymentError) => void
  /** Dev-only: override visual step for state preview */
  devOverride?: DevPaymentVisualStep | null
}
