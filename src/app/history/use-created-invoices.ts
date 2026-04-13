'use client'

import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  useTrackedInvoiceStore,
  computeInvoiceStatus,
  type TrackedInvoice,
  type Invoice,
  type InvoiceStatus,
} from '@/entities/invoice'
import { parseInvoiceHash } from '@/features/invoice-codec'

export interface DecodedCreatedEntry {
  tracked: TrackedInvoice
  invoice: Invoice | null
  status: InvoiceStatus
}

export function useCreatedInvoices(): DecodedCreatedEntry[] {
  const createdTracked = useTrackedInvoiceStore(
    useShallow((s) => s.invoices.filter((inv) => inv.source === 'created')),
  )

  const [entries, setEntries] = useState<DecodedCreatedEntry[]>([])
  // Cache ONLY the immutable parsed invoice (URL hash is deterministic).
  // Status is derived from mutable `tracked` and must be recomputed each run,
  // otherwise Check Unpaid updates the store but the list keeps showing stale
  // 'pending' because the cached status was computed before txHash was set.
  const invoiceCacheRef = useRef<Map<string, Invoice | null>>(new Map())

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const results = await Promise.all(
        createdTracked.map(async (tracked): Promise<DecodedCreatedEntry> => {
          let invoice: Invoice | null
          if (invoiceCacheRef.current.has(tracked.invoiceUrl)) {
            invoice = invoiceCacheRef.current.get(tracked.invoiceUrl) ?? null
          } else {
            try {
              const hash = tracked.invoiceUrl.split('#')[1] ?? ''
              const result = hash ? await parseInvoiceHash(hash) : null
              invoice = result?.success ? result.data : null
            } catch {
              invoice = null
            }
            invoiceCacheRef.current.set(tracked.invoiceUrl, invoice)
          }

          const status = computeInvoiceStatus({
            tracked,
            dueAt: invoice?.dueAt,
          })
          return { tracked, invoice, status }
        }),
      )

      if (!cancelled) setEntries(results)
    })()

    return () => {
      cancelled = true
    }
  }, [createdTracked])

  return entries
}
