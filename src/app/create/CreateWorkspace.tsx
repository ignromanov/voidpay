'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { AlertCircle, Maximize2 } from 'lucide-react'

import { decodeInvoice } from '@/features/invoice-codec'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import { useHashFragment } from '@/shared/lib/hooks'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { Text } from '@/shared/ui'
import { PageLayout } from '@/widgets/network-background'
import { InvoicePaper, InvoicePreviewModal, ScaledInvoicePreview } from '@/widgets/invoice-paper'

/**
 * CreateWorkspace — Preview-only layout for /create route
 *
 * Features:
 * - Display invoice from useCreatorStore or URL hash
 * - URL hash decoding (e.g., /create#H4sI...)
 * - Fullscreen preview modal on click
 * - Network-themed background based on invoice networkId
 *
 * Note: Editor form is NOT included (separate feature P0.10.2)
 */
export function CreateWorkspace() {
  const hash = useHashFragment()
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const activeDraft = useCreatorStore((s) => s.activeDraft)
  const updateDraft = useCreatorStore((s) => s.updateDraft)

  // Decode URL hash on mount/change
  useEffect(() => {
    if (!hash) {
      setDecodeError(null)
      return
    }

    try {
      const decoded = decodeInvoice(hash)
      // updateDraft auto-syncs lineItems when items provided
      updateDraft(decoded)
      setDecodeError(null)
      // Silent success - no toast per spec (avoid notification fatigue)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to decode invoice'
      setDecodeError(errorMessage)
      toast.error(errorMessage)
      // Do NOT clear store on error (per spec edge case)
    }
  }, [hash, updateDraft])

  const invoiceData = activeDraft?.data

  // Map networkId to theme name
  const networkTheme = useMemo(
    () => getNetworkTheme(invoiceData?.networkId ?? 1),
    [invoiceData?.networkId]
  )

  const handlePreviewClick = useCallback(() => {
    if (invoiceData) {
      setIsPreviewOpen(true)
    }
  }, [invoiceData])

  return (
    <PageLayout theme={networkTheme}>
      {/* Fullscreen preview modal */}
      {invoiceData && (
        <InvoicePreviewModal
          data={invoiceData}
          status="draft"
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      )}

      {/* Content container */}
      <div className="flex-1 flex flex-col max-w-[1400px] w-full mx-auto min-h-0 px-2 sm:px-4 print:max-w-none print:p-0">
        {/* Error Banner (hidden on print) */}
        {decodeError && <UrlErrorBanner error={decodeError} />}

        {/* Preview container — fills remaining space, centers invoice */}
        <div className="flex-1 flex items-center justify-center overflow-hidden relative print:block print:overflow-visible">
          {/* Screen version: scaled preview */}
          <ScaledInvoicePreview
            containerHeight="92vh"
            onClick={handlePreviewClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            scaleOptions={{ maxScale: 1 }}
            className="cursor-zoom-in print:hidden"
              overlay={
                invoiceData && (
                  <div
                    className={cn(
                      'absolute inset-0 z-20 flex items-end justify-start p-3 transition-opacity duration-200',
                      isHovered ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <button
                      className="bg-zinc-800/80 backdrop-blur-md border border-zinc-600/50 text-zinc-300 text-[10px] font-mono py-1.5 px-3 rounded-full flex items-center gap-2 whitespace-nowrap shadow-xl cursor-pointer transition-colors hover:bg-zinc-700 hover:text-zinc-100 hover:border-zinc-500"
                      type="button"
                    >
                      <Maximize2 className="w-3 h-3" />
                      Expand
                    </button>
                  </div>
                )
              }
          >
            <InvoicePaper data={invoiceData} status="draft" showGlow />
          </ScaledInvoicePreview>

          {/* Print version: full-size invoice without scaling */}
          <div className="hidden print:block print-invoice">
            <InvoicePaper
              data={invoiceData}
              status="draft"
              variant="print"
              showGlow={false}
              showTexture={false}
              responsive
            />
          </div>

          {/* Floating Live Preview badge — hovering above invoice (hidden on print) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 print:hidden">
            <div className="bg-zinc-800/80 backdrop-blur-md border border-zinc-600/50 text-zinc-300 text-[10px] font-mono py-1.5 px-3 rounded-full flex items-center gap-2 whitespace-nowrap shadow-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Preview
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

/**
 * Error banner for invalid URL hash (hidden on print)
 */
function UrlErrorBanner({ error }: { error: string }) {
  return (
    <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 print:hidden">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
        <div>
          <Text className="font-medium text-rose-400">Invalid Invoice URL</Text>
          <Text variant="small" className="text-zinc-400">
            {error}. You can create a new invoice instead.
          </Text>
        </div>
      </div>
    </div>
  )
}

