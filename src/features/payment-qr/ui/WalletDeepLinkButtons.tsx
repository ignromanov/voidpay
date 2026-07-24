'use client'

import { buildWalletDeepLink } from '../lib/build-wallet-deeplink'
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

export function WalletDeepLinkButtons({
  recipientAddress,
  chainId,
  amount,
  displayedExactTotal,
  tokenAddress,
}: WalletDeepLinkButtonsProps) {
  assertAmountParity(amount, displayedExactTotal)

  const deepLinkParams = {
    recipientAddress,
    chainId,
    amount,
    ...(tokenAddress ? { tokenAddress } : {}),
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={buildWalletDeepLink('metamask', deepLinkParams)}
        className="flex items-center justify-center rounded-lg bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-900 active:scale-[0.98]"
      >
        Open in MetaMask
      </a>
      {!tokenAddress && (
        <a
          href={buildWalletDeepLink('generic', deepLinkParams)}
          className="text-center text-xs text-zinc-500 underline"
        >
          Use a different wallet
        </a>
      )}
      <p className="text-center text-xs text-zinc-500">
        Do not change the amount — we use it to find your payment.
      </p>
    </div>
  )
}
