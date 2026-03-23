// ---------------------------------------------------------------------------
// Stripped transfer type (W3-009)
// ---------------------------------------------------------------------------

export interface TransferResult {
  hash: string
  rawContract: {
    value: string
    address: string | null
    decimal: string
  }
  category: string
  blockTimestamp: string
}

export function stripTransfer(raw: Record<string, unknown>): TransferResult {
  const rc = raw.rawContract as Record<string, unknown> | undefined
  return {
    hash: raw.hash as string,
    rawContract: rc ? { value: rc.value as string, address: (rc.address as string) ?? null, decimal: rc.decimal as string } : { value: '0', address: null, decimal: '0' },
    category: raw.category as string,
    blockTimestamp: raw.blockTimestamp as string,
  }
}
