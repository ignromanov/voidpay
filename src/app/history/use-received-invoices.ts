'use client'

import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTrackedInvoiceStore, computeInvoiceStatus, type Invoice } from '@/entities/invoice'
import { parseInvoiceHash } from '@/features/invoice-codec'
import type { DecodedHistoryEntry } from '@/features/invoice-history'

/**
 * Page-local hook that decodes received invoices from TrackedInvoiceStore.
 *
 * Lives in app layer because it composes features/invoice-codec + entities/invoice
 * (cross-feature import only allowed at app layer per FSD).
 */
export function useReceivedInvoices(): DecodedHistoryEntry[] {
  const receivedTracked = useTrackedInvoiceStore(
    useShallow((s) => s.invoices.filter((t) => t.source === 'received')),
  )

  const [decoded, setDecoded] = useState<DecodedHistoryEntry[]>([])
  const invoiceCacheRef = useRef<Map<string, Invoice | null>>(new Map())

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const results = await Promise.all(
        receivedTracked.map(async (tracked) => {
          let invoice: Invoice | null
          if (invoiceCacheRef.current.has(tracked.invoiceUrl)) {
            invoice = invoiceCacheRef.current.get(tracked.invoiceUrl) ?? null
          } else {
            const hash = tracked.invoiceUrl.split('#')[1] ?? ''
            const result = await parseInvoiceHash(hash)
            invoice = result.success ? result.data : null
            invoiceCacheRef.current.set(tracked.invoiceUrl, invoice)
          }
          return {
            tracked,
            invoice,
            status: computeInvoiceStatus({
              tracked,
              dueAt: invoice ? invoice.dueAt : undefined,
            }),
          }
        }),
      )
      if (!cancelled) {
        setDecoded(results)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [receivedTracked])

  return decoded
}
