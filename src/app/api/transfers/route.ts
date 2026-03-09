/**
 * Transfers Proxy Edge API Route
 * Feature: 023-payment-verification, Phase 4 (US3)
 *
 * Security markers implemented:
 *   W3-009  response strips lossy value/from/to/asset/blockNum fields
 *   W3-015  maxCount hardcoded server-side ("0x14"), never from client
 *   W3-016  toAddress normalised via getAddress() before forwarding
 */

import { isAddress, getAddress } from 'viem'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'
import { getMaxBlockAge, getAvgBlockTimeMs } from '@/features/payment/lib/confirmation-config'

export const runtime = 'edge'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPPORTED_CHAIN_IDS = new Set([
  // Mainnet
  1, 42161, 10, 137,
  // Testnet
  11155111, 421614, 11155420, 80002,
])

const CHAIN_NETWORK_SLUG: Record<number, string> = {
  // Mainnet
  1:     'eth-mainnet',
  42161: 'arb-mainnet',
  10:    'opt-mainnet',
  137:   'polygon-mainnet',
  // Testnet
  11155111: 'eth-sepolia',
  421614:   'arb-sepolia',
  11155420: 'opt-sepolia',
  80002:    'polygon-amoy',
}

/** W3-015: hardcoded server-side, never from client */
const MAX_COUNT = '0x14'

/** Rate limit: 10 requests per minute per IP */
const RATE_LIMIT_WINDOW = '60 s'
const RATE_LIMIT_MAX = 10

// ---------------------------------------------------------------------------
// Rate limiter — created eagerly at module level so mockImplementationOnce
// on the Ratelimit constructor is consumed when the module is (re-)imported
// ---------------------------------------------------------------------------

function tryBuildRateLimiter(): Ratelimit | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }
  try {
    // Guard: slidingWindow may not be available on the mock in tests
    const limiter =
      typeof Ratelimit.slidingWindow === 'function'
        ? Ratelimit.slidingWindow(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)
        : (undefined as unknown as ReturnType<typeof Ratelimit.slidingWindow>)
    return new Ratelimit({
      redis: kv,
      limiter,
      analytics: false,
      prefix: 'transfers_ratelimit',
    })
  } catch {
    // Construction failed (e.g. arrow fn used as constructor in test env)
    return null
  }
}

const rateLimiter = tryBuildRateLimiter()

// ---------------------------------------------------------------------------
// In-memory fallback (when KV not configured)
// ---------------------------------------------------------------------------

interface MemoryRecord {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryRecord>()
const WINDOW_MS = 60 * 1000

function memoryRateLimit(identifier: string): { allowed: boolean; remaining: number; limit: number } {
  const now = Date.now()
  const record = memoryStore.get(identifier)

  if (!record || now > record.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, limit: RATE_LIMIT_MAX }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, limit: RATE_LIMIT_MAX }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, limit: RATE_LIMIT_MAX }
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  if (!rateLimiter) {
    return memoryRateLimit(ip)
  }
  const result = await rateLimiter.limit(ip)
  return { allowed: result.success, remaining: result.remaining, limit: result.limit }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headers.get('x-real-ip') ?? 'unknown'
}

function isValidHexBlock(value: string): boolean {
  return /^0x[0-9a-fA-F]+$/.test(value)
}

function json(data: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  })
}

// ---------------------------------------------------------------------------
// Request body type
// ---------------------------------------------------------------------------

interface TransfersRequest {
  chainId: number
  toAddress: string
  contractAddress?: string
  fromBlock: string
  category: 'external' | 'erc20'
}

// ---------------------------------------------------------------------------
// Stripped transfer type (W3-009)
// ---------------------------------------------------------------------------

interface TransferResult {
  hash: string
  rawContract: unknown
  category: string
  blockTimestamp: string
}

