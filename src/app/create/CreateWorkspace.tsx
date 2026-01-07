'use client'

import { useLayoutEffect, useEffect, useState, useCallback, useMemo } from 'react'
import { Edit3, Eye, Maximize2 } from 'lucide-react'

import { parseInvoiceHash } from '@/features/invoice-codec'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme, NETWORK_GLOW_SHADOWS } from '@/entities/network'
import { useHashFragment } from '@/shared/lib/hooks'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { Card, Heading, Text, MobileTabBar, type TabItem } from '@/shared/ui'
import { InvoiceForm, MagicDustToggle } from '@/widgets/invoice-form'
import { InvoicePaper, InvoicePreviewModal, ScaledInvoicePreview } from '@/widgets/invoice-paper'

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

      {/* Main Workspace Container */}
      <div className="mx-auto flex h-[calc(100vh-104px)] w-full max-w-[1400px] flex-col lg:flex-row gap-6 overflow-clip px-2 sm:px-4 print:h-auto print:max-w-none print:overflow-visible print:p-0">
        {/* LEFT: Editor Pane */}
        <Card
          variant="glass"
          className={cn(
            'w-full lg:w-[480px] xl:w-[500px] flex flex-col overflow-hidden',
            mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
          )}
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1">
              <Heading variant="h3" className="flex items-center gap-2">
                <span className="text-violet-500">Invoice</span> Details
              </Heading>
              <Text variant="tiny" className="text-zinc-400">
                Fill in the required fields marked with (*).
              </Text>
            </div>

            <InvoiceForm />
            <MagicDustToggle />
          </div>
        </Card>

        {/* RIGHT: Preview Pane */}
        <div
          className={cn(
            'flex-1 relative flex items-center justify-center print:hidden',
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

          {/* Floating Real-time Preview badge (V3 ref) */}
          <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 pointer-events-none">
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-[10px] whitespace-nowrap text-zinc-400 shadow-lg backdrop-blur">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Real-time Preview
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
