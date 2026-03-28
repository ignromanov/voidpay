'use client'

import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTrackedInvoiceStore, computeInvoiceStatus } from '@/entities/invoice'
import { parseInvoiceHash } from '@/features/invoice-codec'
import type { DecodedReceivedInvoice } from '@/features/invoice-history'

/**
 * Page-local hook that decodes received invoices from TrackedInvoiceStore.
 *
 * Lives in app layer because it composes features/invoice-codec + entities/invoice
 * (cross-feature import only allowed at app layer per FSD).
 */
export function useReceivedInvoices(): DecodedReceivedInvoice[] {
  const receivedTracked = useTrackedInvoiceStore(
    useShallow((s) => s.invoices.filter((t) => t.source === 'received')),
  )

  const [decoded, setDecoded] = useState<DecodedReceivedInvoice[]>([])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const results = await Promise.all(
        receivedTracked.map(async (tracked) => {
          const hash = tracked.invoiceUrl.split('#')[1] ?? ''
          const result = await parseInvoiceHash(hash)
          return {
            tracked,
            invoice: result.success ? result.data : null,
            status: computeInvoiceStatus({
              tracked,
              dueAt: result.success ? result.data.dueAt : undefined,
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
