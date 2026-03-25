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
import { WalletIcon, ChevronDownIcon } from '@/shared/ui/icons'
import { NetworkIcon } from '@/shared/ui/network-icon'
import { Button } from '@/shared/ui/button'
import { truncateAddress } from '@/shared/lib/validation'

export interface WalletButtonProps {
  autoConnect?: boolean
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

export function WalletButton({ autoConnect = false }: WalletButtonProps) {
  const { address, isConnected, isReconnecting } = useAccount()
  const chainId = useChainId()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()

  return (
    <>
      {autoConnect && <AutoConnectTrigger />}
      <div
        {...(isReconnecting && {
          'aria-hidden': true,
          style: {
            opacity: 0,
            pointerEvents: 'none' as const,
            userSelect: 'none' as const,
          },
        })}
      >
        {!isConnected ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={openConnectModal}
          >
            <WalletIcon className="h-4 w-4" />
            Connect
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={openChainModal}>
              <NetworkIcon chainId={chainId} size={16} className="rounded-full" />
              <ChevronDownIcon className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={openAccountModal}
            >
              {address ? truncateAddress(address) : 'Account'}
              <ChevronDownIcon className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
