import { isAddressEqual } from 'viem'
import type { Address } from 'viem'

export interface TransferResult {
  hash: `0x${string}`
  rawContract: {
    value: string
    address: string | null
    decimal: string
  }
  category: 'external' | 'erc20'
  blockTimestamp: string
}

/**
 * Find the first transfer matching the expected total.
 * Defense-in-depth: optionally verifies contract address (ERC-20).
 */
export function matchTransfer(
  transfers: TransferResult[],
  exactTotal: bigint,
  expectedContract?: string,
): TransferResult | null {
  for (const t of transfers) {
    // Defense-in-depth: verify contract address matches (for ERC-20)
    if (expectedContract && t.rawContract.address) {
      try {
        if (!isAddressEqual(t.rawContract.address as Address, expectedContract as Address)) {
          continue
        }
      } catch {
        continue
      }
    }

    // Safe BigInt conversion — skip malformed values
    try {
      if (BigInt(t.rawContract.value) === exactTotal) {
        return t
      }
    } catch {
      continue
    }
  }
  return null
}
