/**
 * Build an EIP-681 payment URI for mobile wallet QR scanning.
 *
 * @see https://eips.ethereum.org/EIPS/eip-681
 *
 * Native token (ETH/MATIC):
 *   ethereum:0xRecipient@chainId?value=amountInWei
 *
 * ERC-20 token (USDC/USDT/DAI):
 *   ethereum:0xTokenAddress@chainId/transfer?address=0xRecipient&uint256=amount
 */

interface PaymentUriParams {
  /** Recipient wallet address */
  recipientAddress: string
  /** Chain ID (1 = Ethereum, 42161 = Arbitrum, etc.) */
  chainId: number
  /** Total amount in atomic units (bigint string) */
  amount: string
  /** ERC-20 token contract address (undefined = native token) */
  tokenAddress?: string | undefined
}

export function buildPaymentUri({
  recipientAddress,
  chainId,
  amount,
  tokenAddress,
}: PaymentUriParams): string {
  if (tokenAddress) {
    // ERC-20: ethereum:0xToken@chainId/transfer?address=0xRecipient&uint256=amount
    return `ethereum:${tokenAddress}@${chainId}/transfer?address=${recipientAddress}&uint256=${amount}`
  }

  // Native: ethereum:0xRecipient@chainId?value=amount
  return `ethereum:${recipientAddress}@${chainId}?value=${amount}`
}
