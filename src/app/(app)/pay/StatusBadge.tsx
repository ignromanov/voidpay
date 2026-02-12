import { cn } from '@/shared/lib/utils'
import type { PaymentPanelStatus } from '@/widgets/payment-panel'

const BADGE_STYLES: Record<PaymentPanelStatus, { label: string; badge: string; dot: string }> = {
  pending: {
    label: 'Payment Pending',
    badge: 'border-amber-500/40 bg-amber-950/80 text-amber-200 shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]',
    dot: 'bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-pulse',
  },
  confirming: {
    label: 'Confirming Payment',
    badge: 'border-blue-500/40 bg-blue-950/80 text-blue-200 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]',
    dot: 'bg-blue-400 shadow-[0_0_12px_#60a5fa] animate-pulse',
  },
  paid: {
    label: 'Finalized & Paid',
    badge: 'border-emerald-500/50 bg-emerald-950/80 text-emerald-200 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]',
    dot: 'bg-emerald-400 shadow-[0_0_12px_#34d399]',
  },
  overdue: {
    label: 'Overdue',
    badge: 'border-red-500/40 bg-red-950/80 text-red-200 shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)]',
    dot: 'bg-red-400 shadow-[0_0_12px_#f87171]',
  },
}

interface StatusBadgeProps {
  status: PaymentPanelStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = BADGE_STYLES[status]

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
      <span
        data-testid="status-badge"
        className={cn(
          'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md',
          config.badge,
        )}
      >
        <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', config.dot)} />
        {config.label}
      </span>
    </div>
  )
}
