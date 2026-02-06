import type { ComponentType } from 'react'
import { ClockIcon, CheckIcon, XCircleIcon } from '@/shared/ui/icons'
import type { IconProps } from '@/shared/ui/icons'
import type { PaymentPanelStatus } from '../types'

interface StatusConfigEntry {
  label: string
  gradient: string
  chipColor: string
  icon: ComponentType<IconProps>
}

export const STATUS_CONFIG: Record<PaymentPanelStatus, StatusConfigEntry> = {
  pending: {
    label: 'Pending',
    gradient: 'from-violet-500 via-fuchsia-500 to-violet-500',
    chipColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: ClockIcon,
  },
  paid: {
    label: 'Paid',
    gradient: 'from-emerald-500 via-emerald-400 to-emerald-500',
    chipColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckIcon,
  },
  overdue: {
    label: 'Overdue',
    gradient: 'from-red-500 via-red-400 to-red-500',
    chipColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: XCircleIcon,
  },
}
