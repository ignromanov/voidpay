'use client'

/**
 * Invoice History Page
 *
 * Displays all invoices from both stores:
 * - Created invoices (from useCreatorStore.history)
 * - Received invoices (from useTrackedInvoiceStore, source: 'received')
 */

import { useSearchParams } from 'next/navigation'
import { useCreatorStore } from '@/entities/creator'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { HistoryList, ReceivedInvoiceList } from '@/features/invoice-history'
import { useReceivedInvoices } from './use-received-invoices'

export default function HistoryPage() {
  const searchParams = useSearchParams()
  const debug =
    process.env.NODE_ENV === 'development' || searchParams.get('debug') === '1'

  const creatorHydrated = useCreatorStore.persist.hasHydrated()
  const trackedHydrated = useTrackedInvoiceStore.persist.hasHydrated()

  const createdCount = useCreatorStore((s) => s.history.length)
  const receivedInvoices = useReceivedInvoices()

  if (!creatorHydrated || !trackedHydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center p-8">
        <div className="w-full max-w-4xl">
          <div className="mb-8">
            <div className="mb-2 h-9 w-64 animate-pulse rounded bg-gray-800" />
            <div className="h-5 w-96 animate-pulse rounded bg-gray-800" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg border border-gray-700 bg-gray-800/50"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isEmpty = createdCount === 0 && receivedInvoices.length === 0

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-100">Invoice History</h1>
          <p className="text-gray-400">
            View and manage your created and received invoices.
          </p>
        </div>

        {isEmpty ? (
          <CombinedEmptyState />
        ) : (
          <div className="space-y-10">
            {/* Created Invoices */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Created</h2>
                <span className="text-sm text-gray-400">
                  {createdCount} invoice{createdCount !== 1 ? 's' : ''}
                </span>
              </div>
              <HistoryList debug={debug} />
            </section>

            {/* Received Invoices */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Received</h2>
                <span className="text-sm text-gray-400">
                  {receivedInvoices.length} invoice{receivedInvoices.length !== 1 ? 's' : ''}
                </span>
              </div>
              <ReceivedInvoiceList invoices={receivedInvoices} debug={debug} />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function CombinedEmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="mb-3 text-gray-400">
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
      <h3 className="mb-1 text-lg font-medium text-gray-200">No invoices yet</h3>
      <p className="text-sm text-gray-400">
        Invoices you create or receive via payment links will appear here.
      </p>
    </div>
  )
}
