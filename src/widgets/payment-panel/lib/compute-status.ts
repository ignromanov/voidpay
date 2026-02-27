import type { TrackedInvoice } from '@/entities/invoice'
import { isDueDatePassed } from '@/shared/lib/date-time'

export type PaymentPanelStatus = 'pending' | 'paid' | 'confirming' | 'overdue'

export interface StatusInput {
  tracked?: TrackedInvoice | undefined
  dueAt?: number | undefined
}

/**
 * Derive payment status from facts + time.
 * Priority: paid > confirming > overdue > pending
 */
export function computePaymentStatus(input: StatusInput): PaymentPanelStatus {
  const { tracked, dueAt } = input

  // 1. txHash + validated → paid (terminal, highest priority)
  if (tracked?.txHash && tracked?.txHashValidated) return 'paid'

  // 2. txHash + not validated → confirming
  if (tracked?.txHash) return 'confirming'

  // 3. Due date passed (end-of-day UTC) → overdue
  if (dueAt != null && isDueDatePassed(dueAt)) return 'overdue'

  // 4. Default
  return 'pending'
}
