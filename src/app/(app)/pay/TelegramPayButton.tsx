'use client'

import { TelegramGateProvider, useTelegramGate } from '@/widgets/in-app-browser-guard'
import { Button } from '@/shared/ui/button'

/**
 * TelegramPayButton — Pay button for hostile in-app browsers.
 *
 * Wraps the trigger and the action modal in a local TelegramGateProvider so
 * they share state. The modal is Web3-free (Copy link only after the Show
 * QR Code path was removed 2026-05-15), so no Web3Provider is needed here.
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
    <TelegramGateProvider>
      <TelegramPayButtonInner />
    </TelegramGateProvider>
  )
}
