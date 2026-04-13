import { isDueDatePassed } from '@/shared/lib/date-time'
import type { TrackedInvoice } from '../model/rich-invoice-store'

/**
 * Canonical invoice status type.
 * Derived from TrackedInvoice facts + time:
 *   'pending'    — awaiting payment
 *   'paid'       — payment validated on-chain
 *   'confirming' — tx detected, waiting for block confirmations
 *   'overdue'    — invoice expired
 */
export type InvoiceStatus = 'pending' | 'paid' | 'confirming' | 'overdue'

export interface InvoiceStatusInput {
  tracked?: TrackedInvoice | undefined
  dueAt?: number | undefined
}

/**
 * Derive invoice status from facts + time.
 * Priority: paid > confirming > overdue > pending
 */
export function computeInvoiceStatus(input: InvoiceStatusInput): InvoiceStatus {
  const { tracked, dueAt } = input

  // 1. txHash + (validated OR finalized) → paid (terminal, highest priority).
  // finalized implies paid: setFinalized requires txHashValidated=true at write
  // time, so finalized=true is strictly stronger than txHashValidated=true.
  if (tracked?.txHash && (tracked.txHashValidated || tracked.finalized)) return 'paid'

  // 2. txHash + not validated → confirming
  if (tracked?.txHash) return 'confirming'

  // 3. Due date passed (end-of-day UTC) → overdue
  if (dueAt != null && isDueDatePassed(dueAt)) return 'overdue'

  // 4. Default
  return 'pending'
}
