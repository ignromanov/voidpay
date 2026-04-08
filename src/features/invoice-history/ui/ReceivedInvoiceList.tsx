'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import { computeAmounts, useTrackedInvoiceStore } from '@/entities/invoice'
import type { TrackedInvoice, Invoice, InvoiceStatus } from '@/entities/invoice'
import { formatAmount } from '@/shared/lib/amount-utils'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { duplicateFromUrl } from '../lib/duplicate-invoice'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { InvoiceCardShell } from './InvoiceCardShell'
import { NetworkBadge } from './NetworkBadge'
import type { DecodedReceivedInvoice } from '../lib/types'

export type { DecodedReceivedInvoice }

interface ReceivedInvoiceListProps {
  invoices: DecodedReceivedInvoice[]
  debug?: boolean
  className?: string
}

export function ReceivedInvoiceList({ invoices, debug = false, className }: ReceivedInvoiceListProps) {
  const router = useRouter()
  const removeInvoice = useTrackedInvoiceStore((s) => s.removeInvoice)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleTemplate = useCallback(async (invoiceUrl: string) => {
    const draftId = await duplicateFromUrl(invoiceUrl)
    if (draftId) {
      router.push('/create')
      toast.success('Invoice duplicated as template')
    } else {
      toast.error('Could not decode invoice for duplication')
    }
  }, [router])

  if (invoices.length === 0) {
    return (
      <p className={cn('py-12 text-center text-sm text-zinc-500', className)}>
        Invoices you open via payment links will appear here.
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {invoices.map((item) => (
        <ReceivedInvoiceCard
          key={item.tracked.invoiceId}
          item={item}
          debug={debug}
          onView={() => {
            try {
              const hash = new URL(item.tracked.invoiceUrl).hash as `#${string}`
              router.push(`/pay${hash}`)
            } catch {
              router.push('/pay')
            }
          }}
          onTemplate={() => handleTemplate(item.tracked.invoiceUrl)}
          isDeleteConfirming={deleteConfirmId === item.tracked.invoiceId}
          onDelete={() => setDeleteConfirmId(item.tracked.invoiceId)}
          onDeleteConfirm={() => {
            removeInvoice(item.tracked.invoiceId)
            setDeleteConfirmId(null)
          }}
          onDeleteCancel={() => setDeleteConfirmId(null)}
        />
      ))}
    </div>
  )
}

interface ReceivedInvoiceCardProps {
  item: DecodedReceivedInvoice
  debug: boolean
  onView: () => void
  onTemplate: () => void
  isDeleteConfirming: boolean
  onDelete: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

const ReceivedInvoiceCard = memo(function ReceivedInvoiceCard({
  item,
  debug,
  onView,
  onTemplate,
  isDeleteConfirming,
  onDelete,
  onDeleteConfirm,
  onDeleteCancel,
}: ReceivedInvoiceCardProps) {
  const { tracked, invoice, status } = item
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
              {/* Row 2: From name */}
              <p className="mb-1 text-sm text-zinc-300">
                {invoice.from?.name ?? 'Unknown sender'}
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
