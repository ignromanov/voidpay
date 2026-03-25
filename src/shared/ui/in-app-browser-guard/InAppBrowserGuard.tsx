'use client'

import { useState, useEffect } from 'react'
import { AlertTriangleIcon, ExternalLinkIcon } from '@/shared/ui/icons'
import { isInAppBrowser } from '@/shared/lib'

/**
 * Shows a warning banner when the page is opened in an in-app browser
 * (Telegram, Instagram, etc.) where crypto wallets are unavailable.
 *
 * Dismissible — stores nothing (stateless, like the rest of VoidPay).
 */
export function InAppBrowserGuard() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(isInAppBrowser())
  }, [])

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
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-amber-300 transition-colors hover:text-amber-200"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Open in browser
          </button>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 text-amber-400/60 transition-colors hover:text-amber-300"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
