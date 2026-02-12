import React from 'react'
import { cn } from '@/shared/lib/utils'
import { InvoiceStatus } from '../types'
import { PAPER_STATUS_CONFIG } from '../lib/paper-status-config'

interface WatermarkProps {
  status: InvoiceStatus
  date?: string | undefined
}

export const Watermark = React.memo<WatermarkProps>(({ status, date }) => {
  const watermark = PAPER_STATUS_CONFIG[status].watermark
  if (!watermark) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden select-none">
      <div
        className={cn(
          'flex -rotate-12 flex-col items-center justify-center rounded-xl border-[8px] p-6 opacity-20 mix-blend-multiply print:opacity-40 print:mix-blend-normal',
          watermark.border,
          watermark.color
        )}
      >
        <span className="mb-2 font-mono text-7xl leading-none font-black tracking-widest">
          {watermark.displayText}
        </span>
        {date && status === 'paid' && (
          <span
            className={cn(
              'border-t-2 pt-1 font-mono text-xl font-bold tracking-wider',
              watermark.border,
              watermark.dateColor
            )}
          >
            {date}
          </span>
        )}
      </div>
    </div>
  )
})

Watermark.displayName = 'Watermark'
