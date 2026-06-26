'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  ScaledInvoicePreview,
  InvoicePaper,
} from '@/widgets/invoice-paper'
import { PaymentPanel, DevStatusToggle, DevPaymentStepToggle } from '@/widgets/payment-panel'
import type { DevPaymentVisualStep, PaymentError } from '@/features/payment'
import { useFinalizationToast } from '@/features/payment'
import type { Invoice } from '@/shared/lib/invoice-types'
import { nowUnix } from '@/shared/lib/date-time'
import { DecodeErrorScreen } from '@/shared/ui/decode-error-screen'
import { motion, AnimatePresence } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'

import { usePayInvoice } from './use-pay-invoice'
import type { PayInvoiceState } from './use-pay-invoice'
import { StatusBadge, MinimizedPill } from '@/widgets/payment-panel'
import { CreatorHintBanner } from './CreatorHintBanner'
import { InAppBrowserGuard, useIsHostileInAppBrowser } from '@/widgets/in-app-browser-guard'

/**
 * Lazy-loaded SmartPayButton wrapped in its own scoped Web3Provider.
 * Only this button needs wagmi — the rest of the page renders immediately.
 */
const PayButton = dynamic(
  () => import('./PayButton').then((m) => ({ default: m.PayButton })),
  {
    ssr: false,
    loading: () => (
      <Button variant="void" size="lg" className="h-14 w-full" disabled>
        Smart Pay
      </Button>
    ),
  },
)

const OpenInBrowserPayButton = dynamic(
  () => import('./OpenInBrowserPayButton').then((m) => ({ default: m.OpenInBrowserPayButton })),
  {
    ssr: false,
    loading: () => (
      <Button variant="void" size="lg" className="h-14 w-full" disabled>
        Open in browser to pay
      </Button>
    ),
  },
)

const PaymentVerifier = dynamic(
  () => import('./PaymentVerifier').then((m) => ({ default: m.PaymentVerifier })),
  { ssr: false },
)

const InvoicePreviewModal = dynamic(
  () => import('@/widgets/invoice-paper').then((m) => ({ default: m.InvoicePreviewModal })),
  { ssr: false },
)

// ---------------------------------------------------------------------------
// PayWorkspace — Gate layer (decode, loading, error)
// ---------------------------------------------------------------------------

/**
 * PayWorkspace — Gate layer for the /pay page.
 *
 * Handles decode, loading, and error states. Once the invoice is decoded,
 * renders PayWorkspaceReady which mounts all interaction hooks with
 * guaranteed valid data (no fallback values, no wasted requests).
 */
