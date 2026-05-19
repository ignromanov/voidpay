'use client'

/**
 * WalletButton - Unified wallet connection button
 *
 * Handles all states:
 * - Not connected → "Connect" button
 * - Wrong network → warning button
 * - Connected → chain selector + account button
 *
 * Uses direct wagmi + RainbowKit modal hooks instead of ConnectButton.Custom
 * to avoid unnecessary RPC calls (eth_getBalance) that ConnectButton triggers
 * internally even when balance is not displayed.
 *
 * NOTE: This component MUST be rendered inside Web3Provider context.
 * For lazy-loaded usage, use LazyWalletButton from LazyWalletButton.tsx
 */

import { useEffect, useRef } from 'react'
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { WalletIcon, ChevronDownIcon, Loader2Icon } from '@/shared/ui/icons'
import { NetworkIcon } from '@/shared/ui/network-icon'
import { Button } from '@/shared/ui/button'
import { truncateAddress } from '@/shared/lib/validation'
import { useWagmiHydrating } from '@/shared/lib'

export interface WalletButtonProps {
  autoConnect?: boolean
  /**
   * Called when the user clicks "Connect" and wallet is not yet connected.
   * If the callback returns true, the default openConnectModal is skipped.
   * Used by widget-layer consumers (e.g. Navigation in Telegram WebView) to
   * intercept the connect action without violating FSD layer boundaries.
   */
  onBeforeConnect?: () => boolean
}

/**
 * Auto-opens RainbowKit connect modal once on mount.
 * Used when LazyWalletButton was activated by user click.
 */
function AutoConnectTrigger() {
  const { openConnectModal } = useConnectModal()
  const { isConnected } = useAccount()
  const triggered = useRef(false)

  useEffect(() => {
    if (triggered.current || isConnected || !openConnectModal) return
    triggered.current = true
    const id = requestAnimationFrame(() => openConnectModal())
    return () => cancelAnimationFrame(id)
  }, [isConnected, openConnectModal])

  return null
}

export function WalletButton({ autoConnect = false, onBeforeConnect }: WalletButtonProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()
  const isHydrating = useWagmiHydrating()

  function handleConnect() {
    if (onBeforeConnect?.()) return
    openConnectModal?.()
  }

  // During wagmi hydration/reconnect we show an explicit disabled loading button
  // instead of hiding the UI. Hiding it (opacity:0) made clicks fall through and
  // the whole header felt frozen while wagmi restored the persisted connection.
  // useWagmiHydrating also covers the pre-hydration SSR gap where `status` is
  // still 'disconnected' but a persisted connection exists in localStorage.
  if (isHydrating) {
    return (
      <>
        {autoConnect && <AutoConnectTrigger />}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled
          aria-busy="true"
          aria-label="Reconnecting wallet"
        >
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Reconnecting…</span>
        </Button>
      </>
    )
  }

  return (
    <>
      {autoConnect && <AutoConnectTrigger />}
      {!isConnected ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleConnect}
        >
          <WalletIcon className="h-4 w-4" />
          Connect
        </Button>
      ) : (
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={openChainModal}>
            <NetworkIcon chainId={chainId} size={16} className="rounded-full" />
            <ChevronDownIcon className="hidden h-3 w-3 sm:block" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={openAccountModal}
          >
            <WalletIcon className="h-4 w-4 text-emerald-400 sm:hidden" />
            <span className="hidden sm:inline">{address ? truncateAddress(address) : 'Account'}</span>
            <ChevronDownIcon className="hidden h-3 w-3 sm:block" />
          </Button>
        </div>
      )}
    </>
  )
}
