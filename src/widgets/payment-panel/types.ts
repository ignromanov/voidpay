import type { Invoice, ConfirmationProgress } from '@/shared/lib/invoice-types'
import type { ReactNode } from 'react'

/**
 * Visual status for the Payment Panel.
 * Derived from RichInvoiceStatus + txHashValidated:
 *   'pending'    — awaiting payment
 *   'paid'       — payment validated on-chain
 *   'confirming' — tx detected, waiting for block confirmations
 *   'overdue'    — invoice expired
 */
export type PaymentPanelStatus = 'pending' | 'paid' | 'confirming' | 'overdue'

// Re-export for consumers that import from this module
export type { ConfirmationProgress } from '@/shared/lib/invoice-types'

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
  /** Block confirmation progress (future: P0.12.3) */
  confirmations?: ConfirmationProgress
  /** Payment error message (from SmartPayButton) */
  error?: string
  /** Callback to dismiss error */
  onDismissError?: () => void
  /** Slot for SmartPayButton (P0.12.1) */
  children?: ReactNode
}
