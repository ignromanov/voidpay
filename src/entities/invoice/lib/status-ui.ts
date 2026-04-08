import type { InvoiceStatus } from './compute-status'

interface StatusChipConfig {
  label: string
  chipColor: string
}

/**
 * Shared status chip colors for dark UI.
 * Consumed by InvoiceStatusBadge (features) and StatusChip (widgets).
 */
export const INVOICE_STATUS_CHIPS: Record<InvoiceStatus, StatusChipConfig> = {
  pending: {
    label: 'Pending',
    chipColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  confirming: {
    label: 'Confirming',
    chipColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  paid: {
    label: 'Paid',
    chipColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  overdue: {
    label: 'Overdue',
    chipColor: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
}
