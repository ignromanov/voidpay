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
import { getMaxBlockAge, estimateCurrentBlock, ALL_CHAIN_IDS_SET, ALCHEMY_NETWORK_SLUG } from '@/entities/network'
import { checkRateLimit } from './rate-limit'
import { stripTransfer } from './strip-transfer'
import { extractIp, isValidHexBlock, json } from './validate'
import type { TransfersRequest } from './validate'

export const runtime = 'edge'

/** W3-015: hardcoded server-side, never from client */
const MAX_COUNT = '0x14'

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
  if (!ALL_CHAIN_IDS_SET.has(chainId)) {
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
  const estimatedCurrent = estimateCurrentBlock(chainId)
  if (estimatedCurrent !== null) {
    const minAllowedBlock = estimatedCurrent - maxBlockAge
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
  const networkSlug = ALCHEMY_NETWORK_SLUG[chainId]
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
