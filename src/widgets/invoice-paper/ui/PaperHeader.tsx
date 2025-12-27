import React from 'react'
import { InvoiceSchemaV1 } from '@/entities/invoice'
import { Badge } from '@/shared/ui/badge'
import { HyperText } from '@/shared/ui/hyper-text'

import { InvoiceStatus } from '../types'

interface PaperHeaderProps {
  from: InvoiceSchemaV1['f']
  invoiceId: string
  iss: number
  due: number
  status?: InvoiceStatus | undefined
  animated?: boolean | undefined
}

export const PaperHeader: React.FC<PaperHeaderProps> = ({
  from,
  invoiceId,
  iss,
  due,
  status,
  animated = true,
}) => {
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

  const AnimatedText = ({
    text,
    className = '',
  }: {
    text: string | undefined
    className?: string
  }) => {
    const str = text || ''
    if (animated && str) {
      return <HyperText text={str} className={className} />
    }
    return <span className={className}>{str}</span>
  }

  return (
    <header className="flex items-start justify-between border-b-2 border-zinc-900 pb-8">
      <div className="max-w-[50%] space-y-1">
        <h2 className="text-2xl font-bold tracking-tight break-words text-black">
          <AnimatedText text={from.n || 'Your Company Inc.'} />
        </h2>
        <div className="space-y-0.5 text-sm text-zinc-600">
          <p>{from.e}</p>
          {from.ph && <p>{from.ph}</p>}
          {from.ads && <p className="pt-1 whitespace-pre-line text-zinc-500">{from.ads}</p>}
        </div>
      </div>
      <div className="text-right">
        <div className="flex flex-col items-end gap-2">
          <h1 className="text-5xl leading-none font-black tracking-tighter text-zinc-200 uppercase select-none">
            Invoice
          </h1>
          {status && status !== 'pending' && (
            <Badge variant={status === 'paid' ? 'secondary' : 'outline'} className="uppercase">
              {status}
            </Badge>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <div className="flex justify-end gap-3 text-sm">
            <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              Invoice #
            </span>
            <span className="font-mono font-bold text-black">
              <AnimatedText text={invoiceId} />
            </span>
          </div>
          <div className="flex justify-end gap-3 text-sm">
            <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              Issued
            </span>
            <span className="font-mono font-medium">
              <AnimatedText text={formatDate(iss)} />
            </span>
          </div>
          <div className="flex justify-end gap-3 text-sm">
            <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              Due
            </span>
            <span className="font-mono font-medium">
              <AnimatedText text={formatDate(due)} />
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
