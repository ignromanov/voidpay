/**
 * Block estimation utilities for EVM chains.
 *
 * Chain-level constants (block times, reference anchors, DoS caps)
 * used by both server-side API routes and client-side polling.
 * No React dependencies — safe for Edge runtime.
 */

import { nowUnix } from '@/shared/lib/date-time'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_BLOCK_AGE: Record<number, number> = {
  1:     216_000,
  42161: 10_368_000,
  10:    1_296_000,
  137:   1_296_000,
  // Testnet
  11155111: 216_000,
  421614:   10_368_000,
  11155420: 1_296_000,
  80002:    1_296_000,
}

const AVG_BLOCK_TIME_MS: Record<number, number> = {
  1:     12_000,
  42161: 250,
  10:    2_000,
  137:   2_000,
  // Testnet
  11155111: 12_000,
  421614:   250,
  11155420: 2_000,
  80002:    2_000,
}

// Reference anchors — updated 2026-03-09 from live explorer data.
// Used for fromBlock estimation without RPC. Closer to "now" = less drift.
const REFERENCE_BLOCKS: Record<number, { block: number; timestampMs: number }> = {
  // Mainnet
  1:     { block: 24_580_000, timestampMs: Date.parse('2026-03-09T00:00:00Z') },
  42161: { block: 439_760_000, timestampMs: Date.parse('2026-03-09T00:00:00Z') },
  10:    { block: 148_670_000, timestampMs: Date.parse('2026-03-09T00:00:00Z') },
  137:   { block: 83_950_000, timestampMs: Date.parse('2026-03-09T00:00:00Z') },
  // Testnet
  11155111: { block: 10_416_000, timestampMs: Date.parse('2026-03-09T00:00:00Z') },
  421614:   { block: 248_490_000, timestampMs: Date.parse('2026-03-09T00:00:00Z') },
  11155420: { block: 40_410_000, timestampMs: Date.parse('2026-03-09T00:00:00Z') },
  80002:    { block: 34_960_000, timestampMs: Date.parse('2026-03-09T00:00:00Z') },
}

/** Safety buffer: subtracted from estimated fromBlock to account for block time drift.
 *  ~12,000 seconds (~3.3h) on 12s chains, more on faster chains. */
const FROM_BLOCK_BUFFER = 5_000

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getMaxBlockAge(chainId: number): number {
  const age = MAX_BLOCK_AGE[chainId]
  if (age === undefined) throw new Error(`Unsupported chainId: ${chainId}`)
  return age
}

export function getAvgBlockTimeMs(chainId: number): number {
  const time = AVG_BLOCK_TIME_MS[chainId]
  if (time === undefined) throw new Error(`Unsupported chainId: ${chainId}`)
  return time
}

/**
 * Estimate current block number for a chain without RPC.
 * Uses reference anchors + avgBlockTime for DoS validation.
 */
export function estimateCurrentBlock(chainId: number): number | null {
  const ref = REFERENCE_BLOCKS[chainId]
  const avgBlockTimeMs = AVG_BLOCK_TIME_MS[chainId]
  if (!ref || !avgBlockTimeMs) return null

  const elapsedMs = Date.now() - ref.timestampMs
  return ref.block + Math.floor(elapsedMs / avgBlockTimeMs)
}

/**
 * Estimate a hex fromBlock for Alchemy `getAssetTransfers` without RPC.
 * Uses reference anchor + avgBlockTime to compute the block at `issuedAtUnix`,
 * then subtracts a safety buffer.
 *
 * @returns `0x`-prefixed hex string (minimum `0x1`)
 */
export function estimateFromBlockHex(chainId: number, issuedAtUnix: number): string {
  const ref = REFERENCE_BLOCKS[chainId]
  if (!ref) return '0x1'

  const avgBlockTimeMs = AVG_BLOCK_TIME_MS[chainId]
  if (!avgBlockTimeMs) return '0x1'

  const twoDaysAgoSec = nowUnix() - 2 * 86400
  const clampedIssuedAt = Math.min(issuedAtUnix, twoDaysAgoSec)

  const issuedAtMs = clampedIssuedAt * 1000
  const elapsedMs = issuedAtMs - ref.timestampMs
  const blocksSinceRef = Math.floor(elapsedMs / avgBlockTimeMs)
  const estimated = ref.block + blocksSinceRef - FROM_BLOCK_BUFFER

  if (estimated < 1) return '0x1'
  return `0x${estimated.toString(16)}`
}

/**
 * Estimate block number at a given timestamp, relative to a known current block.
 * Used for on-chain receipt verification (requires current block from RPC).
 */
export function estimateBlockFromTimestamp(
  createdAtUnix: number,
  chainId: number,
  currentBlock: bigint
): bigint {
  const avgBlockTime = getAvgBlockTimeMs(chainId)
  const nowMs = Date.now()
  const createdAtMs = createdAtUnix * 1000
  const elapsedMs = nowMs - createdAtMs
  const blocksAgo = BigInt(Math.floor(elapsedMs / avgBlockTime))
  const estimated = currentBlock - blocksAgo
  return estimated < BigInt(0) ? BigInt(0) : estimated
}
