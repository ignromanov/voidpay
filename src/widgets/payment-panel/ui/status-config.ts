import type { ComponentType } from 'react'
import { ClockIcon, CheckIcon, XCircleIcon, ShieldCheckIcon } from '@/shared/ui/icons'
import type { IconProps } from '@/shared/ui/icons'
import { INVOICE_STATUS_CHIPS } from '@/entities/invoice'
import type { PaymentPanelStatus } from '../types'

interface StatusConfigEntry {
  label: string
  gradient: string
  chipColor: string
  icon: ComponentType<IconProps>
}

export const STATUS_CONFIG: Record<PaymentPanelStatus, StatusConfigEntry> = {
  pending: {
    ...INVOICE_STATUS_CHIPS.pending,
    gradient: 'from-violet-500 via-fuchsia-500 to-violet-500',
    icon: ClockIcon,
  },
  confirming: {
    ...INVOICE_STATUS_CHIPS.confirming,
    gradient: 'from-blue-500 via-cyan-400 to-blue-500',
    icon: ShieldCheckIcon,
  },
  paid: {
    ...INVOICE_STATUS_CHIPS.paid,
    gradient: 'from-emerald-500 via-emerald-400 to-emerald-500',
    icon: CheckIcon,
  },
  overdue: {
    ...INVOICE_STATUS_CHIPS.overdue,
    gradient: 'from-red-500 via-red-400 to-red-500',
    icon: XCircleIcon,
  },
}
