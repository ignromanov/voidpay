'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useHashFragment } from '@/shared/lib/hooks'
import { parseInvoiceHash, mapParseErrorToDecodeType } from '@/features/invoice-codec'
import { usePaymentPolling } from '@/features/payment'
import type { UsePaymentPollingResult } from '@/features/payment'
import { useTrackedInvoiceStore, computeInvoiceStatus } from '@/entities/invoice'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme, estimateFromBlockHex } from '@/entities/network'
import { computeAmounts } from '@/widgets/payment-panel'
import { nowISO } from '@/shared/lib/date-time'
import { toast } from '@/shared/lib/toast'
import type { InvoiceStatus } from '@/entities/invoice'
import type { DecodeErrorType } from '@/shared/ui/decode-error-screen'
import type { Invoice, ConfirmationProgress } from '@/shared/lib/invoice-types'
import type { InvoiceSource } from '@/entities/invoice'

/** Time to wait for hash fragment to stabilize after SSR hydration */
const HYDRATION_TIMEOUT = 200

export interface PayInvoiceState {
  invoice: Invoice | null
  errorType: DecodeErrorType | null
  isLoading: boolean
  panelStatus: InvoiceStatus
  source: InvoiceSource | undefined
  dismissError: () => void
  txHash: `0x${string}` | undefined
  confirmations: ConfirmationProgress | undefined
  storedError: string | null | undefined
  finalized: boolean
  exactTotal: string
  subtotal: string
  polling: UsePaymentPollingResult | null
  verifyTxHash: (args: { txHash: string }) => void
}

/**
 * Orchestration hook for the /pay page.
 *
 * Composes lower-layer logic:
 * - Hash decoding via parseInvoiceHash (features/invoice-codec)
 * - Error mapping via mapParseErrorToDecodeType (features/invoice-codec)
 * - Status derivation via computeInvoiceStatus (entities/invoice)
 * - Amount computation via computeAmounts (widgets/payment-panel)
 * - Payment discovery polling via usePaymentPolling (features/payment)
 *
 * Side effects (app-layer composition):
 * - Hydration timeout for SSR
 * - View history tracking in RichInvoiceStore
 * - Network theme syncing for background
 */
export function usePayInvoice(): PayInvoiceState {
  const hash = useHashFragment()
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)
  const addInvoice = useTrackedInvoiceStore((s) => s.addInvoice)
  const setError = useTrackedInvoiceStore((s) => s.setError)
  const setTxHash = useTrackedInvoiceStore((s) => s.setTxHash)

  const [isHydrated, setIsHydrated] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [errorType, setErrorType] = useState<DecodeErrorType | null>(null)

  const tracked = useTrackedInvoiceStore((s) =>
    invoice ? s.invoices.find((inv) => inv.invoiceId === invoice.invoiceId) : undefined
  )

  const panelStatus = computeInvoiceStatus({
    tracked,
    dueAt: invoice?.dueAt,
  })

  // Finalized state — centralized here instead of direct store read in component
  const finalized = useTrackedInvoiceStore((s) => {
    if (!invoice) return false
    const t = s.invoices.find((inv) => inv.invoiceId === invoice.invoiceId)
    return t?.finalized ?? false
  })

  // Amount computation — centralized here
  const amounts = useMemo(
    () => invoice ? computeAmounts(invoice) : { exactTotal: '0', subtotal: '0', magicDust: '0' },
    [invoice],
  )

  // Discovery polling — all params guaranteed valid when invoice exists
  const networkId = invoice?.networkId ?? 1
  const category: 'external' | 'erc20' = invoice?.tokenAddress ? 'erc20' : 'external'
  const fromBlock = useMemo(
    () => invoice ? estimateFromBlockHex(networkId, invoice.issuedAt) : '0x1',
    [networkId, invoice],
  )
  const polling = usePaymentPolling({
    invoiceId: invoice?.invoiceId ?? '',
    toAddress: invoice?.from?.walletAddress ?? '',
    chainId: networkId,
    ...(invoice?.tokenAddress ? { contractAddress: invoice.tokenAddress } : {}),
    category,
    exactTotal: BigInt(amounts.exactTotal || '0'),
    fromBlock,
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

  // Manual txHash escape hatch: validate format + uniqueness, then set in store.
  // PaymentVerifier mounts automatically once txHash exists and does full on-chain verification.
  const verifyTxHash = useCallback(({ txHash: hash }: { txHash: string }) => {
    if (!invoice || !/^0x[a-fA-F0-9]{64}$/.test(hash)) return

    // W3-006: reject if already linked to a different invoice
    const alreadyLinked = useTrackedInvoiceStore.getState().invoices.some(
      (inv) => inv.txHash === hash && inv.invoiceId !== invoice.invoiceId,
    )
    if (alreadyLinked) {
      toast.error('This transaction is already linked to another invoice')
      return
    }

    setTxHash(invoice.invoiceId, hash as `0x${string}`, false)
  }, [invoice, setTxHash])

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
    finalized,
    exactTotal: amounts.exactTotal,
    subtotal: amounts.subtotal,
    polling: invoice ? polling : null,
    verifyTxHash,
  }
}
