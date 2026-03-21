'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  ScaledInvoicePreview,
  InvoicePaper,
} from '@/widgets/invoice-paper'
import { PaymentPanel, StatusBadge, MinimizedPill, useInvoiceView } from '@/widgets/payment-panel'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import type { Invoice } from '@/shared/lib/invoice-types'
import type { InvoiceViewState } from '@/widgets/payment-panel'
import { DecodeErrorScreen } from '@/shared/ui/decode-error-screen'
import { motion, AnimatePresence } from '@/shared/ui/motion'
import { ChevronDownIcon, ExternalLinkIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'

const InvoiceVerifier = dynamic(
  () => import('./InvoiceVerifier').then((m) => ({ default: m.InvoiceVerifier })),
  { ssr: false },
)

const InvoicePreviewModal = dynamic(
  () => import('@/widgets/invoice-paper').then((m) => ({ default: m.InvoicePreviewModal })),
  { ssr: false },
)

/**
 * InvoiceWorkspace — Gate layer for the /invoice page.
 *
 * Same pattern as PayWorkspace: decode → loading → error → ready.
 * Uses useInvoiceView with source='created' for creator tracking.
 */
export function InvoiceWorkspace() {
  const router = useRouter()
  const view = useInvoiceView({ source: 'created' })
  const { invoice, errorType, isLoading } = view

  const networkId = invoice?.networkId ?? 1
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)

  useEffect(() => {
    if (invoice?.networkId) {
      setNetworkTheme(getNetworkTheme(invoice.networkId))
    }
  }, [invoice?.networkId, setNetworkTheme])

  if (isLoading) {
    return (
      <div data-network={networkId} className="relative z-10 h-full w-full">
        <div className="absolute inset-x-0 top-0 bottom-[70px] z-10 flex items-center justify-center p-2 md:p-4">
          <ScaledInvoicePreview preset="pay" loading />
        </div>
      </div>
    )
  }

  if (errorType) {
    return (
      <div className="relative z-10 flex h-full flex-col" data-network={networkId}>
        <DecodeErrorScreen errorType={errorType} onReturnHome={() => router.push('/')} />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="relative z-10 flex h-full flex-col">
        <DecodeErrorScreen errorType="CORRUPTED_DATA" onReturnHome={() => router.push('/')} />
      </div>
    )
  }

  return <InvoiceWorkspaceReady invoice={invoice} view={view} />
}

interface InvoiceWorkspaceReadyProps {
  invoice: Invoice
  view: InvoiceViewState
}

function InvoiceWorkspaceReady({ invoice, view }: InvoiceWorkspaceReadyProps) {
  const {
    panelStatus, dismissError, txHash, confirmations, storedError,
    finalized, exactTotal, polling, verifyTxHash, isSyncing,
  } = view

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const networkId = invoice.networkId
  const isPaid = panelStatus === 'paid' || panelStatus === 'confirming'
  const invoiceStatus = panelStatus === 'overdue' ? 'overdue' as const : 'pending' as const
  const [payUrl, setPayUrl] = useState('')

  useEffect(() => {
    setPayUrl(`/pay${window.location.hash}`)
  }, [])

  return (
    <>
      {txHash && (
        <InvoiceVerifier
          invoice={invoice}
          invoiceId={invoice.invoiceId}
          txHash={txHash}
          exactTotal={exactTotal}
          onReorgDetected={polling.startAutoCheck}
        />
      )}

      <div className="relative z-10 h-full w-full" data-network={networkId}>
        <StatusBadge status={panelStatus} isSyncing={isSyncing} />

        {/* Invoice Preview */}
        <div
          className="absolute inset-x-0 top-0 bottom-[70px] z-10 flex items-center justify-center p-2 md:p-4 print:items-start print:justify-start print:bottom-0 print:p-0"
        >
          <ScaledInvoicePreview
            preset="pay"
            printable
            networkId={networkId}
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

        {/* Payment Panel — observation mode (no SmartPayButton) */}
        <div className="absolute bottom-4 left-1/2 z-40 w-full max-w-[95%] -translate-x-1/2 px-4 md:bottom-5 md:max-w-xl">
          <AnimatePresence mode="wait">
            {isMinimized ? (
              <MinimizedPill key="minimized" isPaid={isPaid} onExpand={() => setIsMinimized(false)} />
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
                    source="created"
                    {...(confirmations ? { confirmations } : {})}
                    finalized={finalized}
                    pollingMode={polling.mode}
                  />
                ) : (
                  <PaymentPanel
                    invoice={invoice}
                    status={panelStatus}
                    source="created"
                    {...(storedError ? { error: storedError } : {})}
                    onDismissError={dismissError}
                    pollingMode={polling.mode}
                    onVerifyTxHash={verifyTxHash}
                    onCheckPayment={polling.startAggressivePolling}
                    onStopPolling={polling.stop}
                  >
                    {/* "Pay this invoice" escape route for wrong-page visitors */}
                    {payUrl && (
                      <Button variant="outline" asChild className="w-full border-zinc-700 text-zinc-300 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/5">
                        <a href={payUrl}>
                          Pay this invoice
                          <ExternalLinkIcon size={14} />
                        </a>
                      </Button>
                    )}
                  </PaymentPanel>
                )}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="absolute top-2.5 right-3 z-10 cursor-pointer rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                  title="Minimize"
                  aria-label="Minimize payment panel"
                >
                  <ChevronDownIcon size={14} />
                </button>
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
