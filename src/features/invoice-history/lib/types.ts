import type { Invoice, InvoiceStatus, TrackedInvoice } from '@/entities/invoice'

export interface DecodedHistoryEntry {
  tracked: TrackedInvoice
  invoice: Invoice | null
  status: InvoiceStatus
}

/** @deprecated Use DecodedHistoryEntry — identical shape */
export type DecodedReceivedInvoice = DecodedHistoryEntry
