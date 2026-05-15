'use client'

import { useState, useEffect } from 'react'
import { AlertTriangleIcon, ExternalLinkIcon } from '@/shared/ui/icons'
import { isInAppBrowser, isTelegramWebView } from '@/shared/lib'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/button'

/**
 * Shows a contextual in-app browser warning:
 *
 * - Telegram WebView: passive bottom panel with "Copy link" CTA
 *   (non-blocking — invoice is fully visible, GH#214 D+B UX pivot)
 * - Other in-app browsers (Instagram, FB, X…): dismissible banner
 * - Regular browsers: null
 */

interface InAppBrowserGuardProps {
  onShowQRClick?: (() => void) | undefined
}

export function InAppBrowserGuard({ onShowQRClick }: InAppBrowserGuardProps) {
  const [mode, setMode] = useState<'telegram' | 'banner' | 'none'>('none')

  useEffect(() => {
    if (isTelegramWebView()) {
      setMode('telegram')
    } else if (isInAppBrowser()) {
      setMode('banner')
    }
  }, [])

  if (mode === 'telegram') return <TelegramBottomPanel onShowQRClick={onShowQRClick} />
  if (mode === 'banner') return <InAppBrowserBanner />
  return null
}

// ---------------------------------------------------------------------------
// Telegram passive bottom panel
// ---------------------------------------------------------------------------

interface TelegramBottomPanelProps {
  onShowQRClick?: (() => void) | undefined
}

function TelegramBottomPanel({ onShowQRClick }: TelegramBottomPanelProps) {
  const [clipboardFailed, setClipboardFailed] = useState(false)

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied — paste into Safari or Chrome')
    } catch {
      // Clipboard API unavailable (iOS < 13.4, permissions denied)
      setClipboardFailed(true)
    }
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-amber-500/30 bg-zinc-900/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <AlertTriangleIcon className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="min-w-0 flex-1 text-sm text-zinc-300">
            Wallet connect doesn&apos;t work in Telegram — open in Safari/Chrome to pay
          </p>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCopyLink}
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            Copy link
          </Button>

          {onShowQRClick && (
            <button
              type="button"
              onClick={onShowQRClick}
              className="min-h-[36px] rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
            >
              Show QR Code
            </button>
          )}
        </div>

        {clipboardFailed && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs text-zinc-500">Tap &amp; hold to copy:</p>
            <input
              readOnly
              aria-label="Invoice link"
              value={window.location.href}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dismissible banner (non-Telegram in-app browsers)
// ---------------------------------------------------------------------------

function InAppBrowserBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="mx-auto mb-4 max-w-2xl rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-200">
            In-app browser detected
          </p>
          <p className="mt-1 text-sm text-amber-200/70">
            Crypto wallets don&apos;t work inside Telegram, Instagram, or similar apps.
            Open this link in your regular browser to connect a wallet and pay.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                window.open(window.location.href, '_system')
              } catch {
                // Fallback: just inform the user
              }
            }}
            className="mt-2 min-h-[44px] px-3 py-2 rounded-lg inline-flex items-center gap-1.5 text-sm font-medium text-amber-300 transition-colors hover:text-amber-200"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Open in browser
          </button>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="flex h-11 w-11 items-center justify-center rounded-lg shrink-0 text-amber-400/60 transition-colors hover:text-amber-300"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
