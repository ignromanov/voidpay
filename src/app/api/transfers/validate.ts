// ---------------------------------------------------------------------------
// Request body type
// ---------------------------------------------------------------------------

export interface TransfersRequest {
  chainId: number
  toAddress: string
  contractAddress?: string
  fromBlock: string
  category: 'external' | 'erc20'
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Max 12 hex digits (2^48) — far above any real block number, exact as a JS number */
export function isValidHexBlock(value: string): boolean {
  return /^0x[0-9a-fA-F]{1,12}$/.test(value)
}

/** media type must be application/json (parameters such as charset allowed) */
export function isJsonContentType(value: string | null): boolean {
  return value?.split(';')[0]?.trim().toLowerCase() === 'application/json'
}

export function json(data: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  })
}
