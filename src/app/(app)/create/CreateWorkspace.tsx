'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Edit3Icon,
  EyeIcon,
  RotateCcwIcon,
  CheckIcon,
  Loader2Icon,
} from '@/shared/ui/icons'

import { parseInvoiceHash } from '@/features/invoice-codec'
import {
  validateInvoiceForGeneration,
  generateAndTrackInvoice,
  UrlSizeError,
} from '@/features/generate-link'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import { useHashFragment } from '@/shared/lib/hooks'
import { urlToRoute } from '@/shared/lib/navigation'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Heading, Text } from '@/shared/ui/typography'
import { MobileTabBar, type TabItem } from '@/shared/ui/mobile-tab-bar'
import { InvoiceForm } from '@/widgets/invoice-form'
import { InvoicePaper, InvoicePreviewModal, ScaledInvoicePreview } from '@/widgets/invoice-paper'
import { SYNC_STATUS_CONFIG } from './constants'

/**
 * CreateWorkspace — Split-pane invoice creation interface
 *
 * Features:
 * - Left pane: InvoiceForm with toggles and Generate button
 * - Right pane: Live preview with ScaledInvoicePreview
 * - Mobile: Tab bar to switch between editor and preview
 * - URL hash decoding (e.g., /create#<Base64url TLV>)
 * - Fullscreen preview modal on click
 * - Sets network theme in store for dynamic background
 */
