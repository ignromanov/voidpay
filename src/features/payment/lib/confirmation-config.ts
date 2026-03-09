export interface SoftConfirmationConfig {
  blocks: number
  finalizationTimeoutMs: number
}

export const CONFIRMATION_CONFIG: Record<number, SoftConfirmationConfig> = {
  // Mainnet
  1:     { blocks: 3, finalizationTimeoutMs: 60 * 60_000 },  // Ethereum
  42161: { blocks: 1, finalizationTimeoutMs: 30 * 60_000 },  // Arbitrum
  10:    { blocks: 1, finalizationTimeoutMs: 30 * 60_000 },  // Optimism
  137:   { blocks: 5, finalizationTimeoutMs: 30 * 60_000 },  // Polygon
  // Testnet (same params as mainnet counterparts)
  11155111: { blocks: 3, finalizationTimeoutMs: 60 * 60_000 },  // Sepolia
  421614:   { blocks: 1, finalizationTimeoutMs: 30 * 60_000 },  // Arbitrum Sepolia
  11155420: { blocks: 1, finalizationTimeoutMs: 30 * 60_000 },  // Optimism Sepolia
  80002:    { blocks: 5, finalizationTimeoutMs: 30 * 60_000 },  // Polygon Amoy
}

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

function getConfig(chainId: number): SoftConfirmationConfig {
  const config = CONFIRMATION_CONFIG[chainId]
  if (!config) throw new Error(`Unsupported chainId: ${chainId}`)
  return config
}

export function getSoftConfirmations(chainId: number): number {
  return getConfig(chainId).blocks
}

export function getFinalizationTimeout(chainId: number): number {
  return getConfig(chainId).finalizationTimeoutMs
}

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

// ---------------------------------------------------------------------------
// Reference anchors for fromBlock estimation (no RPC needed)
// ---------------------------------------------------------------------------

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

const FROM_BLOCK_BUFFER = 1_000

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

  const issuedAtMs = issuedAtUnix * 1000
  const elapsedMs = issuedAtMs - ref.timestampMs
  const blocksSinceRef = Math.floor(elapsedMs / avgBlockTimeMs)
  const estimated = ref.block + blocksSinceRef - FROM_BLOCK_BUFFER

  if (estimated < 1) return '0x1'
  return `0x${estimated.toString(16)}`
}
