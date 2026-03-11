'use client'

import { useState, useEffect } from 'react'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import { useInvoiceView } from '@/widgets/payment-panel'
import type { InvoiceViewState } from '@/widgets/payment-panel'

export interface PayInvoiceState extends InvoiceViewState {
  paymentError: string | null
  setPaymentError: (error: string | null) => void
}

/**
 * Orchestration hook for the /pay page.
 *
 * Composes useInvoiceView (shared observation logic) with:
 * - Network theme sync for background
 * - Payment error state for SmartPayButton
 */
export function usePayInvoice(): PayInvoiceState {
  const view = useInvoiceView({ source: 'received' })
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)

  // Sync network theme for background
  useEffect(() => {
    if (view.invoice?.networkId) {
      setNetworkTheme(getNetworkTheme(view.invoice.networkId))
    }
  }, [view.invoice?.networkId, setNetworkTheme])

  return { ...view, paymentError, setPaymentError }
}
