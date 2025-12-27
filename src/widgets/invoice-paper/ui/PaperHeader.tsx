import React from 'react'
import { Badge } from '@/shared/ui/badge'

import { InvoiceStatus } from '../types'

interface PaperHeaderProps {
  invoiceId: string
  iss: number
  due: number
  status?: InvoiceStatus | undefined
}

export const PaperHeader = React.memo<PaperHeaderProps>(({ invoiceId, iss, due, status }) => {
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '---'
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
      .format(new Date(timestamp * 1000))
      .toUpperCase()
  }

  return (
    <header className="relative flex items-start justify-between border-b-2 border-zinc-900 pb-6">
      {/* Large INVOICE title - Left */}
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl leading-none font-black tracking-tighter text-zinc-400 uppercase">
          Invoice
        </h1>
        {status && status !== 'pending' && (
          <Badge
            variant={status === 'paid' ? 'secondary' : 'destructive'}
            className="w-fit uppercase"
            aria-label={`Invoice status: ${status}`}
          >
            {status}
          </Badge>
        )}
      </div>

      {/* Invoice meta - Right */}
      <div className="space-y-2 text-right">
        <div className="flex justify-end gap-4 text-sm">
          <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
            Invoice #
          </span>
          <span className="min-w-[120px] text-right font-mono font-bold text-black">
            {invoiceId || '---'}
          </span>
        </div>
        <div className="flex justify-end gap-4 text-sm">
          <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
            Issued
          </span>
          <span className="min-w-[120px] text-right font-mono font-medium">{formatDate(iss)}</span>
        </div>
        <div className="flex justify-end gap-4 text-sm">
          <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
            Due
          </span>
          <span className="min-w-[120px] text-right font-mono font-medium">{formatDate(due)}</span>
        </div>
      </div>
    </header>
  )
})

PaperHeader.displayName = 'PaperHeader'
