import type { Invoice, ConfirmationProgress } from '@/shared/lib/invoice-types'
import type { InvoiceStatus, InvoiceSource } from '@/entities/invoice'
import type { ReactNode } from 'react'

/**
 * Re-export canonical status types with widget-level aliases.
 */
export type PaymentPanelStatus = InvoiceStatus
export type StatusInput = import('@/entities/invoice').InvoiceStatusInput

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
  /** Invoice source: created by or received by user */
  source?: InvoiceSource | undefined
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
