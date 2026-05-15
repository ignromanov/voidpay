'use client'

import { useEffect, useRef, useState } from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ExternalLinkIcon } from '@/shared/ui/icons'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { toast } from '@/shared/lib/toast'
import { track, AnalyticsEvent } from '@/features/analytics/lib/track'

interface TelegramPayActionModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Reactive action modal for Telegram WebView D+B UX pattern.
 *
 * Opens when the user attempts to pay inside Telegram WebView.
 * Offers: Copy link (clipboard) or Show QR Code (RainbowKit connect modal).
 *
 * MUST be rendered inside Web3Provider — useConnectModal requires wagmi context.
 */
export function TelegramPayActionModal({ open, onClose }: TelegramPayActionModalProps) {
  const { openConnectModal } = useConnectModal()
  const [clipboardFailed, setClipboardFailed] = useState(false)
  const firedRef = useRef(false)

  // Fire analytics once per open transition (false → true)
  useEffect(() => {
    if (!open) {
      firedRef.current = false
      return
    }
    if (firedRef.current) return
    firedRef.current = true
    track(AnalyticsEvent.MOBILE_IAB_PAY_INTERCEPTED)
  }, [open])

  // Reset clipboard fallback on close
  useEffect(() => {
    if (!open) setClipboardFailed(false)
  }, [open])

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied — paste into Safari or Chrome')
    } catch {
      setClipboardFailed(true)
    }
  }

  function handleShowQR() {
    openConnectModal?.()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        size="sm"
        className="w-[calc(100%-2rem)] border-amber-500/20 bg-zinc-900 text-white"
      >
        <DialogTitle className="text-base font-semibold text-white pr-8">
          Open in another browser to pay
        </DialogTitle>

        <DialogDescription className="text-sm text-zinc-400">
          Wallet connect doesn&apos;t work inside this app. Copy this link to open in Safari or
          Chrome, or show a QR code to scan from another device.
        </DialogDescription>

        <div className="flex flex-col gap-3 pt-1">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleCopyLink}
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Copy link
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full text-zinc-300 hover:text-white"
            onClick={handleShowQR}
          >
            Show QR Code
          </Button>
        </div>

        {clipboardFailed && (
          <div className="pt-1">
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
      </DialogContent>
    </Dialog>
  )
}
