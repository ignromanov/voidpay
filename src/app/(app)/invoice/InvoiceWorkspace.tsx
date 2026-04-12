'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ScaledInvoicePreview,
  InvoicePaper,
} from '@/widgets/invoice-paper'
import { PaymentPanel, StatusBadge, MinimizedPill, useInvoiceView } from '@/widgets/payment-panel'
import { ShareModal } from '@/widgets/share-modal'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkThemeName } from '@/entities/network'
import { urlToRoute } from '@/shared/lib/navigation'
import type { Invoice } from '@/shared/lib/invoice-types'
import { nowUnix } from '@/shared/lib/date-time'
import type { InvoiceViewState } from '@/widgets/payment-panel'
import { DecodeErrorScreen } from '@/shared/ui/decode-error-screen'
import { motion, AnimatePresence } from '@/shared/ui/motion'
import { ExternalLinkIcon } from '@/shared/ui/icons'
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
      setNetworkTheme(getNetworkThemeName(invoice.networkId))
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
    finalized, exactTotal, polling, verifyTxHash, isSyncing, contentHash,
  } = view

  const searchParams = useSearchParams()
  const shareParam = searchParams.get('share')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const router = useRouter()
  const [isShareOpen, setIsShareOpen] = useState(false)
  const includeOg = useCreatorStore((s) => s.preferences.includeOgImage ?? true)
  const updatePreferences = useCreatorStore((s) => s.updatePreferences)

  const networkId = invoice.networkId
  const isPaid = panelStatus === 'paid' || panelStatus === 'confirming'
  const invoiceStatus = panelStatus === 'overdue' ? 'overdue' as const : 'pending' as const
  const isNotYetPayable = invoice.issuedAt > nowUnix()
  const [payUrl] = useState(() => `/pay${typeof window !== 'undefined' ? window.location.hash : ''}`)

  // Auto-open ShareModal on ?share=1
  useEffect(() => {
    if (shareParam === '1') {
      setIsShareOpen(true)
    }
  }, [shareParam])

  // Sync ?share= param with modal state
  const handleShareOpenChange = useCallback((open: boolean) => {
    setIsShareOpen(open)
    const url = new URL(window.location.href)
    if (open) {
      url.searchParams.set('share', '1')
    } else {
      url.searchParams.delete('share')
    }
    router.replace(urlToRoute(url))
  }, [router])

  const handleOgToggle = useCallback((include: boolean) => {
    updatePreferences({ includeOgImage: include })
  }, [updatePreferences])

  return (
    <>
      {txHash && !finalized && (
        <InvoiceVerifier
          invoice={invoice}
          contentHash={contentHash}
          txHash={txHash}
          exactTotal={exactTotal}
          onReorgDetected={polling.startAutoCheck}
        />
      )}

      <div className="relative z-10 h-full w-full" data-network={networkId}>
        <StatusBadge status={panelStatus} isSyncing={isSyncing} />

        {/* Invoice Preview */}
        <div
          className="absolute inset-x-0 top-0 bottom-[calc(70px+env(safe-area-inset-bottom,0px))] z-10 flex items-center justify-center p-2 md:p-4 print:items-start print:justify-start print:bottom-0 print:p-0"
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
        <div className="absolute bottom-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))] left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 md:bottom-5 print:hidden">
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
                    source="created"
                    {...(confirmations ? { confirmations } : {})}
                    finalized={finalized}
                    pollingMode={polling.mode}
                    onShareOpen={() => handleShareOpenChange(true)}
                    onMinimize={() => setIsMinimized(true)}
                  />
                ) : (
                  <PaymentPanel
                    invoice={invoice}
                    contentHash={contentHash}
                    status={panelStatus}
                    source="created"
                    onShareOpen={() => handleShareOpenChange(true)}
                    {...(storedError ? { error: storedError } : {})}
                    onDismissError={dismissError}
                    pollingMode={polling.mode}
                    onVerifyTxHash={verifyTxHash}
                    onCheckPayment={polling.startManualCheck}
                    {...(polling.cooldownUntil !== undefined && { cooldownUntil: polling.cooldownUntil })}
                    onStopPolling={polling.stop}
                    onMinimize={() => setIsMinimized(true)}
                  >
                    {isNotYetPayable && (
                      <p className="text-xs text-center text-amber-400">
                        This invoice opens for payment on {new Date(invoice.issuedAt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Share modal — uses the /pay URL */}
      {payUrl && (
        <ShareModal
          url={payUrl}
          invoice={invoice}
          open={isShareOpen}
          onOpenChange={handleShareOpenChange}
          includeOg={includeOg}
          onOgToggle={handleOgToggle}
        />
      )}

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
