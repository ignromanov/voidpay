'use client'

/**
 * useInvoiceView — Shared invoice observation hook
 *
 * Composes lower-layer logic for both /pay and /invoice pages:
 * - Hash decoding via parseInvoiceHash (features/invoice-codec)
 * - Status derivation via computeInvoiceStatus (entities/invoice)
 * - Amount computation via computeAmounts (entities/invoice)
 * - Payment discovery polling via usePaymentPolling (features/payment)
 * - Syncing indicator with 600ms minimum display
 * - Manual txHash escape hatch
 *
 * NOT included (page-specific side effects):
 * - Network theme sync — lifted to page components
 * - Payment error state — SmartPayButton integration, /pay only
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useHashFragment } from '@/shared/lib/hooks'
import { parseInvoiceHash, mapParseErrorToDecodeType } from '@/features/invoice-codec'
import { track, AnalyticsEvent, getReferrerDomain } from '@/features/analytics'
import { usePaymentPolling } from '@/features/payment'
import type { UsePaymentPollingResult } from '@/features/payment'
import { useTrackedInvoiceStore, computeInvoiceStatus, computeAmounts } from '@/entities/invoice'
import { estimateFromBlockHex } from '@/entities/network'
import { nowISO } from '@/shared/lib/date-time'
import { toast } from '@/shared/lib/toast'
import type { InvoiceStatus, InvoiceSource } from '@/entities/invoice'
import type { DecodeErrorType } from '@/shared/ui/decode-error-screen'
import type { Invoice, ConfirmationProgress } from '@/shared/lib/invoice-types'

/** Time to wait for hash fragment to stabilize after SSR hydration */
const HYDRATION_TIMEOUT = 200

export interface UseInvoiceViewOptions {
  source: InvoiceSource
}

export interface InvoiceViewState {
  invoice: Invoice | null
  errorType: DecodeErrorType | null
  isLoading: boolean
  panelStatus: InvoiceStatus
  source: InvoiceSource | undefined
  txHash: `0x${string}` | undefined
  confirmations: ConfirmationProgress | undefined
  storedError: string | null | undefined
  finalized: boolean
  exactTotal: string
  subtotal: string
  polling: UsePaymentPollingResult
  verifyTxHash: (args: { txHash: string }) => void
  dismissError: () => void
  isSyncing: boolean
}

export function useInvoiceView({ source }: UseInvoiceViewOptions): InvoiceViewState {
  const hash = useHashFragment()
  const trackView = useTrackedInvoiceStore((s) => s.trackView)
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

  const finalized = tracked?.finalized ?? false

  const amounts = useMemo(
    () => invoice ? computeAmounts(invoice) : { exactTotal: '0', subtotal: '0', magicDust: '0' },
    [invoice],
  )

  // Discovery polling
  const networkId = invoice?.networkId ?? 1
  const category: 'external' | 'erc20' = invoice?.tokenAddress ? 'erc20' : 'external'
  const fromBlock = useMemo(
    () => invoice ? estimateFromBlockHex(networkId, invoice.issuedAt) : '0x1',
    [networkId, invoice],
  )
  const polling = usePaymentPolling({
    enabled: !!invoice,
    invoiceId: invoice?.invoiceId ?? '',
    toAddress: invoice?.from?.walletAddress ?? '',
    chainId: networkId,
    ...(invoice?.tokenAddress ? { contractAddress: invoice.tokenAddress } : {}),
    category,
    exactTotal: BigInt(amounts.exactTotal || '0'),
    fromBlock,
  })

  // Syncing indicator: shows during auto-check with 600ms minimum display
  const [syncVisible, setSyncVisible] = useState(false)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const isAutoChecking = polling.mode === 'auto-check'

    if (isAutoChecking && !syncVisible) {
      setSyncVisible(true)
    }

    if (!isAutoChecking && syncVisible) {
      syncTimerRef.current = setTimeout(() => setSyncVisible(false), 600)
    }

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [polling.mode, syncVisible])

  const isSyncing = syncVisible && !!invoice

  // 1. Hydration detection
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
      track(AnalyticsEvent.ERROR_DECODE, { error_type: 'EMPTY_HASH', page: source === 'received' ? 'pay' : 'invoice' })
      return
    }

    let cancelled = false
    void (async () => {
      const result = await parseInvoiceHash(hash)
      if (cancelled) return

      if (result.success) {
        setInvoice(result.data)
        setErrorType(null)

        try {
          trackView({
            invoiceId: result.data.invoiceId,
            invoiceUrl: `${window.location.origin}/pay#${hash}`,
            source,
            viewedAt: nowISO(),
          })
        } catch (error) {
          console.error('[useInvoiceView] Failed to track invoice view:', error)
          toast.info('Could not save invoice to history. Your payment experience is unaffected.')
        }

        if (source === 'received') {
          const networkName = result.data.networkId === 42161 ? 'arbitrum'
            : result.data.networkId === 10 ? 'optimism'
            : result.data.networkId === 137 ? 'polygon'
            : 'ethereum'
          track(AnalyticsEvent.PAY_PAGE_LOAD, {
            network: networkName,
            token_symbol: result.data.currency ?? 'ETH',
            referrer_domain: getReferrerDomain(),
          })
        }
      } else {
        setInvoice(null)
        const decodedErrorType = mapParseErrorToDecodeType(result.error.message)
        setErrorType(decodedErrorType)
        track(AnalyticsEvent.ERROR_DECODE, { error_type: decodedErrorType, page: source === 'received' ? 'pay' : 'invoice' })
      }
    })()
    return () => { cancelled = true }
  }, [hash, isHydrated, trackView, source])

  const dismissError = useCallback(() => {
    if (invoice) setError(invoice.invoiceId, null)
  }, [invoice, setError])

  // Manual txHash escape hatch
  const verifyTxHash = useCallback(({ txHash: hash }: { txHash: string }) => {
    if (!invoice || !/^0x[a-fA-F0-9]{64}$/.test(hash)) return

    const store = useTrackedInvoiceStore.getState()

    const current = store.invoices.find((inv) => inv.invoiceId === invoice.invoiceId)
    if (current?.txHash === hash) {
      toast.info('This transaction is already linked to this invoice')
      return
    }

    // W3-006: reject if already linked to a different invoice
    const alreadyLinked = store.invoices.some(
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
    txHash: tracked?.txHash,
    confirmations: tracked?.confirmations,
    storedError: tracked?.error,
    finalized,
    exactTotal: amounts.exactTotal,
    subtotal: amounts.subtotal,
    polling,
    verifyTxHash,
    dismissError,
    isSyncing,
  }
}
