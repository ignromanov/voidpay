import { STATUS_CONFIG } from './status-config'
import type { PaymentPanelStatus } from '../types'

interface StatusChipProps {
  status: PaymentPanelStatus
}

export function StatusChip({ status }: StatusChipProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.chipColor}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  )
}
