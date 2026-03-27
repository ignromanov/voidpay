import type { Invoice, InvoiceStatus, TrackedInvoice } from '@/entities/invoice'

export interface DecodedHistoryEntry {
  tracked: TrackedInvoice
  invoice: Invoice | null
  status: InvoiceStatus
}

export interface DecodedReceivedInvoice {
  tracked: TrackedInvoice
  invoice: Invoice | null
  status: InvoiceStatus
}
