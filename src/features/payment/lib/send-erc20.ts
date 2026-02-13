/**
 * ERC-20 Token Transfer Parameters
 *
 * Builds parameters for useWriteContract (USDC, USDT, DAI, etc.).
 * Validates tokenAddress existence (FR-013) and normalizes recipient.
 */

import { getAddress } from 'viem'
import { erc20TransferAbi } from './erc20-abi'

export interface Erc20TransferParams {
  address: `0x${string}`
  abi: typeof erc20TransferAbi
  functionName: 'transfer'
  args: [`0x${string}`, bigint]
}

/**
 * Build parameters for an ERC-20 transfer call.
 *
 * @param tokenAddress - ERC-20 contract address
 * @param recipientAddress - Wallet address to send to
 * @param exactTotal - Amount in atomic units as string
 * @returns Parameters ready for useWriteContract
 * @throws Error if tokenAddress is missing (FR-013)
 */
export function buildErc20TransferParams(
  tokenAddress: string,
  recipientAddress: string,
  exactTotal: string,
): Erc20TransferParams {
  if (!tokenAddress) {
    throw new Error('Token address is required for ERC-20 transfers')
  }

  return {
    address: getAddress(tokenAddress),
    abi: erc20TransferAbi,
    functionName: 'transfer',
    args: [getAddress(recipientAddress), BigInt(exactTotal)],
  }
}
