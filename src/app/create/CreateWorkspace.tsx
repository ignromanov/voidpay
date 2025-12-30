'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { AlertCircle, Maximize2 } from 'lucide-react'

import { decodeInvoice } from '@/features/invoice-codec'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import { useHashFragment } from '@/shared/lib/hooks'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { PageLayout, Text } from '@/shared/ui'
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
      <div className="flex-1 flex flex-col max-w-[1400px] w-full mx-auto min-h-0">
        {/* Error Banner */}
        {decodeError && <UrlErrorBanner error={decodeError} />}

        {/* Preview container */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          {/* Preview wrapper with subtle bg */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl bg-zinc-950/30 p-4 sm:p-8 lg:p-12">
            {/* Clickable area ONLY on invoice */}
            <div
              className="relative cursor-zoom-in group"
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
              {/* Responsive scale — larger on mobile for visibility */}
              <div className="scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.65] xl:scale-[0.75] 2xl:scale-[0.85] origin-center shadow-2xl transition-transform duration-300">
                {invoiceData ? (
                  <InvoicePaper data={invoiceData} status="draft" showGlow />
                ) : (
                  <EmptyPreviewPlaceholder />
                )}
              </div>

              {/* Hover overlay with animation — only on invoice */}
              <div
                className={cn(
                  'absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 rounded-sm',
                  isHovered ? 'opacity-100 bg-black/20' : 'opacity-0 bg-transparent'
                )}
              >
                <button
                  className={cn(
                    'bg-zinc-900/95 backdrop-blur-md shadow-2xl text-sm font-medium text-violet-200 border border-violet-500/30 flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-300',
                    'hover:bg-zinc-800 hover:text-white hover:border-violet-500/50 hover:shadow-violet-500/20',
                    isHovered ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'
                  )}
                  type="button"
                >
                  <Maximize2 className="w-5 h-5" />
                  Click to expand
                </button>
              </div>
            </div>

            {/* Real-time Preview badge — below invoice, always visible */}
            <div className="mt-6 bg-zinc-900/90 backdrop-blur border border-zinc-800 text-zinc-400 text-[10px] font-mono py-1.5 px-4 rounded-full flex items-center gap-2 shadow-lg whitespace-nowrap pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Real-time Preview
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
