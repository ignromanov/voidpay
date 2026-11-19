import { buildPaymentUri } from './build-payment-uri'

/**
 * 'metamask' → verified branded universal link (link.metamask.io).
 * 'generic'  → raw EIP-681 ethereum: URI, OS-routed (any installed wallet).
 *
 * Per spec 095 research.md, MetaMask is the ONLY wallet with a verified branded
 * same-device prefill link. Trust/Coinbase/Rainbow are UNSUPPORTED → 'generic'.
 */
export type WalletId = 'metamask' | 'generic'

interface DeepLinkParams {
  recipientAddress: string
  chainId: number
  amount: string
  tokenAddress?: string | undefined
}

const METAMASK_HOST = 'https://link.metamask.io/send/'

export function buildWalletDeepLink(wallet: WalletId, params: DeepLinkParams): string {
  // buildPaymentUri validates address/chainId/amount and returns `ethereum:<...>`.
  const eip681 = buildPaymentUri(params)
  if (wallet === 'metamask') {
    // slice(9) drops the 'ethereum:' prefix; the remainder is byte-identical to
    // what MetaMask's universal link expects after /send/ (research.md shortcut).
    return METAMASK_HOST + eip681.slice('ethereum:'.length)
  }
  return eip681
}
