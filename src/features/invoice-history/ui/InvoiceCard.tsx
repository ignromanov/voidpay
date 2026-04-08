'use client'

import { useState } from 'react'
import {
  computeAmounts,
  type TrackedInvoice,
  type Invoice,
  type InvoiceStatus,
} from '@/entities/invoice'
import { formatAmount } from '@/shared/lib/amount-utils'
import { formatDateMedium, formatDateCompact, isoToUnix } from '@/shared/lib/date-time'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { InvoiceCardShell } from './InvoiceCardShell'
import { NetworkBadge } from './NetworkBadge'

export interface InvoiceCardProps {
  tracked: TrackedInvoice
  invoice: Invoice | null
  status: InvoiceStatus
  debug: boolean
  nameLabel: string
  onView: () => void
  onTemplate: () => void
  onDelete: () => void
  isDeleteConfirming: boolean
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export function InvoiceCard({
  tracked,
  invoice,
  status,
  debug,
  nameLabel,
  onView,
  onTemplate,
  onDelete,
  isDeleteConfirming,
  onDeleteConfirm,
  onDeleteCancel,
}: InvoiceCardProps) {
  const [debugOpen, setDebugOpen] = useState(false)

  const formattedDate = formatDateMedium(isoToUnix(tracked.createdAt))
  const formattedDueDate = invoice?.dueAt ? formatDateCompact(invoice.dueAt) : null
  const formattedAmount = invoice
    ? formatAmount(computeAmounts(invoice).subtotal, invoice.decimals)
    : null

  return (
    <InvoiceCardShell status={status}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-zinc-100">
              {invoice?.invoiceId ?? tracked.invoiceId}
            </h3>
            <InvoiceStatusBadge status={status} />
            {invoice && <NetworkBadge networkId={invoice.networkId} />}
          </div>

          {invoice ? (
            <>
              <p className="mb-1 text-sm text-zinc-300">{nameLabel}</p>
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
}
