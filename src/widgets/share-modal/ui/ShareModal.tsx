'use client'

import dynamic from 'next/dynamic'

/**
 * ShareModal Component
 *
 * Modal for sharing generated invoice links via URL, QR code, or social platforms.
 * Design reference: assets/aistudio/v3/features/invoice/ui/ShareModal.tsx
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircleIcon, XIcon, ArrowRightIcon, ChevronDownIcon, CopyIcon } from '@/shared/ui/icons'
import { motion, AnimatePresence } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'
import { toast } from '@/shared/lib/toast'
import type { ShareModalProps, ShareTab } from '../lib/types'
import { getTelegramShareUrl, getTwitterShareUrl } from '../lib/social-links'
import { useFocusTrap } from '../lib/use-focus-trap'
import { TabSwitcher } from './TabSwitcher'
import { LinkTab } from './LinkTab'
const QRTab = dynamic(
  () => import('@/features/payment-qr').then(mod => ({ default: mod.QRTab })),
  { ssr: false }
)

/**
 * ShareModal - Modal for sharing invoice links
 *
 * Displays generated invoice URL with options to:
 * - Copy link to clipboard
 * - View QR code for mobile scanning
 * - Share via Telegram or Twitter
 * - Open invoice in new tab
 */
export function ShareModal({ url, invoice, open, onOpenChange }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('link')
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  // Focus trap and keyboard management
  useFocusTrap(modalRef, open, handleClose)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)

      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      // Fallback: show error toast
      toast.error('Failed to copy link. Please copy manually.')
    }
  }, [url])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  // Memoize social URLs
  const { telegramUrl, twitterUrl } = useMemo(
    () => ({
      telegramUrl: getTelegramShareUrl(url),
      twitterUrl: getTwitterShareUrl(url),
    }),
    [url]
  )

  // Memoize URL parsing for display
  const { basePath, rest } = useMemo(() => {
    const match = url.match(/^(https?:\/\/[^?#]+)(.*)$/)
    return {
      basePath: match?.[1] ?? url,
      rest: match?.[2] ?? '',
    }
  }, [url])

  // Don't render if not open or not in browser
  if (!open || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          >
            <div className="space-y-6 p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Heading variant="h3" id="share-modal-title" className="flex items-center gap-2">
                    <CheckCircleIcon size={20} className="text-violet-500" />
                    Invoice Generated
                  </Heading>
                  <Text variant="small" className="text-zinc-400">
                    Your stateless invoice is ready. Share it to get paid.
                  </Text>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-zinc-500 transition-colors hover:text-white"
                  aria-label="Close modal"
                >
                  <XIcon size={20} />
                </button>
              </div>

              {/* Tab switcher */}
              <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Tab content */}
              <div className="min-h-[200px]">
                {activeTab === 'link' ? (
                  <LinkTab
                    basePath={basePath}
                    rest={rest}
                    copied={copied}
                    onCopy={handleCopy}
                    telegramUrl={telegramUrl}
                    twitterUrl={twitterUrl}
                  />
                ) : (
                  <QRTab invoice={invoice} />
                )}
              </div>

              {/* Tracking link for creator (collapsible) */}
              <TrackingLinkSection url={url} />

              {/* Footer - Open Invoice button */}
              <div className="flex gap-3 pt-2">
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="default" className="w-full">
                    Open Invoice <ArrowRightIcon size={16} className="ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/**
 * Collapsible section with /invoice tracking link (copy-only, no social share).
 * Replaces /pay with /invoice in the URL for creator's private tracking view.
 */
function TrackingLinkSection({ url }: { url: string }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const trackingUrl = useMemo(() => {
    try {
      const parsed = new URL(url)
      return `${parsed.origin}/invoice${parsed.search}${parsed.hash}`
    } catch {
      return url.replace('/pay', '/invoice')
    }
  }, [url])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy tracking link')
    }
  }, [trackingUrl])

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-800/30">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:text-zinc-300"
      >
        <span>Save for yourself</span>
        <ChevronDownIcon
          size={14}
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="border-t border-zinc-800 px-4 py-3">
          <Text variant="tiny" className="mb-2 text-zinc-500">
            Track payment status (not shared with payers)
          </Text>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            {copied ? (
              <CheckCircleIcon size={14} className="text-emerald-400" />
            ) : (
              <CopyIcon size={14} />
            )}
            <span className="truncate">{trackingUrl}</span>
          </button>
        </div>
      )}
    </div>
  )
}
