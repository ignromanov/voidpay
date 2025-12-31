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
import { InvoicePaper, InvoicePreviewModal } from '@/widgets/invoice-paper'

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
      <div className="flex-1 flex flex-col max-w-[1400px] w-full mx-auto min-h-0 px-2 sm:px-4">
        {/* Error Banner */}
        {decodeError && <UrlErrorBanner error={decodeError} />}

        {/* Real-time Preview badge — small, top */}
        <div className="flex justify-center py-2 shrink-0">
          <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-500 text-[10px] font-mono py-1 px-3 rounded-full flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Preview
          </div>
        </div>

        {/* Preview container — fills remaining space, centers invoice */}
        <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
          {/* Scaled wrapper with explicit dimensions matching scale */}
          {/* Invoice base: 794×1123px, scaled to fit viewport */}
          <div
            className={cn(
              'relative cursor-zoom-in overflow-hidden rounded-sm',
              // Width: 794 × scale
              'w-[357px] sm:w-[397px] md:w-[437px] lg:w-[476px] xl:w-[556px]',
              // Height: 1123 × scale
              'h-[505px] sm:h-[562px] md:h-[618px] lg:h-[674px] xl:h-[786px]'
            )}
            onClick={handlePreviewClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handlePreviewClick()
              }
            }}
          >
            {/* Invoice with CSS scale — origin top-left to align with container */}
            <div className="absolute top-0 left-0 origin-top-left scale-[0.45] sm:scale-[0.5] md:scale-[0.55] lg:scale-[0.6] xl:scale-[0.7]">
              {invoiceData ? (
                <InvoicePaper data={invoiceData} status="draft" showGlow />
              ) : (
                <EmptyPreviewPlaceholder />
              )}
            </div>

            {/* Hover overlay with Expand button */}
            <div
              className={cn(
                'absolute inset-0 z-20 flex items-end justify-end p-3 transition-opacity duration-200',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            >
              <button
                className="bg-zinc-900/90 backdrop-blur-sm shadow-lg text-[11px] font-medium text-zinc-300 border border-zinc-700/50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
                type="button"
              >
                <Maximize2 className="w-3 h-3" />
                Expand
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

/**
 * Error banner for invalid URL hash
 */
function UrlErrorBanner({ error }: { error: string }) {
  return (
    <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
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

/**
 * Placeholder shown when no invoice data exists
 */
function EmptyPreviewPlaceholder() {
  return (
    <div className="w-[794px] h-[1123px] bg-white rounded-sm flex items-center justify-center">
      <Text variant="body" className="text-zinc-400">
        No invoice data. Start creating or load from URL.
      </Text>
    </div>
  )
}
