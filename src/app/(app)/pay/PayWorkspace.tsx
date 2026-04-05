'use client'

import { useState, useCallback } from 'react'
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
import { ChevronDownIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'

import { usePayInvoice } from './use-pay-invoice'
import type { PayInvoiceState } from './use-pay-invoice'
import { StatusBadge, MinimizedPill } from '@/widgets/payment-panel'
import { CreatorHintBanner } from './CreatorHintBanner'
import { InAppBrowserGuard } from '@/shared/ui/in-app-browser-guard'

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
    finalized, exactTotal, subtotal, polling, verifyTxHash, isSyncing, invoiceKey,
  } = payInvoice

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [devPaymentStep, setDevPaymentStep] = useState<DevPaymentVisualStep | null>(null)

  const handlePaymentSuccess = useCallback(() => { setPaymentError(null) }, [])
  const handlePaymentError = useCallback((error: PaymentError) => { setPaymentError(error.message) }, [])

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
          invoiceKey={invoiceKey}
          invoiceId={invoice.invoiceId}
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

        {/* Payment Panel — floating bottom overlay */}
        <div className="absolute bottom-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))] left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 md:bottom-5 print:hidden">
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
                    status={panelStatus}
                    txHash={txHash}
                    source={source}
                    {...(confirmations ? { confirmations } : {})}
                    finalized={finalized}
                    pollingMode={polling.mode}
                  />
                ) : (
                  <PaymentPanel
                    invoice={invoice}
                    status={panelStatus}
                    source={source}
                    {...(paymentError ? { error: paymentError } : storedError ? { error: storedError } : {})}
                    onDismissError={dismissError}
                    pollingMode={polling.mode}
                    onVerifyTxHash={verifyTxHash}
                    onIvePaid={polling.startAggressivePolling}
                    onStopPolling={polling.stop}
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
                    ) : (
                      <PayButton
                        invoice={invoice}
                        invoiceKey={invoiceKey}
                        invoiceId={invoice.invoiceId}
                        exactTotal={exactTotal}
                        subtotal={subtotal}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        devOverride={devPaymentStep}
                      />
                    )}
                  </PaymentPanel>
                )}
                <button
                  data-testid="minimize-panel"
                  onClick={() => setIsMinimized(true)}
                  className="absolute top-1.5 right-1.5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                  title="Minimize"
                  aria-label="Minimize payment panel"
                >
                  <ChevronDownIcon size={14} />
                </button>
                <DevStatusToggle invoiceId={invoice.invoiceId} status={panelStatus} />
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
