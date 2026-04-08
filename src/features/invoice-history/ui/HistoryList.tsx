'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { toast } from '@/shared/lib/toast'
import { duplicateFromUrl } from '../lib/duplicate-invoice'
import type { DecodedHistoryEntry } from '../lib/types'
import { InvoiceCard } from './InvoiceCard'

interface HistoryListProps {
  entries: DecodedHistoryEntry[]
  debug: boolean
  className?: string
}

export function HistoryList({ entries, debug, className = '' }: HistoryListProps) {
  const router = useRouter()
  const removeInvoice = useTrackedInvoiceStore((s) => s.removeInvoice)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = (invoiceId: string) => {
    removeInvoice(invoiceId)
    setDeleteConfirmId(null)
  }

  const handleTemplate = useCallback(async (invoiceUrl: string) => {
    const draftId = await duplicateFromUrl(invoiceUrl)
    if (draftId) {
      router.push('/create')
      toast.success('Invoice duplicated as template')
    } else {
      toast.error('Could not decode invoice for duplication')
    }
  }, [router])

  const handleView = useCallback((invoiceUrl: string) => {
    try {
      const hash = new URL(invoiceUrl).hash as `#${string}`
      router.push(`/invoice${hash}`)
    } catch {
      router.push('/invoice')
    }
  }, [router])

  if (entries.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mb-2 text-zinc-500">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-medium text-zinc-200">No invoices created yet</h3>
        <p className="text-sm text-zinc-500">
          Your created invoices will appear here for easy access and duplication.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {entries.map(({ tracked, invoice, status }) => (
        <InvoiceCard
          key={tracked.invoiceId}
          tracked={tracked}
          invoice={invoice}
          status={status}
          debug={debug}
          nameLabel={invoice?.client?.name ?? 'Unknown'}
          onView={() => handleView(tracked.invoiceUrl)}
          onTemplate={() => handleTemplate(tracked.invoiceUrl)}
          onDelete={() => setDeleteConfirmId(tracked.invoiceId)}
          isDeleteConfirming={deleteConfirmId === tracked.invoiceId}
          onDeleteConfirm={() => handleDelete(tracked.invoiceId)}
          onDeleteCancel={() => setDeleteConfirmId(null)}
        />
      ))}
    </div>
  )
}
