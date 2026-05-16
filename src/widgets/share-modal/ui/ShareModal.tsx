'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { CheckCircleIcon, LinkIcon, QrCodeIcon } from '@/shared/ui/icons'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/utils'
import { copyToClipboard } from '@/shared/lib/clipboard'
import { toAbsoluteUrl } from '@/shared/config/urls'
import { encodeOGPreview } from '@/features/invoice-codec'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui'
import type { ShareModalProps, ShareTab } from '../lib/types'
import { getTelegramShareUrl, getTwitterShareUrl, getEmailShareUrl } from '../lib/social-links'
import { LinkTab } from './LinkTab'
import { InvoiceSummary } from './InvoiceSummary'

function QRSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-4">
      <div className="w-full max-w-[280px] sm:max-w-[300px] rounded-xl bg-zinc-800/50 p-4">
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

function toShareTab(v: string): ShareTab {
  return v === 'qr' ? 'qr' : 'link'
}

export function ShareModal({ url, invoice, open, onOpenChange, includeOg, onOgToggle }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('link')
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Compute share URL: always absolute, add OG params when toggled on
  const shareUrl = useMemo(() => {
    try {
      const absolute = toAbsoluteUrl(url)
      const parsed = new URL(absolute)
      if (includeOg && invoice) {
        parsed.searchParams.set('og', encodeOGPreview(invoice))
      }
      return parsed.href
    } catch {
      return toAbsoluteUrl(url)
    }
  }, [url, includeOg, invoice])

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(shareUrl)
    if (ok) {
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
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
          'border-violet-500/25 bg-zinc-950 p-0',
          'max-w-[calc(100vw-2rem)] sm:max-w-lg',
          'shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5),0_0_40px_-10px_rgba(139,92,246,0.2)]',
          'transition-shadow duration-500'
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />

        <div className="space-y-1 px-4 pt-4 sm:px-6 sm:pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-100">
            <CheckCircleIcon size={20} className="text-violet-500" />
            Invoice Ready
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            Share this link to get paid
          </DialogDescription>
        </div>

        <div className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          {invoice && <InvoiceSummary invoice={invoice} />}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(toShareTab(v))}>
            <TabsList className="w-full">
              <TabsTrigger value="link" className="flex-1 gap-2"><LinkIcon size={16} /> Link</TabsTrigger>
              <TabsTrigger value="qr" className="flex-1 gap-2"><QrCodeIcon size={16} /> QR Code</TabsTrigger>
            </TabsList>
            <div className="min-h-[200px]">
              <TabsContent value="link">
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
              </TabsContent>
              <TabsContent value="qr">
                <QRTab url={shareUrl} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
