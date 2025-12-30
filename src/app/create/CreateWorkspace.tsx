'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'

import { decodeInvoice } from '@/features/invoice-codec'
import { useCreatorStore } from '@/entities/creator'
import { useHashFragment } from '@/shared/lib/hooks'
import { toast } from '@/shared/lib/toast'
import { Text } from '@/shared/ui/typography'
import { InvoicePaper, InvoicePreviewModal } from '@/widgets/invoice-paper'
import { PixiBackground } from '@/widgets/network-background'
import type { NetworkTheme } from '@/widgets/network-background'

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
  const networkTheme = useMemo((): NetworkTheme => {
    if (!invoiceData?.networkId) return 'ethereum'
    const networkMap: Record<number, NetworkTheme> = {
      1: 'ethereum',
      10: 'optimism',
      137: 'polygon',
      42161: 'arbitrum',
    }
    return networkMap[invoiceData.networkId] || 'ethereum'
  }, [invoiceData?.networkId])

  const handlePreviewClick = useCallback(() => {
    if (invoiceData) {
      setIsPreviewOpen(true)
    }
  }, [invoiceData])

  return (
    <>
      {/* Network-themed animated background */}
      <PixiBackground theme={networkTheme} />

      {/* Fullscreen preview modal */}
      {invoiceData && (
        <InvoicePreviewModal
          data={invoiceData}
          status="draft"
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      )}

      <div className="min-h-screen pt-20 pb-8 px-4">
        <div className="max-w-[1400px] mx-auto">
          {/* Error Banner */}
          {decodeError && <UrlErrorBanner error={decodeError} />}

          {/* Preview Area */}
          <div className="flex items-center justify-center">
            <div
              className="cursor-zoom-in group relative"
              onClick={handlePreviewClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handlePreviewClick()
                }
              }}
            >
              {/* Click to expand badge */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-400 text-[10px] font-mono py-1 px-3 rounded-full">
                Click to expand
              </div>

              {/* Scaled preview with responsive breakpoints */}
              <div className="scale-[0.45] md:scale-[0.55] 2xl:scale-[0.65] origin-center transition-transform">
                {invoiceData ? (
                  <InvoicePaper data={invoiceData} status="draft" />
                ) : (
                  <EmptyPreviewPlaceholder />
                )}
              </div>
            </div>
          </div>

          {/* Real-time Preview Indicator */}
          <div className="flex justify-center mt-6">
            <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-400 text-[10px] font-mono py-1 px-3 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Real-time Preview
            </div>
          </div>
        </div>
      </div>
    </>
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
