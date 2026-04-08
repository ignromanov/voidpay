'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import {
  computeAmounts,
  useTrackedInvoiceStore,
  type TrackedInvoice,
  type Invoice,
  type InvoiceStatus,
} from '@/entities/invoice'
import { formatAmount } from '@/shared/lib/amount-utils'
import { toast } from '@/shared/lib/toast'
import { duplicateFromUrl } from '../lib/duplicate-invoice'
import type { DecodedHistoryEntry } from '../lib/types'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { InvoiceCardShell } from './InvoiceCardShell'
import { NetworkBadge } from './NetworkBadge'

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
        <HistoryEntryCard
          key={tracked.invoiceId}
          tracked={tracked}
          invoice={invoice}
          status={status}
          debug={debug}
          source="created"
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

interface HistoryEntryCardProps {
  tracked: TrackedInvoice
  invoice: Invoice | null
  status: InvoiceStatus
  debug: boolean
  source: 'created' | 'received'
  onView: () => void
  onTemplate: () => void
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
  onTemplate,
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
  })

  const formattedDueDate = invoice?.dueAt
    ? new Date(invoice.dueAt * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  const formattedAmount = useMemo(() => {
    if (!invoice) return null
    const { subtotal } = computeAmounts(invoice)
    return formatAmount(subtotal, invoice.decimals)
  }, [invoice])

  return (
    <InvoiceCardShell status={status}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        {/* Left: Invoice Info */}
        <div className="min-w-0 flex-1">
          {/* Row 1: ID + Status + Network */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-zinc-100">
              {invoice?.invoiceId ?? tracked.invoiceId}
            </h3>
            <InvoiceStatusBadge status={status} />
            {invoice && <NetworkBadge networkId={invoice.networkId} />}
          </div>

          {invoice ? (
            <>
              {/* Row 2: Client name */}
              <p className="mb-1 text-sm text-zinc-300">
                {invoice.client?.name ?? 'Unknown'}
              </p>
              {/* Row 3: Date · Due · Amount */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
                <span>{formattedDate}</span>
                {formattedDueDate && (
                  <>
                    <span>·</span>
                    <span>Due {formattedDueDate}</span>
                  </>
                )}
                <span>·</span>
                <span className="font-mono font-medium text-violet-400">
                  {formattedAmount} {invoice.currency}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Unable to decode invoice data</p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {!isDeleteConfirming ? (
            <>
              <button
                onClick={onView}
                className="min-h-[44px] cursor-pointer rounded-lg bg-violet-600/20 px-3 py-2.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-600/30"
                aria-label={`View invoice ${tracked.invoiceId}`}
              >
                View
              </button>
              <button
                onClick={onTemplate}
                className="min-h-[44px] cursor-pointer rounded-lg bg-zinc-800 px-3 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700"
                aria-label={`Use invoice ${tracked.invoiceId} as template`}
              >
                Template
              </button>
              <button
                onClick={onDelete}
                className="min-h-[44px] cursor-pointer rounded-lg bg-red-900/20 px-3 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/30"
                aria-label={`Delete invoice ${tracked.invoiceId}`}
              >
                Delete
              </button>
              {debug && (
                <button
                  onClick={() => setDebugOpen((v) => !v)}
                  className="cursor-pointer rounded-lg bg-zinc-800 px-2 py-1.5 font-mono text-xs text-zinc-500 transition-colors hover:bg-zinc-700"
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
                className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={onDeleteCancel}
                className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {debug && debugOpen && (
        <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-zinc-950/80 p-3 text-xs text-zinc-500">
          {JSON.stringify({ tracked, decodeSuccess: invoice !== null }, null, 2)}
        </pre>
      )}
    </InvoiceCardShell>
  )
})
