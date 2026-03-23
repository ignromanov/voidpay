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
