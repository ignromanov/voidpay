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
  const cacheRef = useRef<Map<string, { invoice: Invoice | null; status: InvoiceStatus }>>(
    new Map(),
  )

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const results = await Promise.all(
        createdTracked.map(async (tracked): Promise<DecodedCreatedEntry> => {
          const cached = cacheRef.current.get(tracked.invoiceUrl)
          if (cached) return { tracked, ...cached }

          try {
            const hash = tracked.invoiceUrl.split('#')[1] ?? ''
            if (!hash) {
              const entry = { invoice: null, status: computeInvoiceStatus({ tracked }) }
              cacheRef.current.set(tracked.invoiceUrl, entry)
              return { tracked, ...entry }
            }
            const result = await parseInvoiceHash(hash)
            if (result.success) {
              const status = computeInvoiceStatus({ tracked, dueAt: result.data.dueAt })
              const entry = { invoice: result.data, status }
              cacheRef.current.set(tracked.invoiceUrl, entry)
              return { tracked, ...entry }
            }
            const entry = { invoice: null, status: computeInvoiceStatus({ tracked }) }
            cacheRef.current.set(tracked.invoiceUrl, entry)
            return { tracked, ...entry }
          } catch {
            const entry = { invoice: null, status: computeInvoiceStatus({ tracked }) }
            cacheRef.current.set(tracked.invoiceUrl, entry)
            return { tracked, ...entry }
          }
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
