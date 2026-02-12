'use client'

import { useState, useEffect, useCallback } from 'react'
import { useHashFragment } from '@/shared/lib/hooks'
import { parseInvoiceHash, mapParseErrorToDecodeType } from '@/features/invoice-codec'
import { useRichInvoiceStore, type RichInvoice } from '@/entities/invoice'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import { computePaymentStatus } from '@/widgets/payment-panel'
import type { PaymentPanelStatus } from '@/widgets/payment-panel'
import type { DecodeErrorType } from '@/shared/ui/decode-error-screen'
import type { Invoice } from '@/shared/lib/invoice-types'

/** Time to wait for hash fragment to stabilize after SSR hydration */
const HYDRATION_TIMEOUT = 200

export interface PayInvoiceState {
  invoice: Invoice | null
  errorType: DecodeErrorType | null
  isLoading: boolean
  storedInvoice: RichInvoice | undefined
  panelStatus: PaymentPanelStatus
  dismissError: () => void
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
  const { addInvoice, getInvoice, updateStatus, setError } = useRichInvoiceStore()

  const [isHydrated, setIsHydrated] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [errorType, setErrorType] = useState<DecodeErrorType | null>(null)

  // Read fresh store data on every render (no useMemo — getInvoice is a simple find)
  const storedInvoice = invoice ? getInvoice(invoice.invoiceId) : undefined

  const panelStatus = computePaymentStatus({
    storedStatus: storedInvoice?.status,
    txHashValidated: storedInvoice?.txHashValidated,
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
        if (!getInvoice(result.data.invoiceId)) {
          const invoiceUrl = `${window.location.origin}/pay#${hash}`
          const richInvoice: Omit<RichInvoice, 'createdAt'> = {
            invoiceId: result.data.invoiceId,
            invoiceUrl,
            data: result.data,
            status: 'pending',
            viewedAt: new Date().toISOString(),
          }
          addInvoice(richInvoice)
        }
      } catch (error) {
        console.error('[usePayInvoice] Failed to track invoice view:', error)
      }
    } else {
      setInvoice(null)
      setErrorType(mapParseErrorToDecodeType(result.error.message))
    }
  }, [hash, isHydrated, addInvoice, getInvoice])

  // 3. Sync network theme for background
  useEffect(() => {
    if (invoice?.networkId) {
      setNetworkTheme(getNetworkTheme(invoice.networkId))
    }
  }, [invoice?.networkId, setNetworkTheme])

  const storedStatus = storedInvoice?.status

  // 4. Sync overdue status to store
  useEffect(() => {
    if (!invoice || !storedStatus) return
    if (panelStatus === 'overdue' && storedStatus !== 'overdue') {
      updateStatus(invoice.invoiceId, 'overdue')
    }
  }, [invoice, panelStatus, storedStatus, updateStatus])

  const dismissError = useCallback(() => {
    if (invoice) setError(invoice.invoiceId, null)
  }, [invoice, setError])

  const isLoading = !invoice && !errorType

  return { invoice, errorType, isLoading, storedInvoice, panelStatus, dismissError }
}
