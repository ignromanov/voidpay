/**
 * Network Entity - Public API
 *
 * Exposes network configuration and types for blockchain networks
 * supported by VoidPay.
 */

// Network chain configuration (from config layer)
export { NETWORKS, NETWORK_CODES, NETWORK_CODES_REVERSE } from './config/networks'
export type { NetworkId } from './config/networks'

// Token registry (from config layer)
export { NETWORK_TOKENS } from './config/tokens'
export type { TokenInfo } from './config/tokens'

// Chain configuration (from config layer)
export {
  MAINNET_CHAINS,
  TESTNET_CHAINS,
  SUPPORTED_CHAIN_IDS,
  ALL_CHAIN_IDS,
  getChainById,
  getSupportedChains,
  isTestnetChain,
  getChainName,
  getBlockExplorerUrl,
} from './config/chains'

// Network UI configuration (from config layer)
export {
  NETWORK_CONFIG,
  NETWORK_GLOWS,
  NETWORK_GLOW_SHADOWS,
  NETWORK_GLOW_BORDERS,
  NETWORK_SHADOWS,
  NETWORK_BADGES,
  getNetworkTheme,
} from './config/ui-config'
export type { NetworkConfig, NetworkName } from './config/ui-config'

// Network helper functions (from lib layer)
export { getExplorerUrl, getNetworkName } from './lib/helpers'

// Network hooks (relocated from features/wallet-connect for FSD compliance)
export { useNetworkSwitch, canSwitchNetwork } from './lib/network-switch'
export type { CanSwitchNetworkParams, UseNetworkSwitchReturn } from './lib/network-switch'
export { detectNetworkMismatch, useNetworkMismatch } from './lib/network-mismatch'
export type { DetectNetworkMismatchParams, NetworkMismatchResult } from './lib/network-mismatch'
