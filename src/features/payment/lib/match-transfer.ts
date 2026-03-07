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

export function matchTransfer(
  transfers: TransferResult[],
  exactTotal: bigint,
): TransferResult | null {
  for (const t of transfers) {
    if (BigInt(t.rawContract.value) === exactTotal) {
      return t
    }
  }
  return null
}
