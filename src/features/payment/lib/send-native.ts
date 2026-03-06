/**
 * Native Token Transfer Parameters
 *
 * Builds parameters for useSendTransaction (ETH, MATIC, etc.).
 * Normalizes recipient address to EIP-55 checksum format.
 */

import { getAddress } from 'viem'

export interface NativeTransferParams {
  to: `0x${string}`
  value: bigint
}

/**
 * Build parameters for a native token transfer.
 *
 * @param recipientAddress - Wallet address to send to (any case)
 * @param exactTotal - Amount in atomic units (wei) as string
 * @returns Parameters ready for useSendTransaction
 */
export function buildNativeTransferParams(
  recipientAddress: string,
  exactTotal: string,
): NativeTransferParams {
  const value = BigInt(exactTotal)
  if (value <= BigInt(0)) throw new Error('Cannot send zero or negative amount')
  return {
    to: getAddress(recipientAddress),
    value,
  }
}
