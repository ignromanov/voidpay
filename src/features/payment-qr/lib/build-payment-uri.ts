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

function assertAddress(value: string, label: string): void {
  if (!value || !value.startsWith('0x') || value.length !== 42) {
    throw new Error(
      `[buildPaymentUri] Invalid ${label}: expected 0x-prefixed 42-char address, got "${value}"`
    )
  }
}

export function buildPaymentUri({
  recipientAddress,
  chainId,
  amount,
  tokenAddress,
}: PaymentUriParams): string {
  assertAddress(recipientAddress, 'recipientAddress')

  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error(
      `[buildPaymentUri] Invalid chainId: expected positive integer, got ${chainId}`
    )
  }

  if (!amount) {
    throw new Error('[buildPaymentUri] Invalid amount: must be non-empty string')
  }

  // Validate amount is a valid BigInt string (no decimals, no letters)
  try {
    BigInt(amount)
  } catch {
    throw new Error(
      `[buildPaymentUri] Invalid amount: expected BigInt-compatible string, got "${amount}"`
    )
  }

  if (tokenAddress) {
    assertAddress(tokenAddress, 'tokenAddress')
    // ERC-20: ethereum:0xToken@chainId/transfer?address=0xRecipient&uint256=amount
    return `ethereum:${tokenAddress}@${chainId}/transfer?address=${recipientAddress}&uint256=${amount}`
  }

  // Native: ethereum:0xRecipient@chainId?value=amount
  return `ethereum:${recipientAddress}@${chainId}?value=${amount}`
}
