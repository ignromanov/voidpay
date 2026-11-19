'use client'

import { buildWalletDeepLink } from '../lib/build-wallet-deeplink'
import { assertAmountParity, isAmountParityOk } from '../lib/assert-amount-parity'

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
  const deepLinkParams = {
    recipientAddress,
    chainId,
    amount,
    ...(tokenAddress ? { tokenAddress } : {}),
  }

  const metamaskHref = buildWalletDeepLink('metamask', deepLinkParams)

  if (!isAmountParityOk(metamaskHref, displayedExactTotal)) {
    // Fail closed: never offer a deep link whose amount Magic-Dust can't match.
    if (process.env.NODE_ENV !== 'production') {
      assertAmountParity(metamaskHref, displayedExactTotal)
    }
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={metamaskHref}
        className="flex items-center justify-center rounded-lg bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-900 active:scale-[0.98]"
      >
        Open in MetaMask
      </a>
      {!tokenAddress && (
        <a
          href={buildWalletDeepLink('generic', deepLinkParams)}
          className="inline-flex min-h-11 items-center justify-center text-xs text-zinc-400 underline"
        >
          Use a different wallet
        </a>
      )}
      <p className="text-center text-xs text-zinc-400">
        Do not change the amount — we use it to find your payment.
      </p>
    </div>
  )
}
