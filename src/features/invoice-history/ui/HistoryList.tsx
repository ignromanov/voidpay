'use client'

/**
 * HistoryList Component
 *
 * Displays a chronological list of created invoices with preview information.
 * Allows users to view, duplicate, or delete history entries.
 */

import { useState } from 'react'
import { useCreatorStore } from '@/entities/creator/model/useCreatorStore'
import type { CreationHistoryEntry } from '@/entities/invoice/model/types'

interface HistoryListProps {
  /** Optional CSS class name */
  className?: string
}

export function HistoryList({ className = '' }: HistoryListProps) {
  const history = useCreatorStore((s) => s.history)
  const deleteHistoryEntry = useCreatorStore((s) => s.deleteHistoryEntry)
  const duplicateHistoryEntry = useCreatorStore((s) => s.duplicateHistoryEntry)

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = (entryId: string) => {
    deleteHistoryEntry(entryId)
    setDeleteConfirmId(null)
  }

  const handleDuplicate = (entryId: string) => {
    duplicateHistoryEntry(entryId)
    // Optionally navigate to /create page
    // router.push('/create')
  }

  const handleView = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank', 'noopener,noreferrer')
  }

  if (history.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-2">
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
        <h3 className="text-lg font-medium text-gray-200 mb-1">No invoices created yet</h3>
        <p className="text-sm text-gray-400">
          Your created invoices will appear here for easy access and duplication.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-100">Creation History</h2>
        <span className="text-sm text-gray-400">{history.length} invoice{history.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {history.map((entry) => (
          <HistoryEntryCard
            key={entry.entryId}
            entry={entry}
            onView={() => handleView(entry.invoiceUrl)}
            onDuplicate={() => handleDuplicate(entry.entryId)}
            onDelete={() => setDeleteConfirmId(entry.entryId)}
            isDeleteConfirming={deleteConfirmId === entry.entryId}
            onDeleteConfirm={() => handleDelete(entry.entryId)}
            onDeleteCancel={() => setDeleteConfirmId(null)}
          />
        ))}
      </div>
    </div>
  )
}

interface HistoryEntryCardProps {
  entry: CreationHistoryEntry
  onView: () => void
  onDuplicate: () => void
  onDelete: () => void
  isDeleteConfirming: boolean
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

function HistoryEntryCard({
  entry,
  onView,
  onDuplicate,
  onDelete,
  isDeleteConfirming,
  onDeleteConfirm,
  onDeleteCancel,
}: HistoryEntryCardProps) {
  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Invoice Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-100 truncate">{entry.invoiceId}</h3>
            {entry.txHash && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
                Paid
              </span>
            )}
          </div>
          <p className="text-sm text-gray-300 mb-1">{entry.recipientName}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="font-medium text-gray-300">{entry.totalAmount}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {!isDeleteConfirming ? (
            <>
              <button
                onClick={onView}
                className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                title="View Invoice"
              >
                View
              </button>
              <button
                onClick={onDuplicate}
                className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                title="Duplicate as Draft"
              >
                Duplicate
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 rounded transition-colors"
                title="Delete Entry"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onDeleteConfirm}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={onDeleteCancel}
                className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
