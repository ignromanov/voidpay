'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { CheckCircleIcon } from '@/shared/ui/icons'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/utils'
import { encodeOGPreview } from '@/features/invoice-codec'
import type { ShareModalProps, ShareTab } from '../lib/types'
import { getTelegramShareUrl, getTwitterShareUrl, getEmailShareUrl } from '../lib/social-links'
import { TabSwitcher } from './TabSwitcher'
import { LinkTab } from './LinkTab'
import { InvoiceSummary } from './InvoiceSummary'

function QRSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-4">
      <div className="w-full max-w-[300px] rounded-xl bg-zinc-800/50 p-4">
        <div className="aspect-square w-full animate-pulse rounded-lg bg-zinc-700/50" />
      </div>
      <div className="h-3 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="h-8 w-32 animate-pulse rounded-md bg-zinc-800" />
    </div>
  )
}

const QRTab = dynamic(
  () => import('@/features/payment-qr').then(mod => ({ default: mod.QRTab })),
  { ssr: false, loading: () => <QRSkeleton /> }
)

export function ShareModal({ url, invoice, open, onOpenChange, includeOg, onOgToggle }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('link')
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Compute share URL: add OG params dynamically from invoice when toggled on
  const shareUrl = useMemo(() => {
    if (!includeOg || !invoice) return url
    try {
      const ogData = encodeOGPreview(invoice)
      const absolute = url.startsWith('http') ? url : `${window.location.origin}${url}`
      const parsed = new URL(absolute)
      parsed.searchParams.set('og', ogData)
      const withOg = parsed.pathname + parsed.search + parsed.hash
      return url.startsWith('http') ? parsed.href : withOg
    } catch {
      return url
    }
  }, [url, includeOg, invoice])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback handled by CopyButton if needed
    }
  }, [shareUrl])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const { telegramUrl, twitterUrl, emailUrl } = useMemo(() => ({
    telegramUrl: getTelegramShareUrl(shareUrl),
    twitterUrl: getTwitterShareUrl(shareUrl),
    emailUrl: getEmailShareUrl(shareUrl),
  }), [shareUrl])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'border-violet-500/25 bg-zinc-950 p-0 overflow-hidden',
          'shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5),0_0_40px_-10px_rgba(139,92,246,0.2)]',
          'transition-shadow duration-500'
        )}
      >
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />

        {/* Header */}
        <div className="space-y-1 px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-100">
            <CheckCircleIcon size={20} className="text-violet-500" />
            Invoice Ready
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            Share this link to get paid
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 pb-6">
          {invoice && <InvoiceSummary invoice={invoice} />}
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="min-h-[200px]">
            {activeTab === 'link' ? (
              <LinkTab
                url={shareUrl}
                copied={copied}
                onCopy={handleCopy}
                telegramUrl={telegramUrl}
                twitterUrl={twitterUrl}
                emailUrl={emailUrl}
                includeOg={includeOg}
                onOgToggle={onOgToggle}
              />
            ) : (
              <QRTab url={shareUrl} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
