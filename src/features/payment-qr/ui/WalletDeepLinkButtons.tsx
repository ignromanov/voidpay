'use client'

import { buildWalletDeepLink, type WalletId } from '../lib/build-wallet-deeplink'
import { assertAmountParity } from '../lib/assert-amount-parity'

interface WalletDeepLinkButtonsProps {
  recipientAddress: string
  chainId: number
  /** atomic exactTotal — same value passed to buildPaymentUri */
  amount: string
  /** displayed exactTotal from computeAmounts — Shade S1 parity check */
  displayedExactTotal: string
  tokenAddress?: string
}

// Post-research: MetaMask is the only branded prefill link; everything else is
// the generic OS-routed ethereum: button (research.md / AC-10 amendment).
const WALLETS: { id: WalletId; label: string }[] = [
  { id: 'metamask', label: 'MetaMask' },
  { id: 'generic', label: 'wallet' }, // renders "Open in wallet"
]

export function WalletDeepLinkButtons({
  recipientAddress,
  chainId,
  amount,
  displayedExactTotal,
  tokenAddress,
}: WalletDeepLinkButtonsProps) {
  assertAmountParity(amount, displayedExactTotal)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {WALLETS.map(({ id, label }) => (
          <a
            key={id}
            href={buildWalletDeepLink(id, {
              recipientAddress,
              chainId,
              amount,
              ...(tokenAddress ? { tokenAddress } : {}),
            })}
            className="flex items-center justify-center rounded-lg bg-zinc-100 px-4 py-3 font-medium text-zinc-900 active:scale-[0.98]"
          >
            Open in {label}
          </a>
        ))}
      </div>
      <p className="text-center text-xs text-zinc-500">
        Do not change the amount — we use it to find your payment.
      </p>
    </div>
  )
}
