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
      color: 'text-emerald-500/20',
      border: 'border-emerald-500/20',
    },
    overdue: {
      text: 'OVERDUE',
      color: 'text-rose-500/20',
      border: 'border-rose-500/20',
    },
    draft: {
      text: 'DRAFT',
      color: 'text-zinc-500/10',
      border: 'border-zinc-500/10',
    },
  }[status] || {
    text: 'DRAFT',
    color: 'text-zinc-500/10',
    border: 'border-zinc-500/10',
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div
        className={`flex -rotate-12 flex-col items-center justify-center rounded-xl border-8 px-12 py-6 opacity-60 mix-blend-multiply ${config.border} ${config.color}`}
      >
        <span className="text-8xl font-black tracking-[0.2em]">{config.text}</span>
        {date && status === 'paid' && (
          <span className="mt-2 text-xl font-bold tracking-widest">{date}</span>
        )}
      </div>
    </div>
  )
})

Watermark.displayName = 'Watermark'
