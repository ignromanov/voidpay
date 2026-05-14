'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertTriangleIcon, ExternalLinkIcon } from '@/shared/ui/icons'
import { isInAppBrowser, isTelegramWebView } from '@/shared/lib'
import { track, AnalyticsEvent } from '@/features/analytics/lib/track'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/button'

/**
 * Shows a contextual in-app browser warning:
 *
 * - Telegram WebView: blocking interstitial with "Copy link" + "Show QR Code"
 *   (non-dismissible — wallet connect dead-ends in Telegram, GH#214)
 * - Other in-app browsers (Instagram, FB, X…): dismissible banner
 * - Regular browsers: null
 */
export function InAppBrowserGuard() {
  const [mode, setMode] = useState<'telegram' | 'banner' | 'none'>('none')

  useEffect(() => {
    if (isTelegramWebView()) {
      setMode('telegram')
    } else if (isInAppBrowser()) {
      setMode('banner')
    }
  }, [])

  if (mode === 'telegram') return <TelegramInterstitial onProceed={() => setMode('none')} />
  if (mode === 'banner') return <InAppBrowserBanner />
  return null
}

// ---------------------------------------------------------------------------
// Telegram blocking interstitial
// ---------------------------------------------------------------------------

interface TelegramInterstitialProps {
  onProceed: () => void
}

function TelegramInterstitial({ onProceed }: TelegramInterstitialProps) {
  const [clipboardFailed, setClipboardFailed] = useState(false)
  const firedRef = useRef(false)

  // Fire once per mount — guard against StrictMode double-invoke
  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    track(AnalyticsEvent.MOBILE_TG_WEBVIEW_BLOCKED)
  }, [])

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tg-interstitial-title"
      aria-describedby="tg-interstitial-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 p-4"
    >
      <div className="w-full max-w-sm rounded-2xl border border-amber-500/30 bg-zinc-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
            <AlertTriangleIcon className="h-5 w-5 text-amber-400" />
          </div>
          <h2 id="tg-interstitial-title" className="text-base font-semibold text-white">
            Wallet connection unavailable
          </h2>
        </div>

        <p id="tg-interstitial-desc" className="mb-5 text-sm text-zinc-400">
          Telegram&apos;s built-in browser blocks wallet connections. Open this
          link in Safari or Chrome to pay.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleCopyLink}
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Copy link
          </Button>

          <button
            type="button"
            onClick={onProceed}
            className="min-h-[44px] rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
          >
            Show QR Code instead
          </button>
        </div>

        {clipboardFailed && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs text-zinc-500">
              Tap &amp; hold to copy:
            </p>
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
