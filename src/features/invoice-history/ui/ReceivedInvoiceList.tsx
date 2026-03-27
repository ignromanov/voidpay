'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatInvoiceTotal, useTrackedInvoiceStore } from '@/entities/invoice'
import { cn } from '@/shared/lib/utils'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { InvoiceCardShell } from './InvoiceCardShell'
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

  if (invoices.length === 0) {
    return (
      <p className={cn('py-12 text-center text-sm text-gray-500', className)}>
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
          onPay={() => {
            try {
              const hash = new URL(item.tracked.invoiceUrl).hash
              router.push(`/pay${hash}`)
            } catch {
              router.push(item.tracked.invoiceUrl)
            }
          }}
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
  onPay: () => void
  isDeleteConfirming: boolean
  onDelete: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

function ReceivedInvoiceCard({
  item,
  debug,
  onPay,
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
              <p className="mb-1 text-sm text-gray-300">
                {invoice.from?.name ?? 'Unknown sender'}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="truncate min-w-0">{formattedDate}</span>
                <span>•</span>
                <span className="font-medium text-gray-300">
                  {formatInvoiceTotal(invoice)}
                </span>
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
                onClick={onPay}
                className="min-h-[44px] cursor-pointer rounded bg-gray-700 px-3 py-2.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600"
                title="Open payment page"
                aria-label={`Pay invoice ${tracked.invoiceId}`}
              >
                Pay
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
}
