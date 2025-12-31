'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, Maximize2 } from 'lucide-react'

import { decodeInvoice } from '@/features/invoice-codec'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme, NETWORK_GLOW_SHADOWS } from '@/entities/network'
import { useHashFragment } from '@/shared/lib/hooks'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { Text } from '@/shared/ui'
import { InvoicePaper, InvoicePreviewModal, ScaledInvoicePreview } from '@/widgets/invoice-paper'

/**
 * CreateWorkspace — Preview-only layout for /create route
 *
 * Features:
 * - Display invoice from useCreatorStore or URL hash
 * - URL hash decoding (e.g., /create#H4sI...)
 * - Fullscreen preview modal on click
 * - Sets network theme in store for dynamic background
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
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)

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

  // Update network theme when invoice networkId changes
  useEffect(() => {
    const theme = getNetworkTheme(invoiceData?.networkId ?? 1)
    setNetworkTheme(theme)
  }, [invoiceData?.networkId, setNetworkTheme])

  const handlePreviewClick = useCallback(() => {
    if (invoiceData) {
      setIsPreviewOpen(true)
    }
  }, [invoiceData])

  return (
    <>
      {/* Fullscreen preview modal */}
      {invoiceData && (
        <InvoicePreviewModal
          data={invoiceData}
          status="draft"
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      )}

      {/* Content container — overflow-clip prevents glow from creating scroll */}
      <div className="mx-auto flex h-[calc(100vh-104px)] w-full max-w-[1400px] flex-col overflow-clip px-2 sm:px-4 print:h-auto print:max-w-none print:overflow-visible print:p-0">
        {/* Error Banner (hidden on print) */}
        {decodeError && <UrlErrorBanner error={decodeError} />}

        {/* Preview container — fills remaining space, centers invoice */}
        <div className="relative flex flex-1 items-center justify-center overflow-visible print:hidden">
          {/* Screen-only scaled preview (hidden during print to avoid flicker) */}
          <ScaledInvoicePreview
            preset="editor"
            glowClassName={NETWORK_GLOW_SHADOWS[invoiceData?.networkId ?? 1]}
            onClick={handlePreviewClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="cursor-zoom-in"
            overlay={
              invoiceData && (
                <div
                  className={cn(
                    'absolute inset-0 z-20 flex items-end justify-start p-3 transition-opacity duration-200',
                    isHovered ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <button
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/80 px-3 py-1.5 font-mono text-[10px] whitespace-nowrap text-zinc-300 shadow-xl backdrop-blur-md transition-colors hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-100"
                    type="button"
                  >
                    <Maximize2 className="h-3 w-3" />
                    Expand
                  </button>
                </div>
              )
            }
          >
            <InvoicePaper data={invoiceData} status="draft" showGlow />
          </ScaledInvoicePreview>

          {/* Floating Live Preview badge */}
          <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/80 px-3 py-1.5 font-mono text-[10px] whitespace-nowrap text-zinc-300 shadow-xl backdrop-blur-md">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live Preview
            </div>
          </div>
        </div>

        {/* Print-only invoice (hidden on screen, full-size for print) */}
        <div className="invoice-print-target hidden print:block">
          <InvoicePaper data={invoiceData} status="draft" />
        </div>
      </div>
    </>
  )
}

/**
 * Error banner for invalid URL hash (hidden on print)
 */
function UrlErrorBanner({ error }: { error: string }) {
  return (
    <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 print:hidden">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
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
