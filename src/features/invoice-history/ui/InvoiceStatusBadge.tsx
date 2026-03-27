import { cn } from '@/shared/lib/utils'
import type { InvoiceStatus } from '@/entities/invoice'

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'border-amber-700/50 bg-amber-900/30 text-amber-400',
  },
  confirming: {
    label: 'Confirming',
    className: 'border-blue-700/50 bg-blue-900/30 text-blue-400',
  },
  paid: {
    label: 'Paid',
    className: 'border-green-700/50 bg-green-900/30 text-green-400',
  },
  overdue: {
    label: 'Overdue',
    className: 'border-red-700/50 bg-red-900/30 text-red-400',
  },
}

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-xs font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}
