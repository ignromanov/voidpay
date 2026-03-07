import type { Invoice, ConfirmationProgress } from '@/shared/lib/invoice-types'
import type { InvoiceStatus, InvoiceSource } from '@/entities/invoice'
import type { PollingMode } from '@/features/payment'
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
  // US4: "I've paid" button
  /** Called when payer clicks "I've paid" to trigger manual payment check */
  onIvePaid?: () => void
  /** Current polling mode — controls PollingStatus display */
  pollingMode?: PollingMode
  // US6: "Check payment" button
  /** Called when payer clicks "Check payment" */
  onCheckPayment?: () => void
  /** Timestamp (ms) until which "Check payment" is on cooldown */
  cooldownUntil?: number
  // US8: "Watch for payment" toggle (creator side)
  /** Called when creator starts watching for payment */
  onStartWatching?: () => void
  /** Called when creator stops watching for payment */
  onStopWatching?: () => void
  // US9: "Verify by txHash" escape hatch
  /** Called when payer submits a txHash for manual verification */
  onVerifyTxHash?: (args: { txHash: string }) => void
}