export function CreateWorkspace() {
  const hash = useHashFragment()
  const [mobileTab, setMobileTab] = useState<string>('editor')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const activeDraft = useCreatorStore((s) => s.activeDraft)
  const updateDraft = useCreatorStore((s) => s.updateDraft)
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)
  const createNewDraft = useCreatorStore((s) => s.createNewDraft)
  const draftSyncStatus = useCreatorStore((s) => s.draftSyncStatus)

  const tabs = useMemo<TabItem[]>(
    () => [
      {
        id: 'editor',
        label: 'Editor',
        icon: <Edit3Icon className="w-4 h-4" />,
      },
      {
        id: 'preview',
        label: 'Preview',
        icon: <EyeIcon className="w-4 h-4" />,
      },
    ],
    []
  )

  // Decode URL hash on mount/change
  useEffect(() => {
    if (!hash) return

    let cancelled = false
    void (async () => {
      const result = await parseInvoiceHash(hash)
      if (cancelled) return
      if (result.success) {
        // updateDraft auto-syncs lineItems when items provided
        updateDraft(result.data)
        // Silent success - no toast per spec (avoid notification fatigue)
      } else {
        toast.error(result.error.message)
        // Do NOT clear store on error (per spec edge case)
      }
    })()
    return () => { cancelled = true }
  }, [hash, updateDraft])

  const invoiceData = useMemo(() => activeDraft?.data, [activeDraft])

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

  const handleResetInvoice = useCallback(() => {
    createNewDraft()
    toast.success('Invoice reset', {
      description: 'Started a fresh invoice with default values',
    })
  }, [createNewDraft])


  /**
   * Handle "Generate Invoice Link" button click
   *
   * 1. Validate invoice data
   * 2. Generate URL with TLV v1 encoding
   * 3. Add to history
   * 4. Open ShareModal
   */
  const handleGenerateLink = useCallback(async () => {
    if (isGenerating) return

    // Get fresh values from store at click time (not render time)
    const { activeDraft, lineItems } = useCreatorStore.getState()

    if (!activeDraft) return

    setIsGenerating(true)

    try {
      // Validate INSIDE try block
      const validation = validateInvoiceForGeneration(activeDraft.data, lineItems)

      if (!validation.isValid) {
        // Show first error as toast (most important)
        const firstError = validation.errors[0]
        toast.error('Cannot generate link', {
          description: firstError?.message ?? 'Please fill in all required fields',
        })

        // If multiple errors, show count
        if (validation.errors.length > 1) {
          toast.error(`${validation.errors.length - 1} more issue(s) found`, {
            description: 'Check the form for other missing fields',
          })
        }
        return
      }

      // Show size warning if applicable (edge case, not blocking)
      if (validation.sizeWarning) {
        // Use error style to draw attention to potential issue
        toast.error('URL size approaching limit', {
          description: 'Consider reducing notes or line items if generation fails.',
        })
      }

      // Generate URL without OG (OG is computed dynamically in ShareModal)
      const { url } = await generateAndTrackInvoice(activeDraft, lineItems)

      toast.success('Invoice link generated!', {
        description: 'Share it with your client to get paid',
      })

      // Navigate to /invoice with ?share=1 to auto-open ShareModal
      // URL is clean: /invoice?share=1#hash (no OG params)
      const invoiceUrl = new URL(url, window.location.origin)
      invoiceUrl.pathname = invoiceUrl.pathname.replace('/pay', '/invoice')
      invoiceUrl.searchParams.set('share', '1')
      router.replace(urlToRoute(invoiceUrl))
    } catch (error) {
      if (error instanceof UrlSizeError) {
        toast.error('Invoice URL is too large', {
          description: `${error.size} bytes exceeds the ${error.limit} byte limit. Try reducing notes or line items.`,
        })
      } else {
        toast.error('Failed to generate link', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating, router])

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

      {/* Mobile Tab Bar - fixed above footer (h-10 = 40px), outside document flow */}
      <div className="lg:hidden fixed bottom-12 left-0 right-0 z-30 px-4">
        <MobileTabBar tabs={tabs} activeTab={mobileTab} onTabChange={setMobileTab} />
      </div>

      {/* Main Workspace Container - form and invoice centered together */}
      {/* Mobile: pb with safe area for tab bar (5rem = 80px base + env safe area) */}
      <div
        className="mx-auto flex h-[calc(100vh-104px)] w-full flex-col lg:flex-row lg:items-stretch lg:justify-center gap-2 lg:gap-4 overflow-clip px-3 sm:px-4 lg:px-6 py-4 lg:pb-6 lg:py-6 print:h-auto print:max-w-none print:overflow-visible print:p-0"
        style={{ paddingBottom: 'max(5rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))' }}
      >
        {/* LEFT: Editor Pane (form sticks to invoice) */}
        <Card
          variant="glass"
          className={cn(
            'w-full lg:w-[400px] xl:w-[440px] 2xl:w-[480px] lg:shrink-0 flex flex-col overflow-hidden lg:max-h-full',
            mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
          )}
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Heading variant="h3" className="flex items-center gap-2">
                  <span className="text-violet-500">Invoice</span> Details
                </Heading>
                <Text variant="tiny" className="text-zinc-400">
                  Fill in the required fields marked with (*).
                </Text>
              </div>
              <Button
                onClick={handleResetInvoice}
                variant="ghost"
                size="sm"
                className="shrink-0 text-zinc-500 hover:text-zinc-300"
                title="Reset to new invoice"
              >
                <RotateCcwIcon className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            <InvoiceForm onGenerate={handleGenerateLink} isGenerating={isGenerating} />
          </div>
        </Card>

        {/* RIGHT: Preview Pane - stretches to fill available height */}
        <div
          className={cn(
            'relative flex items-start justify-center',
            // Fill available space, let ScaledInvoicePreview handle sizing
            'h-full min-w-[300px] sm:min-w-[400px] lg:min-w-[580px]',
            // Same padding as form (p-4 sm:p-5 lg:p-6)
            'p-4 sm:p-5 lg:p-6',
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Screen-only scaled preview (hidden during print to avoid flicker) */}
          <ScaledInvoicePreview
            preset="editor"
            printable
            networkId={invoiceData?.networkId ?? 1}
            onClick={handlePreviewClick}
            showExpandOverlay
          >
            <InvoicePaper data={invoiceData} status="draft" />
          </ScaledInvoicePreview>

          {/* Floating Live Preview badge with sync status */}
          <div className="absolute bottom-6 sm:bottom-6 left-1/2 z-20 -translate-x-1/2 pointer-events-none">
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-[10px] whitespace-nowrap text-zinc-400 shadow-lg backdrop-blur">
              {SYNC_STATUS_CONFIG[draftSyncStatus].icon === 'loader' ? (
                <Loader2Icon className="h-3 w-3 animate-spin text-amber-500" />
              ) : SYNC_STATUS_CONFIG[draftSyncStatus].icon === 'check' ? (
                <CheckIcon className="h-3 w-3 text-green-500" />
              ) : (
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    SYNC_STATUS_CONFIG[draftSyncStatus].dotColor,
                    SYNC_STATUS_CONFIG[draftSyncStatus].animate && 'animate-pulse'
                  )}
                />
              )}
              {SYNC_STATUS_CONFIG[draftSyncStatus].label}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
