'use client'

import { Web3Provider } from '@/features/wallet-connect/providers'
import { useTelegramGate } from '@/widgets/in-app-browser-guard'
import { Button } from '@/shared/ui/button'

/**
 * TelegramPayButton — Pay button for Telegram WebView.
 *
 * Opens the global TelegramGateProvider modal (mounted in Navigation)
 * which offers "Copy link" and "Show QR Code" options.
 *
 * Wrapped in Web3Provider so useTelegramGate's modal (via Navigation's
 * TelegramGateProvider) can resolve useConnectModal when "Show QR Code"
 * is clicked.
 */
function TelegramPayButtonInner() {
  const gate = useTelegramGate()
  return (
    <Button
      variant="void"
      size="lg"
      className="h-14 w-full"
      aria-haspopup="dialog"
      onClick={gate.open}
    >
      Open in browser to pay
    </Button>
  )
}

export function TelegramPayButton() {
  return (
    <Web3Provider>
      <TelegramPayButtonInner />
    </Web3Provider>
  )
}
