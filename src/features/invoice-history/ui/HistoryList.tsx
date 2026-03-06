'use client'

/**
 * HistoryList Component
 *
 * Displays a chronological list of created invoices with preview information.
 * Allows users to view, duplicate, or delete history entries.
 */

import { useState, useMemo } from 'react'
import { useCreatorStore } from '@/entities/creator'
import {
  formatInvoiceTotal,
  useTrackedInvoiceStore,
  computeInvoiceStatus,
  type CreationHistoryEntry,
  type TrackedInvoice,
  type InvoiceStatus,
} from '@/entities/invoice'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { InvoiceCardShell } from './InvoiceCardShell'

interface HistoryListProps {
  debug?: boolean
  className?: string
}

export function HistoryList({ debug = false, className = '' }: HistoryListProps) {
  const history = useCreatorStore((s) => s.history)
  const deleteHistoryEntry = useCreatorStore((s) => s.deleteHistoryEntry)
  const duplicateHistoryEntry = useCreatorStore((s) => s.duplicateHistoryEntry)

  const trackedInvoices = useTrackedInvoiceStore((s) => s.invoices)
  const trackedMap = useMemo(
    () => new Map<string, TrackedInvoice>(trackedInvoices.map((inv) => [inv.invoiceId, inv])),
    [trackedInvoices],
  )

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = (entryId: string) => {
    deleteHistoryEntry(entryId)
    setDeleteConfirmId(null)
  }

  const handleDuplicate = (entryId: string) => {
    duplicateHistoryEntry(entryId)
  }

  const handleView = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank', 'noopener,noreferrer')
  }

  if (history.length === 0) {
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
        {history.map((entry) => {
          const tracked = trackedMap.get(entry.invoice.invoiceId)
          const status = computeInvoiceStatus({
            tracked,
            dueAt: entry.invoice.dueAt,
          })

          return (
            <HistoryEntryCard
              key={entry.entryId}
              entry={entry}
              status={status}
              tracked={tracked}
              debug={debug}
              onView={() => handleView(entry.invoiceUrl)}
              onDuplicate={() => handleDuplicate(entry.entryId)}
              onDelete={() => setDeleteConfirmId(entry.entryId)}
              isDeleteConfirming={deleteConfirmId === entry.entryId}
              onDeleteConfirm={() => handleDelete(entry.entryId)}
              onDeleteCancel={() => setDeleteConfirmId(null)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface HistoryEntryCardProps {
  entry: CreationHistoryEntry
  status: InvoiceStatus
  tracked?: TrackedInvoice | undefined
  debug: boolean
  onView: () => void
  onDuplicate: () => void
  onDelete: () => void
  isDeleteConfirming: boolean
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

function HistoryEntryCard({
  entry,
  status,
  tracked,
  debug,
  onView,
  onDuplicate,
  onDelete,
  isDeleteConfirming,
  onDeleteConfirm,
  onDeleteCancel,
}: HistoryEntryCardProps) {
  const [debugOpen, setDebugOpen] = useState(false)

  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <InvoiceCardShell>
      <div className="flex items-start justify-between gap-4">
        {/* Left: Invoice Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-100">
              {entry.invoice.invoiceId}
            </h3>
            <InvoiceStatusBadge status={status} />
          </div>
          <p className="mb-1 text-sm text-gray-300">{entry.invoice.client?.name ?? 'Unknown'}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="font-medium text-gray-300">{formatInvoiceTotal(entry.invoice)}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {!isDeleteConfirming ? (
            <>
              <button
                onClick={onView}
                className="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600"
                title="View Invoice"
              >
                View
              </button>
              <button
                onClick={onDuplicate}
                className="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600"
                title="Duplicate as Draft"
              >
                Duplicate
              </button>
              <button
                onClick={onDelete}
                className="rounded bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/30 hover:text-red-300"
                title="Delete Entry"
              >
                Delete
              </button>
              {debug && (
                <button
                  onClick={() => setDebugOpen((v) => !v)}
                  className="rounded bg-gray-700 px-2 py-1.5 text-xs font-mono text-gray-400 transition-colors hover:bg-gray-600"
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
                className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={onDeleteCancel}
                className="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {debug && debugOpen && (
        <pre className="mt-3 max-h-48 overflow-auto rounded bg-gray-900/80 p-3 text-xs text-gray-400">
          {JSON.stringify({ tracked, entryId: entry.entryId, txHash: entry.txHash }, null, 2)}
        </pre>
      )}
    </InvoiceCardShell>
  )
}
