'use client'

import { useLayoutEffect, useEffect, useState, useCallback, useMemo } from 'react'
import { Edit3, Eye, Maximize2, RotateCcw, Check, Loader2 } from 'lucide-react'

import { parseInvoiceHash } from '@/features/invoice-codec'
import { useCreatorStore, type DraftSyncStatus } from '@/entities/creator'
import { getNetworkTheme, NETWORK_GLOW_SHADOWS } from '@/entities/network'
import { useHashFragment } from '@/shared/lib/hooks'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { Button, Card, Heading, Text, MobileTabBar, type TabItem } from '@/shared/ui'
import { InvoiceForm, MagicDustToggle } from '@/widgets/invoice-form'
import { InvoicePaper, InvoicePreviewModal, ScaledInvoicePreview } from '@/widgets/invoice-paper'

/** Live Preview badge configuration based on sync status */
const SYNC_STATUS_CONFIG: Record<
  DraftSyncStatus,
  { label: string; dotColor: string; animate: boolean; icon?: 'check' | 'loader' }
> = {
  idle: {
    label: 'Live Preview',
    dotColor: 'bg-green-500',
    animate: true,
  },
  syncing: {
    label: 'Syncing...',
    dotColor: 'bg-amber-500',
    animate: true,
    icon: 'loader',
  },
  synced: {
    label: 'Synced',
    dotColor: 'bg-green-500',
    animate: false,
    icon: 'check',
  },
}

/**
 * CreateWorkspace — Split-pane invoice creation interface
 *
 * Features:
 * - Left pane: InvoiceForm + MagicDustToggle
 * - Right pane: Live preview with ScaledInvoicePreview
 * - Mobile: Tab bar to switch between editor and preview
 * - URL hash decoding (e.g., /create#H4sI...)
 * - Fullscreen preview modal on click
 * - Sets network theme in store for dynamic background
 */
export function CreateWorkspace() {
  const hash = useHashFragment()
  const [mobileTab, setMobileTab] = useState<string>('editor')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
        icon: <Edit3 className="w-4 h-4" />,
      },
      {
        id: 'preview',
        label: 'Preview',
        icon: <Eye className="w-4 h-4" />,
      },
    ],
    []
  )

  // Decode URL hash on mount/change (useLayoutEffect for no visual flicker)
  useLayoutEffect(() => {
    if (!hash) return

    const result = parseInvoiceHash(hash)
    if (result.success) {
      // updateDraft auto-syncs lineItems when items provided
      updateDraft(result.data)
      // Silent success - no toast per spec (avoid notification fatigue)
    } else {
      toast.error(result.error.message)
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

  const handleResetInvoice = useCallback(() => {
    createNewDraft()
    toast.success('Invoice reset', {
      description: 'Started a fresh invoice with default values',
    })
  }, [createNewDraft])

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

      {/* Mobile Tab Bar */}
      <div className="lg:hidden sticky top-0 z-20 px-4 pt-4">
        <MobileTabBar tabs={tabs} activeTab={mobileTab} onTabChange={setMobileTab} />
      </div>

      {/* Main Workspace Container - form and invoice centered together */}
      <div className="mx-auto flex h-[calc(100vh-104px)] w-full flex-col lg:flex-row lg:items-stretch lg:justify-center gap-2 lg:gap-4 overflow-clip px-3 sm:px-4 lg:px-6 py-4 lg:py-6 print:h-auto print:max-w-none print:overflow-visible print:p-0">
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
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            <InvoiceForm />
            <MagicDustToggle />
          </div>
        </Card>

        {/* RIGHT: Preview Pane - stretches to fill available height */}
        <div
          className={cn(
            'relative flex items-start justify-center print:hidden',
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
            glowClassName={NETWORK_GLOW_SHADOWS[invoiceData?.networkId ?? 1]}
            onClick={handlePreviewClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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

          {/* Floating Live Preview badge with sync status */}
          <div className="absolute bottom-6 sm:bottom-6 left-1/2 z-20 -translate-x-1/2 pointer-events-none">
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-[10px] whitespace-nowrap text-zinc-400 shadow-lg backdrop-blur">
              {SYNC_STATUS_CONFIG[draftSyncStatus].icon === 'loader' ? (
                <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
              ) : SYNC_STATUS_CONFIG[draftSyncStatus].icon === 'check' ? (
                <Check className="h-3 w-3 text-green-500" />
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

        {/* Print-only invoice (hidden on screen, full-size for print) */}
        <div className="invoice-print-target hidden print:block">
          <InvoicePaper data={invoiceData} status="draft" />
        </div>
      </div>
    </>
  )
}
