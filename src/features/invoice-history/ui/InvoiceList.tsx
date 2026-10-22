'use client'

import { useState, useCallback } from 'react'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { navigateToHashUrl } from '@/shared/lib/navigation'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import type { DecodedHistoryEntry } from '../lib/types'
import { InvoiceCard } from './InvoiceCard'

type InvoiceListVariant = 'created' | 'received'

const VARIANT_CONFIG: Record<InvoiceListVariant, {
  viewRoute: string
  nameExtractor: (entry: DecodedHistoryEntry) => string
  emptyText: string
}> = {
  created: {
    viewRoute: '/invoice',
    nameExtractor: (e) => e.invoice?.client?.name ?? 'Unknown',
    emptyText: 'Your created invoices will appear here for easy access and duplication.',
  },
  received: {
    viewRoute: '/pay',
    nameExtractor: (e) => e.invoice?.from?.name ?? 'Unknown sender',
    emptyText: 'Invoices you open via payment links will appear here.',
  },
}

interface InvoiceListProps {
  entries: DecodedHistoryEntry[]
  variant: InvoiceListVariant
  debug?: boolean
  className?: string
}

export function InvoiceList({ entries, variant, debug = false, className }: InvoiceListProps) {
  const removeInvoice = useTrackedInvoiceStore((s) => s.removeInvoice)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const config = VARIANT_CONFIG[variant]

  const handleDelete = (contentHash: string) => {
    removeInvoice(contentHash)
    setDeleteConfirmId(null)
  }

  const handleTemplate = useCallback((invoiceUrl: string) => {
    try {
      const hash = new URL(invoiceUrl).hash
      if (!hash || hash === '#') {
        toast.error('Could not extract invoice data')
        return
      }
      navigateToHashUrl(`/create?template=1${hash}`)
    } catch {
      toast.error('Invalid invoice URL')
    }
  }, [])

  const handleView = useCallback((invoiceUrl: string) => {
    try {
      const hash = new URL(invoiceUrl).hash
      navigateToHashUrl(`${config.viewRoute}${hash}`)
    } catch {
      navigateToHashUrl(config.viewRoute)
    }
  }, [config.viewRoute])

  if (entries.length === 0) {
    return (
      <p className={cn('py-12 text-center text-sm text-zinc-500', className)}>
        {config.emptyText}
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {entries.map((entry) => (
        <InvoiceCard
          key={entry.tracked.contentHash}
          tracked={entry.tracked}
          invoice={entry.invoice}
          status={entry.status}
          debug={debug}
          nameLabel={config.nameExtractor(entry)}
          onView={() => handleView(entry.tracked.invoiceUrl)}
          onTemplate={() => handleTemplate(entry.tracked.invoiceUrl)}
          onDelete={() => setDeleteConfirmId(entry.tracked.contentHash)}
          isDeleteConfirming={deleteConfirmId === entry.tracked.contentHash}
          onDeleteConfirm={() => handleDelete(entry.tracked.contentHash)}
          onDeleteCancel={() => setDeleteConfirmId(null)}
        />
      ))}
    </div>
  )
}
