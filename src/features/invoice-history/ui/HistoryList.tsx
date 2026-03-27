'use client'

import { useState, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import {
  formatInvoiceTotal,
  useTrackedInvoiceStore,
  type TrackedInvoice,
  type InvoiceStatus,
  type Invoice,
} from '@/entities/invoice'
import { toast } from '@/shared/lib/toast'
import { duplicateFromUrl } from '../lib/duplicate-invoice'
import type { DecodedHistoryEntry } from '../lib/types'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { InvoiceCardShell } from './InvoiceCardShell'

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

  const handleDuplicate = useCallback(async (invoiceUrl: string) => {
    const draftId = await duplicateFromUrl(invoiceUrl)
    if (draftId) {
      router.push('/create')
      toast.success('Invoice duplicated')
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
        <div className="mb-2 text-gray-400">
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
        <h3 className="mb-1 text-lg font-medium text-gray-200">No invoices created yet</h3>
        <p className="text-sm text-gray-400">
          Your created invoices will appear here for easy access and duplication.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        {entries.map(({ tracked, invoice, status }) => (
          <HistoryEntryCard
            key={tracked.invoiceId}
            tracked={tracked}
            invoice={invoice}
            status={status}
            debug={debug}
            onView={() => handleView(tracked.invoiceUrl)}
            onDuplicate={() => handleDuplicate(tracked.invoiceUrl)}
            onDelete={() => setDeleteConfirmId(tracked.invoiceId)}
            isDeleteConfirming={deleteConfirmId === tracked.invoiceId}
            onDeleteConfirm={() => handleDelete(tracked.invoiceId)}
            onDeleteCancel={() => setDeleteConfirmId(null)}
          />
        ))}
      </div>
    </div>
  )
}

interface HistoryEntryCardProps {
  tracked: TrackedInvoice
  invoice: Invoice | null
  status: InvoiceStatus
  debug: boolean
  onView: () => void
  onDuplicate: () => void
  onDelete: () => void
  isDeleteConfirming: boolean
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

const HistoryEntryCard = memo(function HistoryEntryCard({
  tracked,
  invoice,
  status,
  debug,
  onView,
  onDuplicate,
  onDelete,
  isDeleteConfirming,
  onDeleteConfirm,
  onDeleteCancel,
}: HistoryEntryCardProps) {
  const [debugOpen, setDebugOpen] = useState(false)

  const formattedDate = new Date(tracked.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <InvoiceCardShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        {/* Left: Invoice Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-100">
              {invoice?.invoiceId ?? tracked.invoiceId}
            </h3>
            <InvoiceStatusBadge status={status} />
          </div>

          {invoice ? (
            <>
              <p className="mb-1 text-sm text-gray-300">{invoice.client?.name ?? 'Unknown'}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="truncate min-w-0">{formattedDate}</span>
                <span>•</span>
                <span className="font-medium text-gray-300">{formatInvoiceTotal(invoice)}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Unable to decode invoice data</p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {!isDeleteConfirming ? (
            <>
              <button
                onClick={onView}
                className="min-h-[44px] cursor-pointer rounded bg-gray-700 px-3 py-2.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600"
                title="View Invoice"
                aria-label={`View invoice ${tracked.invoiceId}`}
              >
                View
              </button>
              <button
                onClick={onDuplicate}
                className="min-h-[44px] cursor-pointer rounded bg-gray-700 px-3 py-2.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600"
                title="Duplicate as Draft"
                aria-label={`Duplicate invoice ${tracked.invoiceId}`}
              >
                Duplicate
              </button>
              <button
                onClick={onDelete}
                className="min-h-[44px] cursor-pointer rounded bg-red-900/20 px-3 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/30 hover:text-red-300"
                title="Delete Entry"
                aria-label={`Delete invoice ${tracked.invoiceId}`}
              >
                Delete
              </button>
              {debug && (
                <button
                  onClick={() => setDebugOpen((v) => !v)}
                  className="cursor-pointer rounded bg-gray-700 px-2 py-1.5 text-xs font-mono text-gray-400 transition-colors hover:bg-gray-600"
                  title="Toggle debug info"
                >
                  {'</>'}
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onDeleteConfirm}
                className="cursor-pointer rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={onDeleteCancel}
                className="cursor-pointer rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {debug && debugOpen && (
        <pre className="mt-3 max-h-48 overflow-auto rounded bg-gray-900/80 p-3 text-xs text-gray-400">
          {JSON.stringify({ tracked, decodeSuccess: invoice !== null }, null, 2)}
        </pre>
      )}
    </InvoiceCardShell>
  )
})
