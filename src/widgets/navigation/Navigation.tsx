'use client'

/**
 * Navigation Component
 *
 * Main navigation bar:
 * - Left: VoidLogo + brand name (links to Home)
 * - Right: History link, Create button, Connect wallet
 *
 * In Telegram WebView: the wallet "Connect" button is intercepted by the
 * TelegramGateProvider so that clicking it opens TelegramPayActionModal
 * (the "go to browser / Show QR Code" gate) instead of the RainbowKit modal
 * directly. Connected-state buttons (chain, account) are not intercepted.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusIcon, ClockIcon } from '@/shared/ui/icons'
import { VoidLogo } from '@/shared/ui/void-logo'
import { Button } from '@/shared/ui/button'
import { LazyWalletButton as WalletButton } from '@/features/wallet-connect'
import { isTelegramWebView } from '@/shared/lib'
import { TelegramGateProvider, useTelegramGate } from '@/widgets/in-app-browser-guard'

/**
 * WalletButton wrapper that intercepts the connect click in Telegram WebView.
 * Must be a child of TelegramGateProvider.
 */
function TelegramAwareWalletButton() {
  const gate = useTelegramGate()
  const isTg = isTelegramWebView()
  const extraProps = isTg ? { onBeforeConnect: () => { gate.open(); return true } } : {}
  return <WalletButton {...extraProps} />
}

export function Navigation() {
  const pathname = usePathname()
  const isHistory = pathname === '/history'

  return (
    <TelegramGateProvider>
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-zinc-800/30 bg-zinc-950/60 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)] print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo = Home */}
            <Link href="/" className="flex items-center gap-2">
              <VoidLogo size="sm" />
              <span className="text-lg font-semibold text-zinc-50">VoidPay</span>
            </Link>

            {/* Right: Nav + Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/history"
                className={`inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isHistory
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-50'
                }`}
              >
                <ClockIcon className="h-4 w-4 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">History</span>
              </Link>

              <Link href="/create">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </Link>

              {/* Separator */}
              <div className="mx-2 h-6 w-px bg-zinc-800" />

              <TelegramAwareWalletButton />
            </div>
          </div>
        </div>
      </nav>
    </TelegramGateProvider>
  )
}
