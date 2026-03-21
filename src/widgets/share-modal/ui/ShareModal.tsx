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
import type { ShareModalProps, ShareTab } from '../lib/types'
import { getTelegramShareUrl, getTwitterShareUrl, getEmailShareUrl } from '../lib/social-links'
import { TabSwitcher } from './TabSwitcher'
import { LinkTab } from './LinkTab'
import { InvoiceSummary } from './InvoiceSummary'

const QRTab = dynamic(
  () => import('@/features/payment-qr').then(mod => ({ default: mod.QRTab })),
  { ssr: false }
)

export function ShareModal({ url, invoice, open, onOpenChange, includeOg, onOgToggle }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('link')
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback handled by CopyButton if needed
    }
  }, [url])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const { telegramUrl, twitterUrl, emailUrl } = useMemo(() => ({
    telegramUrl: getTelegramShareUrl(url),
    twitterUrl: getTwitterShareUrl(url),
    emailUrl: getEmailShareUrl(url),
  }), [url])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'border-violet-500/25 bg-zinc-900 p-0',
          'shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5),0_0_40px_-10px_rgba(139,92,246,0.2)]',
          'motion-safe:animate-glow-pulse'
        )}
      >
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
                url={url}
                copied={copied}
                onCopy={handleCopy}
                telegramUrl={telegramUrl}
                twitterUrl={twitterUrl}
                emailUrl={emailUrl}
                includeOg={includeOg}
                onOgToggle={onOgToggle}
              />
            ) : invoice ? (
              <QRTab invoice={invoice} />
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
