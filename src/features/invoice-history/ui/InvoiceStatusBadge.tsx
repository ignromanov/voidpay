import { cn } from '@/shared/lib/utils'
import type { InvoiceStatus } from '@/entities/invoice'

const BADGE_CONFIG: Record<InvoiceStatus, {
  label: string
  badge: string
  dot: string
  pulse: boolean
}> = {
  pending: {
    label: 'Pending',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    pulse: true,
  },
  confirming: {
    label: 'Confirming',
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    dot: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]',
    pulse: true,
  },
  paid: {
    label: 'Paid',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    pulse: false,
  },
  overdue: {
    label: 'Overdue',
    badge: 'border-red-500/30 bg-red-500/10 text-red-400',
    dot: 'bg-red-400 shadow-[0_0_8px_#f87171]',
    pulse: false,
  },
}

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = BADGE_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.badge,
      )}
    >
      <span
        data-testid="status-dot"
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          config.dot,
          config.pulse && 'motion-safe:animate-pulse',
        )}
      />
      {config.label}
    </span>
  )
}