export function PayWorkspace() {
  const router = useRouter()
  const payInvoice = usePayInvoice()
  const { invoice, errorType, isLoading } = payInvoice

  const networkId = invoice?.networkId ?? 1

  // Pre-instantiate void_layer_codec WASM during idle time so the first
  // decode call has zero cold-init latency (~37 ms one-time cost).
  useEffect(() => {
    import('@/features/invoice-codec/lib/wasm-warmup').then(({ scheduleWasmWarmup }) => {
      scheduleWasmWarmup()
    }).catch(() => { /* best-effort */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="pay-workspace-skeleton" data-network={networkId} className="relative z-10 h-full w-full">
        <div className="absolute inset-x-0 top-0 bottom-[70px] z-10 flex items-center justify-center p-2 md:p-4">
          <ScaledInvoicePreview preset="pay" loading />
        </div>
      </div>
    )
  }

  // Error state
  if (errorType) {
    return (
      <div className="relative z-10 flex h-full flex-col" data-network={networkId}>
        <DecodeErrorScreen errorType={errorType} onReturnHome={() => router.push('/')} />
      </div>
    )
  }

  // Guard — unreachable if hook logic is correct
  if (!invoice) {
    return (
      <div className="relative z-10 flex h-full flex-col">
        <DecodeErrorScreen errorType="CORRUPTED_DATA" onReturnHome={() => router.push('/')} />
      </div>
    )
  }

  return <PayWorkspaceReady invoice={invoice} payInvoice={payInvoice} />
}

// ---------------------------------------------------------------------------
// PayWorkspaceReady — Interaction layer (hooks mount with valid data)
// ---------------------------------------------------------------------------

interface PayWorkspaceReadyProps {
  invoice: Invoice
  payInvoice: PayInvoiceState
}

function PayWorkspaceReady({ invoice, payInvoice }: PayWorkspaceReadyProps) {
  const {
    panelStatus, source, dismissError, txHash, confirmations, storedError,
    finalized, exactTotal, subtotal, polling, verifyTxHash, isSyncing, contentHash,
  } = payInvoice

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [devPaymentStep, setDevPaymentStep] = useState<DevPaymentVisualStep | null>(null)
  const isHostile = useIsHostileInAppBrowser()

  const handlePaymentSuccess = useCallback(() => { setPaymentError(null) }, [])
  const handlePaymentError = useCallback((error: PaymentError) => { setPaymentError(error.message) }, [])
  const handleDismissError = useCallback(() => {
    setPaymentError(null)
    dismissError()
  }, [dismissError])

  useFinalizationToast({
    finalized,
    currency: invoice.currency,
    subtotal,
    decimals: invoice.decimals,
    networkId: invoice.networkId,
  })

  const networkId = invoice.networkId
  const isPaid = panelStatus === 'paid' || panelStatus === 'confirming'
  const invoiceStatus = panelStatus === 'overdue' ? 'overdue' as const : 'pending' as const
  const isNotYetPayable = invoice.issuedAt > nowUnix()

  return (
    <>
      {/* Headless verification: mounts when txHash exists and not yet finalized */}
      {txHash && !finalized && (
        <PaymentVerifier
          invoice={invoice}
          contentHash={contentHash}
          txHash={txHash}
          exactTotal={exactTotal}
          onReorgDetected={polling.startAutoCheck}
        />
      )}

      <div className="relative z-10 h-full w-full" data-network={networkId}>
        <InAppBrowserGuard />
        <StatusBadge status={panelStatus} isSyncing={isSyncing} />

        {/* Invoice Preview — centered in safe zone */}
        <div
          data-testid="invoice-preview-clickable"
          className="absolute inset-x-0 top-0 bottom-[calc(70px+env(safe-area-inset-bottom,0px))] z-10 flex items-center justify-center p-2 md:p-4 print:items-start print:justify-start print:bottom-0 print:p-0"
        >
          <ScaledInvoicePreview
            preset="pay"
            printable
            networkId={invoice.networkId}
            onClick={() => setIsPreviewOpen(true)}
            showExpandOverlay
          >
            {isPaid && txHash ? (
              <InvoicePaper data={invoice} status="paid" txHash={txHash} />
            ) : (
              <InvoicePaper data={invoice} status={invoiceStatus} />
            )}
          </ScaledInvoicePreview>
        </div>

        {/* Payment Panel — floating bottom overlay (position is constant; the
            InAppBrowserGuard warning sits ABOVE it at higher z-index and is
            dismissible, so no positional shift in hostile-IAB path) */}
        <div className="absolute left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 bottom-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))] md:bottom-5 print:hidden">
          <CreatorHintBanner isCreator={source === 'created'} />
          <AnimatePresence mode="wait">
            {isMinimized ? (
              <MinimizedPill key="minimized" status={panelStatus} onExpand={() => setIsMinimized(false)} />
            ) : (
              <motion.div
                key="expanded"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative w-full"
              >
                {isPaid && txHash ? (
                  <PaymentPanel
                    invoice={invoice}
                    contentHash={contentHash}
                    status={panelStatus}
                    txHash={txHash}
                    source={source}
                    {...(confirmations ? { confirmations } : {})}
                    finalized={finalized}
                    pollingMode={polling.mode}
                    onMinimize={() => setIsMinimized(true)}
                  />
                ) : (
                  <PaymentPanel
                    invoice={invoice}
                    contentHash={contentHash}
                    status={panelStatus}
                    source={source}
                    {...(paymentError ? { error: paymentError } : storedError ? { error: storedError } : {})}
                    onDismissError={handleDismissError}
                    pollingMode={polling.mode}
                    onVerifyTxHash={verifyTxHash}
                    onIvePaid={polling.startAggressivePolling}
                    onStopPolling={polling.stop}
                    onMinimize={() => setIsMinimized(true)}
                  >
                    {isNotYetPayable ? (
                      <div className="space-y-2 text-center">
                        <Button variant="void" size="lg" className="h-14 w-full opacity-60" disabled>
                          Payment not yet open
                        </Button>
                        <p className="text-xs text-amber-400">
                          This invoice opens for payment on {new Date(invoice.issuedAt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    ) : isHostile ? (
                      <OpenInBrowserPayButton />
                    ) : (
                      <PayButton
                        invoice={invoice}
                        contentHash={contentHash}
                        exactTotal={exactTotal}
                        subtotal={subtotal}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        devOverride={devPaymentStep}
                      />
                    )}
                  </PaymentPanel>
                )}
                <DevStatusToggle contentHash={contentHash} status={panelStatus} />
                <DevPaymentStepToggle onChange={setDevPaymentStep} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isPreviewOpen && (isPaid && txHash ? (
        <InvoicePreviewModal
          data={invoice}
          status="paid"
          txHash={txHash}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      ) : (
        <InvoicePreviewModal
          data={invoice}
          status={invoiceStatus}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      ))}
    </>
  )
}
