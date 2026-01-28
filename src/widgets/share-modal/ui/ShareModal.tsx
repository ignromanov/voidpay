'use client'

/**
 * ShareModal Component
 *
 * Modal for sharing generated invoice links via URL, QR code, or social platforms.
 * Design reference: assets/aistudio/v3/features/invoice/ui/ShareModal.tsx
 */

import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircle,
  X,
  Check,
  Copy,
  Send,
  Twitter,
  ArrowRight,
  QrCode,
  Link as LinkIcon,
  Download,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from '@/shared/ui/motion'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'
import { toast } from '@/shared/lib/toast'
import type { ShareModalProps, ShareTab } from '../lib/types'
import { getTelegramShareUrl, getTwitterShareUrl } from '../lib/social-links'

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

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: show error toast
      toast.error('Failed to copy link. Please copy manually.')
    }
  }, [url])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleDownloadQR = useCallback(() => {
    const svg = document.querySelector('[data-qr-code] svg') as SVGSVGElement | null
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    img.onload = () => {
      // Add padding for white background
      const padding = 32
      canvas.width = img.width + padding * 2
      canvas.height = img.height + padding * 2

      // Fill white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw QR in center
      ctx.drawImage(img, padding, padding)

      const link = document.createElement('a')
      link.download = 'voidpay-invoice-qr.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }, [])

  // Don't render if not open or not in browser
  if (!open || typeof document === 'undefined') {
    return null
  }

  const telegramUrl = getTelegramShareUrl(url)
  const twitterUrl = getTwitterShareUrl(url)

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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          >
            <div className="space-y-6 p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Heading variant="h3" className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-violet-500" />
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
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs - Custom segmented control (NOT Radix Tabs) */}
              <div className="flex rounded-xl border border-zinc-800 bg-zinc-950/50 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  className={cn(
                    'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors',
                    activeTab === 'link'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <LinkIcon className="h-4 w-4" /> Link
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className={cn(
                    'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-colors',
                    activeTab === 'qr'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <QrCode className="h-4 w-4" /> QR Code
                </button>
              </div>

              {/* Tab content */}
              <div className="min-h-[200px]">
                {activeTab === 'link' ? (
                  <motion.div
                    key="link-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Link display with copy button */}
                    <div className="space-y-2">
                      <Text variant="label" className="text-zinc-400">
                        Permalink
                      </Text>
                      <div className="flex gap-2">
                        <div
                          className="max-h-24 flex-1 cursor-text select-all overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed [&::selection]:bg-violet-500/30 [&::selection]:text-white [&_*::selection]:bg-violet-500/30 [&_*::selection]:text-white"
                          style={{ wordBreak: 'break-all' }}
                          onClick={(e) => {
                            const selection = window.getSelection()
                            const range = document.createRange()
                            range.selectNodeContents(e.currentTarget)
                            selection?.removeAllRanges()
                            selection?.addRange(range)
                          }}
                        >
                          {(() => {
                            // Split URL into base path and query/hash
                            const match = url.match(/^(https?:\/\/[^?#]+)(.*)$/)
                            const basePath = match?.[1] ?? url
                            const rest = match?.[2] ?? ''
                            return (
                              <>
                                <span className="text-violet-400">{basePath}</span>
                                {rest && <span className="text-zinc-500">{rest}</span>}
                              </>
                            )
                          })()}
                        </div>
                        <Button
                          onClick={handleCopy}
                          variant={copied ? 'secondary' : 'secondary'}
                          className={cn(
                            'w-24 shrink-0',
                            copied && 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          )}
                        >
                          {copied ? (
                            <>
                              <Check className="mr-1 h-4 w-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-4 w-4" /> Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Social share buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => window.open(telegramUrl, '_blank', 'noopener,noreferrer')}
                        className="!cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-[#0088cc]/20 bg-[#0088cc]/10 py-3 text-sm font-bold text-[#0088cc] transition-colors hover:bg-[#0088cc]/20"
                      >
                        <Send className="h-4 w-4" /> Telegram
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(twitterUrl, '_blank', 'noopener,noreferrer')}
                        className="!cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                      >
                        <Twitter className="h-4 w-4" /> Twitter / X
                      </button>
                    </div>

                    {/* Privacy warning */}
                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-4">
                      <Text variant="tiny" className="text-violet-300">
                        <strong>Note:</strong> VoidPay is stateless. This link contains all the
                        invoice data securely encoded. If you lose this link, the invoice is lost
                        forever.
                      </Text>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="qr-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col items-center justify-center space-y-4 py-4"
                  >
                    {/* QR code with white background and VoidPay logo */}
                    <div data-qr-code className="w-full max-w-[300px] rounded-xl bg-white p-4 shadow-2xl">
                      <QRCodeSVG
                        value={url}
                        size={268}
                        level="H" // High error correction allows logo overlay
                        marginSize={1}
                        className="h-auto w-full"
                        imageSettings={{
                          src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ4IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjM0IiBmaWxsPSJub25lIiBzdHJva2U9IiM3QzNBRUQiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdDM0FFRCIgc3Ryb2tlLXdpZHRoPSIxLjUiIG9wYWNpdHk9IjAuNyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMxIiBmaWxsPSIjMDkwOTBCIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjIiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=',
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </div>
                    <Text variant="tiny" className="max-w-xs text-center text-zinc-400">
                      Show this QR to your client — they can scan and pay from their phone.
                    </Text>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDownloadQR}
                    >
                      <Download className="mr-1.5 h-4 w-4" /> Download QR
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Footer - Open Invoice button */}
              <div className="flex gap-3 pt-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 !cursor-pointer"
                >
                  <Button variant="default" className="w-full !cursor-pointer">
                    Open Invoice <ArrowRight className="ml-2 h-4 w-4" />
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
