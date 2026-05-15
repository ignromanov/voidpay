'use client'

import { Web3Provider } from '@/features/wallet-connect/providers'
import { TelegramGateProvider, useTelegramGate } from '@/widgets/in-app-browser-guard'
import { Button } from '@/shared/ui/button'

/**
 * TelegramPayButton — Pay button for hostile in-app browsers.
 *
 * The /pay route does not mount LazyWeb3Provider (each Web3-using component
 * brings its own Web3Provider tree), so we mount a local TelegramGateProvider
 * here so the trigger button and the action modal share state. useConnectModal
 * inside the modal resolves because we sit inside Web3Provider.
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
      <TelegramGateProvider>
        <TelegramPayButtonInner />
      </TelegramGateProvider>
    </Web3Provider>
  )
}
