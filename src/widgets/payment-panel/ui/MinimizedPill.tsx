import { motion } from '@/shared/ui/motion'
import { CheckIcon, ClockIcon, ChevronUpIcon, XCircleIcon, ShieldCheckIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'
import type { PaymentPanelStatus } from '../types'

const PILL_CONFIG: Record<PaymentPanelStatus, {
  label: string
  borderClass: string
  iconBgClass: string
  iconClass: string
  icon: typeof CheckIcon
}> = {
  pending: {
    label: 'Waiting for Payment',
    borderClass: 'border-zinc-700 bg-zinc-900/90',
    iconBgClass: 'border-amber-500/30 bg-amber-500/20',
    iconClass: 'text-amber-400',
    icon: ClockIcon,
  },
  confirming: {
    label: 'Confirming Payment',
    borderClass: 'border-blue-500/30 bg-zinc-900/90 shadow-[0_0_20px_-10px_rgba(59,130,246,0.3)]',
    iconBgClass: 'border-blue-500/30 bg-blue-500/20',
    iconClass: 'text-blue-400',
    icon: ShieldCheckIcon,
  },
  paid: {
    label: 'Payment Successful',
    borderClass: 'border-emerald-500/30 bg-zinc-900/90 shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]',
    iconBgClass: 'border-emerald-500/30 bg-emerald-500/20',
    iconClass: 'text-emerald-400',
    icon: CheckIcon,
  },
  overdue: {
    label: 'Payment Overdue',
    borderClass: 'border-red-500/30 bg-zinc-900/90 shadow-[0_0_20px_-10px_rgba(239,68,68,0.3)]',
    iconBgClass: 'border-red-500/30 bg-red-500/20',
    iconClass: 'text-red-400',
    icon: XCircleIcon,
  },
}

interface MinimizedPillProps {
  status: PaymentPanelStatus
  onExpand: () => void
}

export function MinimizedPill({ status, onExpand }: MinimizedPillProps) {
  const config = PILL_CONFIG[status]
  const Icon = config.icon

  return (
    <motion.button
      key="minimized"
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      data-testid="payment-pill"
      onClick={onExpand}
      className={cn(
        'group mx-auto flex w-full max-w-sm cursor-pointer items-center justify-between rounded-full border p-2 shadow-2xl backdrop-blur-md transition-colors',
        config.borderClass,
      )}
    >
      <div className="flex items-center gap-3 pl-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border',
            config.iconBgClass,
          )}
        >
          <Icon size={16} className={config.iconClass} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-none text-white">
            {config.label}
          </span>
          <span className="mt-0.5 text-[10px] leading-none text-zinc-400">
            Click to expand details
          </span>
        </div>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 transition-colors group-hover:bg-zinc-700">
        <ChevronUpIcon size={16} className="text-zinc-400" />
      </div>
    </motion.button>
  )
}
