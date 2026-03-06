import React, { useCallback } from 'react'
import { Badge } from '@/shared/ui/badge'
import { CopyButton } from '@/shared/ui/copy-button'
import { cn } from '@/shared/lib/utils'
import { formatDateUTC } from '@/shared/lib/date-time'

import { InvoiceStatus, InvoicePaperVariant } from '../types'
import { PAPER_STATUS_CONFIG, type PaperStatusKey } from '../lib/paper-status-config'

interface PaperHeaderProps {
  invoiceId?: string | undefined
  iss?: number | undefined
  due?: number | undefined
  status?: InvoiceStatus | undefined
  /** Whether payment transaction has been validated on-chain */
  txHashValidated?: boolean | undefined
  /** Invoice URL for sharing (enables link functionality when variant is 'full') */
  invoiceUrl?: string | undefined
  /** Display variant - 'full' enables interactive elements */
  variant?: InvoicePaperVariant | undefined
}


export const PaperHeader = React.memo<PaperHeaderProps>(
  ({ invoiceId, iss, due, status, txHashValidated = true, invoiceUrl, variant = 'default' }) => {
    const isInteractive = variant === 'full'
    const hasLink = isInteractive && invoiceUrl

    // Determine if paid status shows unverified warning
    const isPaidUnverified = status === 'paid' && !txHashValidated

    const handleTitleClick = useCallback(() => {
      if (hasLink) {
        window.open(invoiceUrl, '_blank', 'noopener,noreferrer')
      }
    }, [hasLink, invoiceUrl])

    return (
      <header className="relative flex items-start justify-between gap-4 border-b-2 border-zinc-700 pb-6">
        {/* Large INVOICE title with ID - Left */}
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="flex items-center gap-1.5 text-4xl leading-none font-black tracking-tighter whitespace-nowrap text-zinc-400 uppercase">
            <span>Invoice</span>
            {invoiceId ? (
              <span
                onClick={hasLink ? handleTitleClick : undefined}
                onKeyDown={hasLink ? (e) => e.key === 'Enter' && handleTitleClick() : undefined}
                role={hasLink ? 'link' : undefined}
                tabIndex={hasLink ? 0 : undefined}
                title={hasLink ? 'Click to open invoice in new tab' : undefined}
                className={cn(
                  'transition-colors',
                  hasLink ? '!cursor-pointer text-zinc-800 hover:text-violet-600' : 'text-zinc-900'
                )}
              >
                #{invoiceId}
              </span>
            ) : (
              <span className="text-zinc-300 italic">Draft</span>
            )}
          </h1>
          {hasLink && (
            <CopyButton
              value={invoiceUrl}
              size="sm"
              className="flex-shrink-0"
              data-print-hide
              aria-label="Copy invoice URL"
            />
          )}
        </div>

        {/* Invoice meta - Right */}
        <div className="flex-shrink-0 space-y-2 text-right">
          <div className="flex justify-end gap-4 text-sm">
            <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              Issued
            </span>
            <span className={cn('font-mono font-medium', !iss && 'text-zinc-300 italic')}>
              {iss ? formatDateUTC(iss) : 'Date'}
            </span>
          </div>
          <div className="flex justify-end gap-4 text-sm">
            <span className="pt-0.5 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              Due
            </span>
            <span className={cn('font-mono font-medium', !due && 'text-zinc-300 italic')}>
              {due ? formatDateUTC(due) : 'Date'}
            </span>
          </div>
          {status && (
            <div className="flex items-center justify-end gap-4 pt-1">
              <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Status
              </span>
              <span>
                {(() => {
                  const statusKey: PaperStatusKey = isPaidUnverified ? 'paid-unverified' : status
                  const config = PAPER_STATUS_CONFIG[statusKey]
                  const StatusIcon = config.icon
                  return (
                    <Badge
                      variant="outline"
                      className={cn('gap-1 uppercase', config.badge)}
                      aria-label={`Invoice status: ${config.label}`}
                    >
                      <StatusIcon className="h-3 w-3" aria-hidden="true" />
                      {config.label}
                    </Badge>
                  )
                })()}
              </span>
            </div>
          )}
        </div>
      </header>
    )
  }
)

PaperHeader.displayName = 'PaperHeader'
