'use client'

import { useState, useEffect } from 'react'
import { AlertTriangleIcon, ExternalLinkIcon, XIcon } from '@/shared/ui/icons'
import { isHostileInAppBrowser } from '@/shared/lib'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/button'

/**
 * Shows a passive, dismissible bottom panel when a Tier-1 hostile in-app
 * browser is detected (Telegram, X/Twitter, Instagram, Facebook, Messenger,
 * TikTok, LinkedIn, WeChat, Snapchat, Threads) — all share the same
 * WalletConnect deep-link breakage. Non-hostile browsers render null.
 *
 * Dismissal is in-memory only (per page-load) — intentional: payers may
 * dismiss for visibility while reading the invoice, but a reload re-shows
 * the warning so they don't forget the constraint before attempting to pay.
 */

export function InAppBrowserGuard() {
  const [mode, setMode] = useState<'panel' | 'none'>('none')

  useEffect(() => {
    if (isHostileInAppBrowser()) {
      setMode('panel')
    }
  }, [])

  if (mode === 'panel') return <HostileIABBottomPanel onDismiss={() => setMode('none')} />
  return null
}

// ---------------------------------------------------------------------------
// Passive dismissible bottom panel (Tier-1 hostile in-app browsers)
// ---------------------------------------------------------------------------

interface HostileIABBottomPanelProps {
  onDismiss: () => void
}

function HostileIABBottomPanel({ onDismiss }: HostileIABBottomPanelProps) {
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
    <div className="fixed bottom-[calc(2.75rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-40 border-t border-amber-500/30 bg-zinc-900/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangleIcon aria-hidden="true" className="h-4 w-4 shrink-0 translate-y-0.5 text-amber-400" />
          <p className="min-w-0 flex-1 text-sm text-zinc-300">
            Wallet connect doesn&apos;t work in this in-app browser — open in Safari/Chrome to pay
          </p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="default"
            className="min-h-[44px] gap-1.5"
            onClick={handleCopyLink}
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            Copy link
          </Button>
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
