import { cn } from '@/shared/lib/utils'
import { INVOICE_STATUS_CHIPS, type InvoiceStatus } from '@/entities/invoice'

const DOT_CONFIG: Record<InvoiceStatus, { dot: string; pulse: boolean }> = {
  pending: { dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]', pulse: true },
  confirming: { dot: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]', pulse: true },
  paid: { dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]', pulse: false },
  overdue: { dot: 'bg-red-400 shadow-[0_0_8px_#f87171]', pulse: false },
}

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const chip = INVOICE_STATUS_CHIPS[status]
  const { dot, pulse } = DOT_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        chip.chipColor,
      )}
    >
      <span
        data-testid="status-dot"
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          dot,
          pulse && 'motion-safe:animate-pulse',
        )}
      />
      {chip.label}
    </span>
  )
}
