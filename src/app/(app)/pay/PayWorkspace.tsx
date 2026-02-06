'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useHashFragment } from '@/shared/lib/hooks'
import { parseInvoiceHash } from '@/features/invoice-codec'
import { useRichInvoiceStore, type RichInvoice } from '@/entities/invoice'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import {
  ScaledInvoicePreview,
  InvoicePaper,
} from '@/widgets/invoice-paper'
import {
  DecodeErrorScreen,
  type DecodeErrorType,
} from '@/shared/ui/decode-error-screen'
import { PaymentPanel, DevStatusToggle, type PaymentPanelStatus } from '@/widgets/payment-panel'
import { motion, AnimatePresence } from '@/shared/ui/motion'
import { CheckIcon, ClockIcon, ChevronUpIcon, ChevronDownIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'
import type { Invoice } from '@/shared/lib/invoice-types'

/**
 * Floating status badge styles per payment status.
 * Matches design reference: PaymentWorkspace.tsx (lines 183-201).
 */
const BADGE_STYLES: Record<PaymentPanelStatus, { label: string; badge: string; dot: string }> = {
  pending: {
    label: 'Payment Pending',
    badge: 'border-amber-500/40 bg-amber-950/80 text-amber-200 shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]',
    dot: 'bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-pulse',
  },
  confirming: {
    label: 'Confirming Payment',
    badge: 'border-blue-500/40 bg-blue-950/80 text-blue-200 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]',
    dot: 'bg-blue-400 shadow-[0_0_12px_#60a5fa] animate-pulse',
  },
  paid: {
    label: 'Finalized & Paid',
    badge: 'border-emerald-500/50 bg-emerald-950/80 text-emerald-200 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]',
    dot: 'bg-emerald-400 shadow-[0_0_12px_#34d399]',
  },
  overdue: {
    label: 'Overdue',
    badge: 'border-red-500/40 bg-red-950/80 text-red-200 shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)]',
    dot: 'bg-red-400 shadow-[0_0_12px_#f87171]',
  },
}

const InvoicePreviewModal = dynamic(
  () => import('@/widgets/invoice-paper').then((m) => ({ default: m.InvoicePreviewModal })),
  { ssr: false }
)

/**
 * Hydration timeout in ms.
 * After this time without hash, we assume no invoice data.
 */
const HYDRATION_TIMEOUT = 200

/**
 * Map parseInvoiceHash error messages to DecodeErrorType.
 */
function mapErrorMessage(message: string): DecodeErrorType {
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('empty')) {
    return 'EMPTY_HASH'
  }
  if (lowerMessage.includes('prefix') || lowerMessage.includes('invalid')) {
    return 'INVALID_FORMAT'
  }
  if (lowerMessage.includes('version')) {
    return 'UNSUPPORTED_VERSION'
  }
  return 'CORRUPTED_DATA'
}

/**
 * PayWorkspace — Client component for viewing invoices from shared links.
 *
 * Handles:
 * 1. URL hash decoding via parseInvoiceHash (Binary V3)
 * 2. Loading/error states with network-themed background
 * 3. Fullscreen modal preview via InvoicePreviewModal
 * 4. View history tracking via useRichInvoiceStore
 *
 * @example
 * ```tsx
 * // In page.tsx
 * export default function PayPage() {
 *   return <PayWorkspace />
 * }
 * ```
 */
