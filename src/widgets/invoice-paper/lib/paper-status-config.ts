import type { ComponentType, SVGProps } from 'react'

import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  Edit3Icon,
  AlertTriangleIcon,
} from '@/shared/ui/icons'
import type { InvoiceStatus } from '../types'

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>

interface WatermarkConfig {
  displayText: string
  color: string
  border: string
  dateColor: string
}

interface PaperStatusEntry {
  label: string
  badge: string
  icon: IconComponent
  watermark: WatermarkConfig | null
}

/** Visual status key — extends InvoiceStatus with 'paid-unverified' variant */
export type PaperStatusKey = InvoiceStatus | 'paid-unverified'

/**
 * Shared status configuration for the invoice paper context.
 * Consumed by PaperHeader (badge) and Watermark (overlay).
 *
 * Light-theme colors to match the white paper background.
 */
export const PAPER_STATUS_CONFIG: Record<PaperStatusKey, PaperStatusEntry> = {
  pending: {
    label: 'Awaiting Payment',
    badge: 'border-amber-300 bg-amber-50 text-amber-700',
    icon: ClockIcon,
    watermark: null,
  },
  paid: {
    label: 'Paid',
    badge: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    icon: CheckCircleIcon,
    watermark: {
      displayText: 'PAID',
      color: 'text-emerald-600',
      border: 'border-emerald-600',
      dateColor: 'text-emerald-700',
    },
  },
  'paid-unverified': {
    label: 'Paid (Unverified)',
    badge: 'border-amber-300 bg-amber-50 text-amber-700',
    icon: AlertTriangleIcon,
    watermark: {
      displayText: 'PAID',
      color: 'text-emerald-600',
      border: 'border-emerald-600',
      dateColor: 'text-emerald-700',
    },
  },
  overdue: {
    label: 'Overdue',
    badge: 'border-red-300 bg-red-50 text-red-700',
    icon: XCircleIcon,
    watermark: {
      displayText: 'OVERDUE',
      color: 'text-rose-600',
      border: 'border-rose-600',
      dateColor: 'text-rose-700',
    },
  },
  draft: {
    label: 'Draft',
    badge: 'border-zinc-300 bg-zinc-50 text-zinc-600',
    icon: Edit3Icon,
    watermark: {
      displayText: 'DRAFT',
      color: 'text-zinc-400',
      border: 'border-zinc-400',
      dateColor: 'text-zinc-500',
    },
  },
  empty: {
    label: 'Draft',
    badge: 'border-zinc-300 bg-zinc-50 text-zinc-600',
    icon: Edit3Icon,
    watermark: {
      displayText: 'PREVIEW',
      color: 'text-violet-500',
      border: 'border-violet-500',
      dateColor: 'text-violet-600',
    },
  },
}
