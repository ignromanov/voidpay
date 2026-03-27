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

import { track, AnalyticsEvent } from '@/features/analytics'
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

export function CreateWorkspace() {
  const hash = useHashFragment()
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const activeDraft = useCreatorStore((s) => s.activeDraft)
  const updateDraft = useCreatorStore((s) => s.updateDraft)
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)
  const createNewDraft = useCreatorStore((s) => s.createNewDraft)
  const clearDraft = useCreatorStore((s) => s.clearDraft)
  const draftSyncStatus = useCreatorStore((s) => s.draftSyncStatus)

  useEffect(() => {
    if (!activeDraft) createNewDraft()
  }, [activeDraft, createNewDraft])

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

  useEffect(() => {
    if (!hash) return

    let cancelled = false
    void (async () => {
      const result = await parseInvoiceHash(hash)
      if (cancelled) return
      if (result.success) {
        updateDraft(result.data)
      } else {
        // Do NOT clear store on error (per spec edge case)
        toast.error(result.error.message)
      }
    })()
    return () => { cancelled = true }
  }, [hash, updateDraft])

  const invoiceData = activeDraft?.data

  useEffect(() => {
    const theme = getNetworkTheme(invoiceData?.networkId ?? 1)
    setNetworkTheme(theme)
  }, [invoiceData?.networkId, setNetworkTheme])

  const handlePreviewClick = useCallback(() => {
    if (useCreatorStore.getState().activeDraft?.data) {
      setIsPreviewOpen(true)
    }
  }, [])

  const handleResetInvoice = useCallback(() => {
    createNewDraft()
    toast.success('Form cleared', {
      description: 'All fields reset to defaults',
    })
  }, [createNewDraft])

  const handleGenerateLink = useCallback(async () => {
    if (isGenerating) return

    const { activeDraft, lineItems } = useCreatorStore.getState()
    if (!activeDraft) return

    setIsGenerating(true)

    try {
      const validation = validateInvoiceForGeneration(activeDraft.data, lineItems)

      if (!validation.isValid) {
        track(AnalyticsEvent.ERROR_GENERATE, { error_type: 'VALIDATION' })
        const firstError = validation.errors[0]
        toast.error('Cannot generate link', {
          description: firstError?.message ?? 'Please fill in all required fields',
        })
        return
      }

      if (validation.sizeWarning) {
        toast.error('URL size approaching limit', {
          description: 'Consider reducing notes or line items if generation fails.',
        })
      }

      const { url } = await generateAndTrackInvoice(activeDraft, lineItems)

      const networkName = activeDraft.data.networkId === 42161 ? 'arbitrum'
        : activeDraft.data.networkId === 10 ? 'optimism'
        : activeDraft.data.networkId === 137 ? 'polygon'
        : 'ethereum'
      track(AnalyticsEvent.INVOICE_CREATE, {
        network: networkName,
        token_symbol: activeDraft.data.currency ?? 'ETH',
        line_item_count: lineItems.length,
      })

      const fieldsUsed: string[] = []
      const d = activeDraft.data
      if (d.notes) fieldsUsed.push('notes')
      if (d.from?.name) fieldsUsed.push('sender_name')
      if (d.from?.email) fieldsUsed.push('sender_email')
      if (d.client?.name) fieldsUsed.push('recipient_name')
      if (d.client?.email) fieldsUsed.push('recipient_email')
      if (d.dueAt) fieldsUsed.push('due_date')
      if (d.tax) fieldsUsed.push('tax')
      if (d.discount) fieldsUsed.push('discount')
      if (d.magicDust) fieldsUsed.push('magic_dust')
      if (useCreatorStore.getState().preferences?.includeOgImage) fieldsUsed.push('og_preview')
      if (fieldsUsed.length > 0) {
        track(AnalyticsEvent.INVOICE_FIELD_USAGE, { fields_used: fieldsUsed.join(',') })
      }

      toast.success('Invoice link generated!', {
        description: 'Share it with your client to get paid',
      })

      // Clear draft so next /create visit starts fresh with new ID
      clearDraft()

      // Navigate to /invoice?share=1#hash to auto-open ShareModal
      const invoiceUrl = new URL(url, window.location.origin)
      invoiceUrl.pathname = invoiceUrl.pathname.replace('/pay', '/invoice')
      invoiceUrl.searchParams.set('share', '1')
      router.replace(urlToRoute(invoiceUrl))
    } catch (error) {
      if (error instanceof UrlSizeError) {
        track(AnalyticsEvent.ERROR_GENERATE, { error_type: 'URL_TOO_LARGE' })
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
  }, [isGenerating, clearDraft, router])

  return (
    <>
      {invoiceData && (
        <InvoicePreviewModal
          data={invoiceData}
          status="draft"
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      )}

      <div className="lg:hidden fixed bottom-12 left-0 right-0 z-30 px-4">
        <MobileTabBar tabs={tabs} activeTab={mobileTab} onTabChange={(id) => setMobileTab(id as 'editor' | 'preview')} />
      </div>

      {/* Safe area padding for mobile tab bar */}
      <div
        className="mx-auto flex h-[calc(100vh-104px)] w-full flex-col lg:flex-row lg:items-stretch lg:justify-center gap-2 lg:gap-4 overflow-clip px-3 sm:px-4 lg:px-6 py-4 lg:pb-6 lg:py-6 print:h-auto print:max-w-none print:overflow-visible print:p-0"
        style={{ paddingBottom: 'max(5rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))' }}
      >
        {/* Editor Pane */}
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
                title="Clear form and reset to defaults"
              >
                <RotateCcwIcon className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            <InvoiceForm onGenerate={handleGenerateLink} isGenerating={isGenerating} />
          </div>
        </Card>

        {/* Preview Pane */}
        <div
          className={cn(
            'relative flex items-start justify-center',
            'h-full min-w-[300px] sm:min-w-[400px] lg:min-w-[580px]',
            'p-4 sm:p-5 lg:p-6',
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          )}
        >
          <ScaledInvoicePreview
            preset="editor"
            printable
            networkId={invoiceData?.networkId ?? 1}
            onClick={handlePreviewClick}
            showExpandOverlay
          >
            <InvoicePaper data={invoiceData} status="draft" />
          </ScaledInvoicePreview>

          {/* Floating sync status badge */}
          {(() => {
            const sync = SYNC_STATUS_CONFIG[draftSyncStatus]
            return (
              <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 pointer-events-none">
                <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-[10px] whitespace-nowrap text-zinc-400 shadow-lg backdrop-blur">
                  {sync.icon === 'loader' ? (
                    <Loader2Icon className="h-3 w-3 animate-spin text-amber-500" />
                  ) : sync.icon === 'check' ? (
                    <CheckIcon className="h-3 w-3 text-green-500" />
                  ) : (
                    <div className={cn('h-1.5 w-1.5 rounded-full', sync.dotColor, sync.animate && 'animate-pulse')} />
                  )}
                  {sync.label}
                </div>
              </div>
            )
          })()}
        </div>

      </div>
    </>
  )
}
