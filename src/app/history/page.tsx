'use client'

/**
 * Invoice History Page
 *
 * Displays all invoices from both stores:
 * - Created invoices (from TrackedInvoiceStore, source: 'created')
 * - Received invoices (from TrackedInvoiceStore, source: 'received')
 */

import { Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { parseInvoiceHash } from '@/features/invoice-codec'
import { useBatchCheck } from '@/features/payment'
import type { DecodedBatchInvoice } from '@/features/payment'
import { track, AnalyticsEvent } from '@/features/analytics'
import { HistoryList, ReceivedInvoiceList } from '@/features/invoice-history'
import { Loader2Icon } from '@/shared/ui/icons'
import { useReceivedInvoices } from './use-received-invoices'

function HistorySkeleton() {
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

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistorySkeleton />}>
      <HistoryPageContent />
    </Suspense>
  )
}

async function decodeInvoiceUrl(url: string): Promise<DecodedBatchInvoice | null> {
  try {
    const hash = new URL(url).hash.slice(1)
    const result = await parseInvoiceHash(hash)
    if (!result.success) return null
    const inv = result.data
    return {
      toAddress: inv.from?.walletAddress ?? '',
      networkId: inv.networkId,
      ...(inv.tokenAddress ? { tokenAddress: inv.tokenAddress } : {}),
      total: inv.total ?? '0',
      issuedAt: inv.issuedAt,
    }
  } catch {
    return null
  }
}

function HistoryPageContent() {
  const searchParams = useSearchParams()
  const debug =
    process.env.NODE_ENV === 'development' || searchParams.get('debug') === '1'

  const trackedHydrated = useTrackedInvoiceStore.persist.hasHydrated()

  const createdCount = useTrackedInvoiceStore((s) =>
    s.invoices.filter((inv) => inv.source === 'created').length
  )
  const pendingCount = useTrackedInvoiceStore((s) =>
    s.invoices.filter((inv) => inv.source === 'created' && !inv.txHash).length
  )
  const receivedInvoices = useReceivedInvoices()

  const decode = useCallback(decodeInvoiceUrl, [])
  const { isChecking, progress, checkAll } = useBatchCheck({ decodeInvoiceUrl: decode })

  if (!trackedHydrated) {
    return <HistorySkeleton />
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
                <div className="flex items-center gap-3">
                  {pendingCount > 0 && (
                    <button
                      onClick={() => {
                        track(AnalyticsEvent.PAY_VERIFY, { method: 'history-batch' })
                        checkAll()
                      }}
                      disabled={isChecking}
                      className="flex items-center gap-1.5 rounded-lg bg-violet-600/20 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-600/30 disabled:opacity-50"
                    >
                      {isChecking ? (
                        <>
                          <Loader2Icon size={12} className="animate-spin" />
                          Checking {progress.checked}/{progress.total}...
                        </>
                      ) : (
                        <>Check Unpaid ({pendingCount})</>
                      )}
                    </button>
                  )}
                  <span className="text-sm text-gray-400">
                    {createdCount} invoice{createdCount !== 1 ? 's' : ''}
                  </span>
                </div>
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
