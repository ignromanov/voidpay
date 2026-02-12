/**
 * ShareModal Widget Types
 *
 * Types for the share modal component used after invoice generation.
 */

import type { Invoice } from '@/shared/lib/invoice-types'

/** Active tab in the share modal */
export type ShareTab = 'link' | 'qr'

/** Props for the ShareModal component */
export interface ShareModalProps {
  /** Invoice URL to share */
  url: string
  /** Invoice data for display */
  invoice: Invoice
  /** Modal open state */
  open: boolean
  /** Close handler */
  onOpenChange: (open: boolean) => void
}

/** Internal state for ShareModal (transient, not persisted) */
export interface ShareModalState {
  /** Active tab in modal */
  activeTab: ShareTab
  /** Copy button success state */
  copied: boolean
}