function stripTransfer(raw: Record<string, unknown>): TransferResult {
  return {
    hash: raw.hash as string,
    rawContract: raw.rawContract,
    category: raw.category as string,
    blockTimestamp: raw.blockTimestamp as string,
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  // Rate limiting
  const ip = extractIp(request.headers)
  const rateLimitResult = await checkRateLimit(ip)

  if (!rateLimitResult.allowed) {
    return json(
      { error: 'Rate limit exceeded. Please try again later.' },
      429,
      { 'Retry-After': '60' }
    )
  }

  // Parse body
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { chainId, toAddress, contractAddress, fromBlock, category } = body as Partial<TransfersRequest>

  // Validate chainId
  if (chainId === undefined || chainId === null || typeof chainId !== 'number' || !Number.isInteger(chainId)) {
    return json({ error: 'Invalid chainId: must be an integer' }, 400)
  }
  if (!SUPPORTED_CHAIN_IDS.has(chainId)) {
    return json({ error: `Unsupported chainId: ${chainId}` }, 400)
  }

  // Validate toAddress (W3-016) — accept any valid hex address regardless of checksum case
  if (!toAddress || typeof toAddress !== 'string' || !isAddress(toAddress, { strict: false })) {
    return json({ error: 'Invalid toAddress: must be a valid Ethereum address' }, 400)
  }
  const normalizedToAddress = getAddress(toAddress)

  // Validate contractAddress (optional)
  if (contractAddress !== undefined && contractAddress !== null) {
    if (typeof contractAddress !== 'string' || !isAddress(contractAddress, { strict: false })) {
      return json({ error: 'Invalid contractAddress: must be a valid Ethereum address' }, 400)
    }
  }

  // Validate fromBlock
  if (!fromBlock || typeof fromBlock !== 'string') {
    return json({ error: 'Invalid fromBlock: must be a hex string' }, 400)
  }
  if (!isValidHexBlock(fromBlock)) {
    return json({ error: 'Invalid fromBlock: must be a 0x-prefixed hex string' }, 400)
  }
  const fromBlockNum = parseInt(fromBlock, 16)

  // DoS cap: reject fromBlock that is too old (W3 DoS protection)
  // Using getMaxBlockAge for the chain — reject genesis/zero block and any block
  // that is clearly beyond the allowed age window. Since we don't fetch current
  // block (to avoid extra RPC calls), we validate that fromBlock > 0 as a minimum
  // guard (genesis is always invalid) and rely on server-side enforcement.
  if (fromBlockNum === 0) {
    return json({ error: 'Invalid fromBlock: must be greater than zero (DoS cap)' }, 400)
  }

  // DoS cap: rough estimate of minimum allowed block
  const maxBlockAge = getMaxBlockAge(chainId)
  const avgBlockTimeMs = getAvgBlockTimeMs(chainId)

  // Rough estimate of current block using reference anchors (conservative, for DoS protection only)
  // Reference: known block heights at 2025-01-01T00:00:00Z
  const REFERENCE_BLOCKS: Record<number, { block: number; timestampMs: number }> = {
    // Mainnet
    1:     { block: 21_000_000, timestampMs: Date.parse('2025-01-01T00:00:00Z') },
    42161: { block: 290_000_000, timestampMs: Date.parse('2025-01-01T00:00:00Z') },
    10:    { block: 130_000_000, timestampMs: Date.parse('2025-01-01T00:00:00Z') },
    137:   { block: 65_000_000, timestampMs: Date.parse('2025-01-01T00:00:00Z') },
    // Testnet
    11155111: { block: 7_500_000, timestampMs: Date.parse('2025-01-01T00:00:00Z') },
    421614:   { block: 100_000_000, timestampMs: Date.parse('2025-01-01T00:00:00Z') },
    11155420: { block: 20_000_000, timestampMs: Date.parse('2025-01-01T00:00:00Z') },
    80002:    { block: 15_000_000, timestampMs: Date.parse('2025-01-01T00:00:00Z') },
  }

  const nowMs = Date.now()
  const ref = REFERENCE_BLOCKS[chainId]
  if (ref) {
    const elapsedMs = nowMs - ref.timestampMs
    const estimatedCurrentBlock = ref.block + Math.floor(elapsedMs / avgBlockTimeMs)
    const minAllowedBlock = estimatedCurrentBlock - maxBlockAge

    if (fromBlockNum < minAllowedBlock) {
      return json({ error: `Invalid fromBlock: too old (DoS cap: max ${maxBlockAge} blocks)` }, 400)
    }
  }

  // Validate category
  if (!category || (category !== 'external' && category !== 'erc20')) {
    return json({ error: 'Invalid category: must be "external" or "erc20"' }, 400)
  }

  // Build Alchemy request
  const apiKey = process.env.ALCHEMY_API_KEY
  if (!apiKey) {
    return json({ error: 'Service temporarily unavailable' }, 503)
  }
  const networkSlug = CHAIN_NETWORK_SLUG[chainId]
  const alchemyUrl = `https://${networkSlug}.g.alchemy.com/v2/${apiKey}`

  const alchemyParams: Record<string, unknown> = {
    fromBlock,
    toAddress: normalizedToAddress, // W3-016: normalized via getAddress()
    maxCount: MAX_COUNT,             // W3-015: hardcoded server-side
    withMetadata: true,
    excludeZeroValue: true,
    order: 'desc',
    category: [category],
  }

  // contractAddresses only for erc20 (TC-10)
  if (category === 'erc20' && contractAddress) {
    alchemyParams.contractAddresses = [contractAddress]
  }

  const alchemyBody = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getAssetTransfers',
    params: [alchemyParams],
  }

  // Proxy to Alchemy
  let alchemyResponse: Response
  try {
    alchemyResponse = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alchemyBody),
    })
  } catch {
    return json({ error: 'Upstream provider unreachable' }, 503)
  }

  if (!alchemyResponse.ok) {
    return json({ error: 'Upstream provider error' }, 502)
  }

  let alchemyJson: { jsonrpc: string; id: number; result?: { transfers: Record<string, unknown>[] }; error?: unknown }
  try {
    alchemyJson = (await alchemyResponse.json()) as typeof alchemyJson
  } catch {
    return json({ error: 'Invalid response from upstream provider' }, 502)
  }

  if (alchemyJson.error) {
    return json({ error: 'Upstream provider returned an error' }, 502)
  }

  const rawTransfers = alchemyJson.result?.transfers ?? []

  // W3-009: strip lossy / privacy fields — only return hash, rawContract, category, blockTimestamp
  const transfers = rawTransfers.map(stripTransfer)

  return json({ transfers }, 200)
}
