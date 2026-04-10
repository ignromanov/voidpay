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
  /** Content hash for store lookups */
  contentHash: string
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
  // US4: "I've paid" toggle (payer side)
  /** Called when payer clicks "I've paid" to start aggressive polling */
  onIvePaid?: () => void
  /** Current polling mode — controls inline button states and PollingStatus */
  pollingMode?: PollingMode
  /** Called to stop any active polling (aggressive/manual/watching) */
  onStopPolling?: () => void
  // US6: "Check payment" button (creator side)
  /** Called when creator clicks "Check" for a single manual check */
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
  /** Whether the transaction has been finalized on-chain */
  finalized?: boolean
  /** Whether a chain reorg was detected */
  reorgDetected?: boolean
  /** Called to open the share modal (creator side — replaces QR in footer) */
  onShareOpen?: () => void
}
