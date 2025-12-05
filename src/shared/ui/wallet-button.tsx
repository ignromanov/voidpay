'use client'

/**
 * WalletButton - Unified wallet connection button
 *
 * Handles all states:
 * - Loading (Web3 not ready) → disabled placeholder
 * - Not connected → "Connect" button
 * - Wrong network → warning button
 * - Connected → chain selector + account button
 */

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, ChevronDown } from 'lucide-react'
import { Button } from './button'
import { useWeb3Loaded } from '@/app/lazy-web3-provider'

export function WalletButton() {
  const web3Loaded = useWeb3Loaded()

  // Placeholder while Web3 loads
  if (!web3Loaded) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5" disabled>
        <Wallet className="h-4 w-4" />
        Connect
      </Button>
    )
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
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
                    <Wallet className="h-4 w-4" />
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={openChainModal}
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain icon'}
                        src={chain.iconUrl}
                        className="h-4 w-4 rounded-full"
                      />
                    )}
                    <ChevronDown className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={openAccountModal}
                  >
                    {account.displayName}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
