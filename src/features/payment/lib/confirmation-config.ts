export interface SoftConfirmationConfig {
  blocks: number
  finalizationTimeoutMs: number
}

export const CONFIRMATION_CONFIG: Record<number, SoftConfirmationConfig> = {
  1:     { blocks: 3, finalizationTimeoutMs: 60 * 60_000 },  // Ethereum
  42161: { blocks: 1, finalizationTimeoutMs: 30 * 60_000 },  // Arbitrum
  10:    { blocks: 1, finalizationTimeoutMs: 30 * 60_000 },  // Optimism
  137:   { blocks: 5, finalizationTimeoutMs: 30 * 60_000 },  // Polygon
}

const MAX_BLOCK_AGE: Record<number, number> = {
  1:     216_000,
  42161: 10_368_000,
  10:    1_296_000,
  137:   1_296_000,
}

const AVG_BLOCK_TIME_MS: Record<number, number> = {
  1:     12_000,
  42161: 250,
  10:    2_000,
  137:   2_000,
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
