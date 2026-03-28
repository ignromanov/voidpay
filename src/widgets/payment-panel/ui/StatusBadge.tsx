import { cn } from '@/shared/lib/utils'
import { Loader2Icon } from '@/shared/ui/icons'
import type { InvoiceStatus } from '@/entities/invoice'

const BADGE_STYLES: Record<InvoiceStatus, { label: string; badge: string; dot: string }> = {
  pending: {
    label: 'Payment Pending',
    badge: 'border-amber-500/40 bg-amber-950/80 text-amber-200 shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]',
    dot: 'bg-amber-400 shadow-[0_0_12px_#fbbf24] motion-safe:animate-pulse',
  },
  confirming: {
    label: 'Confirming Payment',
    badge: 'border-blue-500/40 bg-blue-950/80 text-blue-200 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]',
    dot: 'bg-blue-400 shadow-[0_0_12px_#60a5fa] motion-safe:animate-pulse',
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
  status: InvoiceStatus
  isSyncing?: boolean
}

export function StatusBadge({ status, isSyncing = false }: StatusBadgeProps) {
  const config = BADGE_STYLES[status]

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center print:hidden">
      <span
        data-testid="status-badge"
        className={cn(
          'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md transition-all duration-300',
          isSyncing
            ? 'border-zinc-500/40 bg-zinc-950/80 text-zinc-300 shadow-[0_0_30px_-5px_rgba(161,161,170,0.3)]'
            : config.badge,
        )}
      >
        {isSyncing ? (
          <>
            <Loader2Icon size={10} className="mr-1.5 motion-safe:animate-spin" />
            Checking status...
          </>
        ) : (
          <>
            <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full transition-all duration-300', config.dot)} />
            {config.label}
          </>
        )}
      </span>
    </div>
  )
}
