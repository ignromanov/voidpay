'use client'

import { useState, useEffect, useCallback } from 'react'
import { useHashFragment } from '@/shared/lib/hooks'
import { parseInvoiceHash, mapParseErrorToDecodeType } from '@/features/invoice-codec'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import { computePaymentStatus } from '@/widgets/payment-panel'
import { nowISO } from '@/shared/lib/date-time'
import { toast } from '@/shared/lib/toast'
import type { PaymentPanelStatus } from '@/widgets/payment-panel'
import type { DecodeErrorType } from '@/shared/ui/decode-error-screen'
import type { Invoice, ConfirmationProgress } from '@/shared/lib/invoice-types'
import type { InvoiceSource } from '@/entities/invoice'

/** Time to wait for hash fragment to stabilize after SSR hydration */
const HYDRATION_TIMEOUT = 200

export interface PayInvoiceState {
  invoice: Invoice | null
  errorType: DecodeErrorType | null
  isLoading: boolean
  panelStatus: PaymentPanelStatus
  source: InvoiceSource | undefined
  dismissError: () => void
  txHash: `0x${string}` | undefined
  confirmations: ConfirmationProgress | undefined
  storedError: string | null | undefined
}

/**
 * Orchestration hook for the /pay page.
 *
 * Composes lower-layer logic:
 * - Hash decoding via parseInvoiceHash (features/invoice-codec)
 * - Error mapping via mapParseErrorToDecodeType (features/invoice-codec)
 * - Status derivation via computePaymentStatus (widgets/payment-panel)
 *
 * Side effects (app-layer composition):
 * - Hydration timeout for SSR
 * - View history tracking in RichInvoiceStore
 * - Network theme syncing for background
 * - Overdue status sync back to store
 */
export function usePayInvoice(): PayInvoiceState {
  const hash = useHashFragment()
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)
  const addInvoice = useTrackedInvoiceStore((s) => s.addInvoice)
  const setError = useTrackedInvoiceStore((s) => s.setError)

  const [isHydrated, setIsHydrated] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [errorType, setErrorType] = useState<DecodeErrorType | null>(null)

  const tracked = useTrackedInvoiceStore((s) =>
    invoice ? s.invoices.find((inv) => inv.invoiceId === invoice.invoiceId) : undefined
  )

  const panelStatus = computePaymentStatus({
    tracked,
    dueAt: invoice?.dueAt,
  })

  // 1. Hydration detection: wait for hash to stabilize
  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), HYDRATION_TIMEOUT)
    return () => clearTimeout(timer)
  }, [])

  // 2. Decode hash + track view
  useEffect(() => {
    if (!isHydrated && hash === '') return

    if (hash === '') {
      setErrorType('EMPTY_HASH')
      setInvoice(null)
      return
    }

    const result = parseInvoiceHash(hash)

    if (result.success) {
      setInvoice(result.data)
      setErrorType(null)

      try {
        addInvoice({
          invoiceId: result.data.invoiceId,
          invoiceUrl: `${window.location.origin}/pay#${hash}`,
          source: 'received',
          viewedAt: nowISO(),
        })
      } catch (error) {
        console.error('[usePayInvoice] Failed to track invoice view:', error)
        toast.info('Could not save invoice to history. Your payment experience is unaffected.')
      }
    } else {
      setInvoice(null)
      setErrorType(mapParseErrorToDecodeType(result.error.message))
    }
  }, [hash, isHydrated, addInvoice])

  // 3. Sync network theme for background
  useEffect(() => {
    if (invoice?.networkId) {
      setNetworkTheme(getNetworkTheme(invoice.networkId))
    }
  }, [invoice?.networkId, setNetworkTheme])

  const dismissError = useCallback(() => {
    if (invoice) setError(invoice.invoiceId, null)
  }, [invoice, setError])

  const isLoading = !invoice && !errorType

  return {
    invoice,
    errorType,
    isLoading,
    panelStatus,
    source: tracked?.source,
    dismissError,
    txHash: tracked?.txHash,
    confirmations: tracked?.confirmations,
    storedError: tracked?.error,
  }
}
