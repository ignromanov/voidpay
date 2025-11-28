'use client'

/**
 * ConnectButton Component for VoidPay
 *
 * Wrapped RainbowKit ConnectButton with custom styling and
 * address truncation for VoidPay's UI.
 */

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { cn } from '@/shared/lib/utils'

/**
 * Truncate an Ethereum address for display
 *
 * @param address - Full Ethereum address (0x...)
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Truncated address (e.g., "0x1234...5678")
 */
export function truncateAddress(
  address: string,
  startChars = 6,
  endChars = 4
): string {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Props for ConnectWalletButton component
 */
export interface ConnectWalletButtonProps {
  /** Additional CSS classes */
  className?: string
  /** Show balance next to address */
  showBalance?: boolean
}

/**
 * Custom Connect Wallet Button for VoidPay
 *
 * Uses RainbowKit's ConnectButton.Custom for full control over rendering.
 * Shows:
 * - "Connect Wallet" when disconnected
 * - Truncated address when connected
 * - Network selector via RainbowKit's chain modal
 */
export function ConnectWalletButton({
  className,
  showBalance = false,
}: ConnectWalletButtonProps) {
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
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-lg',
                      'bg-violet-600 hover:bg-violet-700 text-white',
                      'px-4 py-2 text-sm font-medium',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
                      className
                    )}
                  >
                    Connect Wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-lg',
                      'bg-red-600 hover:bg-red-700 text-white',
                      'px-4 py-2 text-sm font-medium',
                      'transition-colors duration-200',
                      className
                    )}
                  >
                    Wrong Network
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  {/* Chain selector button */}
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg',
                      'bg-zinc-800 hover:bg-zinc-700 text-zinc-100',
                      'px-3 py-2 text-sm font-medium',
                      'transition-colors duration-200',
                      'border border-zinc-700'
                    )}
                  >
                    {chain.hasIcon && (
                      <div
                        className="h-4 w-4 overflow-hidden rounded-full"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="h-4 w-4"
                          />
                        )}
                      </div>
                    )}
                    <span className="hidden sm:inline">{chain.name}</span>
                  </button>

                  {/* Account button */}
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg',
                      'bg-zinc-800 hover:bg-zinc-700 text-zinc-100',
                      'px-3 py-2 text-sm font-medium',
                      'transition-colors duration-200',
                      'border border-zinc-700',
                      className
                    )}
                  >
                    {showBalance && account.displayBalance && (
                      <span className="text-zinc-400">
                        {account.displayBalance}
                      </span>
                    )}
                    <span>{truncateAddress(account.address)}</span>
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

/**
 * Re-export the default RainbowKit ConnectButton for simpler use cases
 */
export { ConnectButton as DefaultConnectButton }
