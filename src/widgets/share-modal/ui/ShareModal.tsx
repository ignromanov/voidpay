'use client'

/**
 * ShareModal Component
 *
 * Modal for sharing generated invoice links via URL, QR code, or social platforms.
 * Design reference: assets/aistudio/v3/features/invoice/ui/ShareModal.tsx
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircleIcon, XIcon, ArrowRightIcon } from '@/shared/ui/icons'
import { motion, AnimatePresence } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'
import { toast } from '@/shared/lib/toast'
import type { ShareModalProps, ShareTab } from '../lib/types'
import { getTelegramShareUrl, getTwitterShareUrl } from '../lib/social-links'
import { useFocusTrap } from '../lib/use-focus-trap'
import { TabSwitcher } from './TabSwitcher'
import { LinkTab } from './LinkTab'
import { QRTab } from './QRTab'

/**
 * ShareModal - Modal for sharing invoice links
 *
 * Displays generated invoice URL with options to:
 * - Copy link to clipboard
 * - View QR code for mobile scanning
 * - Share via Telegram or Twitter
 * - Open invoice in new tab
 */
export function ShareModal({ url, invoice: _invoice, open, onOpenChange }: ShareModalProps) {
  // Note: invoice prop is reserved for future use (e.g., displaying invoice details in modal)
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
                  <QRTab url={url} />
                )}
              </div>

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
