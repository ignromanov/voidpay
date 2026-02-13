'use client'

/**
 * WalletButton - Unified wallet connection button
 *
 * Handles all states:
 * - Not connected → "Connect" button
 * - Wrong network → warning button
 * - Connected → chain selector + account button
 *
 * NOTE: This component MUST be rendered inside Web3Provider context.
 * For lazy-loaded usage, use LazyWalletButton from LazyWalletButton.tsx
 */

import { useEffect, useRef } from 'react'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { WalletIcon, ChevronDownIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'

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
  return (
    <>
    {autoConnect && <AutoConnectTrigger />}
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={openConnectModal}
                  >
                    <WalletIcon className="h-4 w-4" />
                    Connect
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-red-500/50 text-red-400 hover:border-red-500 hover:text-red-300"
                    onClick={openChainModal}
                  >
                    Wrong network
                  </Button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={openChainModal}>
                    {chain.hasIcon && chain.iconUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element -- Dynamic URL from RainbowKit */
                      <img
                        alt={chain.name ?? 'Chain icon'}
                        src={chain.iconUrl}
                        className="h-4 w-4 rounded-full"
                      />
                    )}
                    <ChevronDownIcon className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={openAccountModal}
                  >
                    {account.displayName}
                    <ChevronDownIcon className="h-3 w-3" />
                  </Button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
    </>
  )
}
