import type { PaymentPanelStatus } from '../types'

export interface StatusInput {
  /** Status from RichInvoiceStore */
  storedStatus?: string | undefined
  /** Whether tx hash has been validated on-chain */
  txHashValidated?: boolean | undefined
  /** Invoice due date (unix timestamp in seconds) */
  dueAt?: number | undefined
}

/**
 * Derive PaymentPanelStatus from stored invoice state.
 *
 * Priority:
 * 1. Stored 'paid' + validated → 'paid'; not validated → 'confirming'
 * 2. Stored 'overdue' or expired dueAt → 'overdue'
 * 3. Otherwise → 'pending'
 */
export function computePaymentStatus(input: StatusInput): PaymentPanelStatus {
  if (input.storedStatus === 'paid') {
    return input.txHashValidated ? 'paid' : 'confirming'
  }
  if (input.storedStatus === 'overdue') return 'overdue'
  if (input.dueAt && input.dueAt * 1000 < Date.now()) return 'overdue'
  return 'pending'
}
