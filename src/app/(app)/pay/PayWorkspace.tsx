'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  ScaledInvoicePreview,
  InvoicePaper,
} from '@/widgets/invoice-paper'
import { PaymentPanel, DevStatusToggle, DevPaymentStepToggle, computeAmounts } from '@/widgets/payment-panel'
import type { DevPaymentVisualStep } from '@/features/payment'
import { DecodeErrorScreen } from '@/shared/ui/decode-error-screen'
import { motion, AnimatePresence } from '@/shared/ui/motion'
import { ChevronDownIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'

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
import { usePayInvoice } from './use-pay-invoice'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { StatusBadge } from './StatusBadge'
import { MinimizedPill } from './MinimizedPill'

const InvoicePreviewModal = dynamic(
  () => import('@/widgets/invoice-paper').then((m) => ({ default: m.InvoicePreviewModal })),
  { ssr: false },
)

/**
 * PayWorkspace — Composition layer for the /pay page.
 *
 * Orchestrates:
 * - usePayInvoice hook (decode, tracking, status)
 * - InvoicePaper preview with modal
 * - PaymentPanel with minimize/expand
 * - StatusBadge floating overlay
 */
export function PayWorkspace() {
  const router = useRouter()
  const { invoice, errorType, isLoading, panelStatus, source, dismissError } = usePayInvoice()
  const storedInvoice = useTrackedInvoiceStore((s) =>
    invoice ? s.invoices.find((inv) => inv.invoiceId === invoice.invoiceId) : undefined
  )

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [devPaymentStep, setDevPaymentStep] = useState<DevPaymentVisualStep | null>(null)

  const networkId = invoice?.networkId ?? 1
  const exactTotal = invoice ? computeAmounts(invoice).exactTotal : '0'

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

  const isPaid = panelStatus === 'paid' || panelStatus === 'confirming'
  // InvoicePaper uses discriminated union: status='paid' requires txHash.
  // Only pass 'paid' in the branch where txHash is available (conditional rendering below).
  const invoiceStatus = panelStatus === 'overdue' ? 'overdue' as const : 'pending' as const

  return (
    <>
      <div className="relative z-10 h-full w-full" data-network={networkId}>
        <StatusBadge status={panelStatus} />

        {/* Invoice Preview — centered in safe zone */}
        <div
          data-testid="invoice-preview-clickable"
          className="absolute inset-x-0 top-0 bottom-[70px] z-10 flex items-center justify-center p-2 md:p-4 print:items-start print:justify-start print:bottom-0 print:p-0"
        >
          <ScaledInvoicePreview
            preset="pay"
            printable
            networkId={invoice.networkId}
            onClick={() => setIsPreviewOpen(true)}
            showExpandOverlay
          >
            {isPaid && storedInvoice?.txHash ? (
              <InvoicePaper data={invoice} status="paid" txHash={storedInvoice.txHash} />
            ) : (
              <InvoicePaper data={invoice} status={invoiceStatus} />
            )}
          </ScaledInvoicePreview>
        </div>

        {/* Payment Panel — floating bottom overlay */}
        <div className="absolute bottom-4 left-1/2 z-40 w-full max-w-[95%] -translate-x-1/2 px-4 md:bottom-5 md:max-w-xl">
          <AnimatePresence mode="wait">
            {isMinimized ? (
              <MinimizedPill isPaid={isPaid} onExpand={() => setIsMinimized(false)} />
            ) : (
              <motion.div
                key="expanded"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative w-full"
              >
                {isPaid && storedInvoice?.txHash ? (
                  <PaymentPanel
                    invoice={invoice}
                    status={panelStatus}
                    txHash={storedInvoice.txHash}
                    source={source}
                    {...(storedInvoice.confirmations ? { confirmations: storedInvoice.confirmations } : {})}
                  />
                ) : (
                  <PaymentPanel
                    invoice={invoice}
                    status={panelStatus}
                    source={source}
                    {...(paymentError ? { error: paymentError } : storedInvoice?.error ? { error: storedInvoice.error } : {})}
                    onDismissError={() => {
                      setPaymentError(null)
                      dismissError()
                    }}
                  >
                    <PayButton
                      invoice={invoice}
                      invoiceId={invoice.invoiceId}
                      exactTotal={exactTotal}
                      onSuccess={() => {
                        setPaymentError(null)
                      }}
                      onError={(error) => {
                        setPaymentError(error.message)
                      }}
                      onDismissError={() => {
                        setPaymentError(null)
                        dismissError()
                      }}
                      devOverride={devPaymentStep}
                    />
                  </PaymentPanel>
                )}
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
                <DevPaymentStepToggle onChange={setDevPaymentStep} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isPreviewOpen && (isPaid && storedInvoice?.txHash ? (
        <InvoicePreviewModal
          data={invoice}
          status="paid"
          txHash={storedInvoice.txHash}
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
