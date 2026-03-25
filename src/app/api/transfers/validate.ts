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

export function extractIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const last = forwarded.split(',').at(-1)?.trim()
    if (last) return last
  }
  return headers.get('x-real-ip') ?? 'unknown'
}

export function isValidHexBlock(value: string): boolean {
  return /^0x[0-9a-fA-F]+$/.test(value)
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
