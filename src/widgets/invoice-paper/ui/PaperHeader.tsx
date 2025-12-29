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
    <header className="relative flex items-start justify-between gap-4 border-b-2 border-zinc-900 pb-6">
      {/* Large INVOICE title with ID - Left */}
      <h1 className="min-w-0 text-4xl leading-none font-black tracking-tighter whitespace-nowrap text-zinc-400 uppercase">
        Invoice {invoiceId && <span className="text-zinc-900">#{invoiceId}</span>}
      </h1>

      {/* Invoice meta - Right */}
      <div className="flex-shrink-0 space-y-2 text-right">
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
        {status && status !== 'pending' && (
          <div className="flex justify-end pt-1">
            <Badge
              variant={status === 'paid' ? 'secondary' : 'destructive'}
              className="uppercase"
              aria-label={`Invoice status: ${status}`}
            >
              {status}
            </Badge>
          </div>
        )}
      </div>
    </header>
  )
})

PaperHeader.displayName = 'PaperHeader'
