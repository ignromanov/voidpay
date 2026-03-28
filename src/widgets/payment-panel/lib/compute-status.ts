/**
 * Re-export from canonical location in entities layer.
 * Widget-level aliases preserved for backward compatibility.
 */
export { computeInvoiceStatus as computePaymentStatus } from '@/entities/invoice'
export type {
  InvoiceStatus as PaymentPanelStatus,
  InvoiceStatusInput as StatusInput,
} from '@/entities/invoice'