export function PayWorkspace() {
  const router = useRouter()
  const hash = useHashFragment()
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)
  const { addInvoice, getInvoice, updateStatus, setError } = useRichInvoiceStore()

  // Decode state
  const [isHydrated, setIsHydrated] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [errorType, setErrorType] = useState<DecodeErrorType | null>(null)

  // Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Panel minimize state (floating overlay can collapse to pill)
  const [isMinimized, setIsMinimized] = useState(false)

  // Stored invoice data (re-evaluates on store changes — no useMemo, so getInvoice reads fresh data)
  const storedInvoice = invoice ? getInvoice(invoice.invoiceId) : undefined
  const storedTxHash = storedInvoice?.txHash
  const storedTxValidated = storedInvoice?.txHashValidated
  const storedConfirmations = storedInvoice?.confirmations
  const storedError = storedInvoice?.error

  // Compute payment panel status
  const panelStatus: PaymentPanelStatus = useMemo(() => {
    if (storedInvoice?.status === 'paid') {
      return storedTxValidated ? 'paid' : 'confirming'
    }
    if (storedInvoice?.status === 'overdue') return 'overdue'
    if (invoice?.dueAt && invoice.dueAt * 1000 < Date.now()) return 'overdue'
    return 'pending'
  }, [invoice, storedInvoice?.status, storedTxValidated])

  // Hydration detection: wait for hash to stabilize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, HYDRATION_TIMEOUT)
    return () => clearTimeout(timer)
  }, [])

  // Decode hash when available
  useEffect(() => {
    // Skip during SSR hydration
    if (!isHydrated && hash === '') {
      return
    }

    // Empty hash after hydration = no invoice
    if (hash === '') {
      setErrorType('EMPTY_HASH')
      setInvoice(null)
      return
    }

    // Attempt to decode
    const result = parseInvoiceHash(hash)

    if (result.success) {
      setInvoice(result.data)
      setErrorType(null)

      // Track view in history (if not already tracked)
      try {
        const existingInvoice = getInvoice(result.data.invoiceId)
        if (!existingInvoice) {
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
        console.error('[PayWorkspace] Failed to track invoice view:', error)
      }
    } else {
      setInvoice(null)
      setErrorType(mapErrorMessage(result.error.message))
    }
  }, [hash, isHydrated, addInvoice, getInvoice])

  // Set network theme based on invoice
  useEffect(() => {
    if (invoice?.networkId) {
      const theme = getNetworkTheme(invoice.networkId)
      setNetworkTheme(theme)
    }
  }, [invoice?.networkId, setNetworkTheme])

  // Sync computed status to store (so InvoicePaper reflects it too)
  useEffect(() => {
    if (!invoice || !storedInvoice) return
    if (panelStatus === 'overdue' && storedInvoice.status !== 'overdue') {
      updateStatus(invoice.invoiceId, 'overdue')
    }
  }, [invoice, panelStatus, storedInvoice, updateStatus])

  // Navigate to home
  const handleReturnHome = () => {
    router.push('/')
  }

  // Handle invoice click (open modal)
  const handleInvoiceClick = () => {
    setIsPreviewOpen(true)
  }

  // Memoize network ID for data attribute
  const networkId = useMemo(() => invoice?.networkId ?? 1, [invoice?.networkId])

  // Loading state: SSR hydration OR waiting for decode effect to process
  if (!invoice && !errorType) {
    return (
      <div
        data-testid="pay-workspace-skeleton"
        data-network={networkId}
        className="flex h-full items-center justify-center"
      >
        <div className="h-[500px] w-[353px] animate-pulse rounded-lg bg-zinc-800/50" />
      </div>
    )
  }

  // Error state
  if (errorType) {
    return (
      <div className="relative z-10 flex h-full flex-col" data-network={networkId}>
        <DecodeErrorScreen
          errorType={errorType}
          onReturnHome={handleReturnHome}
        />
      </div>
    )
  }

  // Success state — overlay layout per design reference (PaymentWorkspace.tsx)
  // Invoice centered in "safe zone", PaymentPanel as floating bottom overlay
  if (invoice) {
    const isPaid = panelStatus === 'paid' || panelStatus === 'confirming'

    const badgeConfig = BADGE_STYLES[panelStatus]

    return (
      <>
        <div className="relative z-10 h-full w-full" data-network={networkId}>
          {/* Floating Status Badge — above invoice, per design reference */}
          <div className="absolute top-3 inset-x-0 z-20 flex justify-center pointer-events-none">
            <span
              data-testid="status-badge"
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md',
                badgeConfig.badge
              )}
            >
              <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', badgeConfig.dot)} />
              {badgeConfig.label}
            </span>
          </div>

          {/* Invoice Preview — centered in safe zone, leaving bottom space for panel */}
          <div
            data-testid="invoice-preview-clickable"
            className="absolute inset-x-0 top-0 bottom-[70px] z-10 flex items-center justify-center p-2 md:p-4 print:items-start print:justify-start print:bottom-0 print:p-0"
          >
            <ScaledInvoicePreview
              preset="pay"
              printable
              networkId={invoice.networkId}
              onClick={handleInvoiceClick}
              showExpandOverlay
            >
              {isPaid && storedTxHash ? (
                <InvoicePaper data={invoice} status="paid" txHash={storedTxHash} />
              ) : (
                <InvoicePaper data={invoice} status={panelStatus === 'overdue' ? 'overdue' : 'pending'} />
              )}
            </ScaledInvoicePreview>
          </div>

          {/* Payment Panel — floating bottom overlay */}
          <div className="absolute bottom-4 left-1/2 z-40 w-full max-w-[95%] -translate-x-1/2 px-4 md:bottom-5 md:max-w-xl">
            <AnimatePresence mode="wait">
              {isMinimized ? (
                /* Minimized pill */
                <motion.div
                  key="minimized"
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  data-testid="payment-pill"
                  onClick={() => setIsMinimized(false)}
                  className={cn(
                    'mx-auto flex w-full max-w-sm cursor-pointer items-center justify-between rounded-full border p-2 shadow-2xl backdrop-blur-md transition-colors group',
                    isPaid
                      ? 'border-emerald-500/30 bg-zinc-900/90 shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]'
                      : 'border-zinc-700 bg-zinc-900/90'
                  )}
                >
                  <div className="flex items-center gap-3 pl-2">
                    {isPaid ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
                        <CheckIcon size={16} className="text-emerald-400" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20">
                        <ClockIcon size={16} className="text-amber-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold leading-none text-white">
                        {isPaid ? 'Payment Successful' : 'Waiting for Payment'}
                      </span>
                      <span className="mt-0.5 text-[10px] leading-none text-zinc-400">
                        Click to expand details
                      </span>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 transition-colors group-hover:bg-zinc-700">
                    <ChevronUpIcon size={16} className="text-zinc-400" />
                  </div>
                </motion.div>
              ) : (
                /* Expanded panel */
                <motion.div
                  key="expanded"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="relative w-full"
                >
                  {isPaid && storedTxHash ? (
                    <PaymentPanel
                      invoice={invoice}
                      status={panelStatus}
                      txHash={storedTxHash}
                      confirmations={storedConfirmations}
                    />
                  ) : (
                    <PaymentPanel
                      invoice={invoice}
                      status={panelStatus}
                      error={storedError}
                      onDismissError={() => setError(invoice.invoiceId, null)}
                    />
                  )}
                  {/* Minimize button — overlays top-right of panel */}
                  <button
                    data-testid="minimize-panel"
                    onClick={() => setIsMinimized(true)}
                    className="absolute top-2.5 right-3 z-10 cursor-pointer rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                    title="Minimize"
                    aria-label="Minimize payment panel"
                  >
                    <ChevronDownIcon size={14} />
                  </button>
                  <DevStatusToggle invoiceId={invoice.invoiceId} status={panelStatus} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {isPreviewOpen && (
          <InvoicePreviewModal
            data={invoice}
            status={isPaid && storedTxHash ? 'paid' : panelStatus === 'overdue' ? 'overdue' : 'pending'}
            {...(isPaid && storedTxHash ? { txHash: storedTxHash } : {})}
            open={isPreviewOpen}
            onOpenChange={setIsPreviewOpen}
          />
        )}
      </>
    )
  }

  // Fallback — should not reach here
  console.error('[PayWorkspace] Unexpected state: no invoice, no error, hydrated')
  return (
    <div className="relative z-10 flex h-full flex-col">
      <DecodeErrorScreen
        errorType="CORRUPTED_DATA"
        onReturnHome={handleReturnHome}
      />
    </div>
  )
}
