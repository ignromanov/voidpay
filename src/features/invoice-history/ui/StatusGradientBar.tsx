import { cn } from '@/shared/lib/utils'
import type { InvoiceStatus } from '@/entities/invoice'

const STATUS_GRADIENTS: Record<InvoiceStatus, string> = {
  pending: 'from-amber-500 to-yellow-500',
  confirming: 'from-blue-500 to-cyan-500',
  paid: 'from-emerald-500 to-green-500',
  overdue: 'from-red-500 to-orange-500',
}

interface StatusGradientBarProps {
  status: InvoiceStatus
  className?: string
}

export function StatusGradientBar({ status, className }: StatusGradientBarProps) {
  return (
    <div
      className={cn(
        'h-0.5 w-full bg-gradient-to-r',
        STATUS_GRADIENTS[status],
        className,
      )}
    />
  )
}
