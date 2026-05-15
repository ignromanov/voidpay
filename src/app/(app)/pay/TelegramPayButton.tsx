'use client'

import { Web3Provider } from '@/features/wallet-connect/providers'
import { TelegramPayActionModal } from '@/widgets/in-app-browser-guard'
import { Button } from '@/shared/ui/button'

interface TelegramPayButtonProps {
  open: boolean
  onOpen: () => void
  onClose: () => void
}

/**
 * TelegramPayButton — Web3-scoped trigger + modal for Telegram WebView.
 *
 * Mirrors PayButton's pattern: wraps Web3Provider so that
 * TelegramPayActionModal can call useConnectModal() from RainbowKit.
 * Rendered via next/dynamic (ssr:false) from PayWorkspace.
 */
export function TelegramPayButton({ open, onOpen, onClose }: TelegramPayButtonProps) {
  return (
    <Web3Provider>
      <Button
        variant="void"
        size="lg"
        className="h-14 w-full"
        onClick={onOpen}
      >
        Open in browser to pay
      </Button>
      <TelegramPayActionModal open={open} onClose={onClose} />
    </Web3Provider>
  )
}
