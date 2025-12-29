import React, { useCallback } from 'react'
import { Link as LinkIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { CopyButton } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

import { InvoiceStatus, InvoicePaperVariant } from '../types'

interface PaperHeaderProps {
  invoiceId: string
  iss: number
  due: number
  status?: InvoiceStatus | undefined
  /** Invoice URL for sharing (enables link functionality when variant is 'full') */
  invoiceUrl?: string | undefined
  /** Display variant - 'full' enables interactive elements */
  variant?: InvoicePaperVariant | undefined
}

export const PaperHeader = React.memo<PaperHeaderProps>(
  ({ invoiceId, iss, due, status, invoiceUrl, variant = 'default' }) => {
    const isInteractive = variant === 'full'
    const hasLink = isInteractive && invoiceUrl

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

    const handleTitleClick = useCallback(() => {
      if (hasLink) {
        window.open(invoiceUrl, '_blank', 'noopener,noreferrer')
      }
    }, [hasLink, invoiceUrl])

    return (
      <header className="relative flex items-start justify-between gap-4 border-b-2 border-zinc-900 pb-6">
        {/* Large INVOICE title with ID - Left */}
        <div className="flex min-w-0 items-center gap-2">
          <h1
            onClick={handleTitleClick}
            className={cn(
              'text-4xl leading-none font-black tracking-tighter whitespace-nowrap text-zinc-400 uppercase',
              hasLink && 'cursor-pointer transition-colors hover:text-zinc-500'
            )}
            role={hasLink ? 'link' : undefined}
            tabIndex={hasLink ? 0 : undefined}
            onKeyDown={hasLink ? (e) => e.key === 'Enter' && handleTitleClick() : undefined}
            title={hasLink ? 'Click to open invoice in new tab' : undefined}
          >
            Invoice {invoiceId && <span className="text-zinc-900">#{invoiceId}</span>}
            {hasLink && (
              <LinkIcon className="ml-2 inline-block h-5 w-5 text-zinc-400" aria-hidden="true" />
            )}
          </h1>
          {hasLink && <CopyButton value={invoiceUrl} size="sm" aria-label="Copy invoice URL" />}
        </div>

        {/* Invoice meta - Right */}
        <div className="flex-shrink-0 space-y-2 text-right">
          <div className="flex justify-end gap-4 text-sm">
            <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              Issued
            </span>
            <span className="min-w-[120px] text-right font-mono font-medium">
              {formatDate(iss)}
            </span>
          </div>
          <div className="flex justify-end gap-4 text-sm">
            <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              Due
            </span>
            <span className="min-w-[120px] text-right font-mono font-medium">
              {formatDate(due)}
            </span>
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
  }
)

PaperHeader.displayName = 'PaperHeader'
