import React from 'react'
import { InvoiceStatus } from '../types'

interface WatermarkProps {
  status: InvoiceStatus
  date?: string | undefined
}

export const Watermark = React.memo<WatermarkProps>(({ status, date }) => {
  if (status === 'pending') return null

  const config = {
    paid: {
      text: 'PAID',
      color: 'text-emerald-600',
      border: 'border-emerald-600',
      dateColor: 'text-emerald-700',
    },
    overdue: {
      text: 'OVERDUE',
      color: 'text-rose-600',
      border: 'border-rose-600',
      dateColor: 'text-rose-700',
    },
    draft: {
      text: 'DRAFT',
      color: 'text-zinc-400',
      border: 'border-zinc-400',
      dateColor: 'text-zinc-500',
    },
  }[status] || {
    text: 'DRAFT',
    color: 'text-zinc-400',
    border: 'border-zinc-400',
    dateColor: 'text-zinc-500',
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden select-none">
      <div
        className={`flex -rotate-12 flex-col items-center justify-center rounded-xl border-[8px] p-6 opacity-15 mix-blend-multiply ${config.border} ${config.color}`}
      >
        <span className="mb-2 font-mono text-7xl leading-none font-black tracking-widest">
          {config.text}
        </span>
        {date && status === 'paid' && (
          <span
            className={`border-t-2 pt-1 font-mono text-xl font-bold tracking-wider ${config.border} ${config.dateColor}`}
          >
            {date}
          </span>
        )}
      </div>
    </div>
  )
})

Watermark.displayName = 'Watermark'
