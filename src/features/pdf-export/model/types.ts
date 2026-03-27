/** Status variants for PDF watermark */
export type PdfInvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue'

/** Options for PDF export */
export interface PdfExportOptions {
  /** Invoice status — determines watermark text */
  status?: PdfInvoiceStatus | undefined
  /** Transaction hash (shown in footer when paid) */
  txHash?: string | undefined
  /** Full invoice URL for QR code in header */
  invoiceUrl?: string | undefined
  /** Payment timestamp — shown in watermark when paid */
  paidAt?: number | undefined
}
