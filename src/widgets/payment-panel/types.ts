import type { Invoice } from '@/shared/lib/invoice-types'
import type { ReactNode } from 'react'

/**
 * Visual status for the Payment Panel.
 * Subset of RichInvoiceStatus relevant to /pay page:
 *   'pending' | 'paid' | 'overdue'
 *   ('draft' | 'empty' → not applicable on /pay)
 */
export type PaymentPanelStatus = 'pending' | 'paid' | 'overdue'

/**
 * Block confirmation progress.
 * Provided by parent when payment is detected but not yet finalized.
 */
export interface ConfirmationProgress {
  /** Current number of confirmations */
  current: number
  /** Required confirmations for finality */
  required: number
}

/**
 * Props for the main PaymentPanel widget.
 */
export interface PaymentPanelProps {
  /** Full decoded invoice data */
  invoice: Invoice
  /** Computed status (parent determines overdue from dueAt) */
  status: PaymentPanelStatus
  /** Transaction hash when paid */
  txHash?: string
  /** Whether the txHash has been validated on-chain */
  txHashValidated?: boolean
  /** Block confirmation progress (future: P0.12.3) */
  confirmations?: ConfirmationProgress
  /** Payment error message (from SmartPayButton) */
  error?: string | null
  /** Callback to dismiss error */
  onDismissError?: () => void
  /** Slot for SmartPayButton (P0.12.1) */
  children?: ReactNode
}
