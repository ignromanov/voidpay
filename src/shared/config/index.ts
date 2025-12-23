/**
 * Shared Config - Public API
 *
 * Exports all configuration modules for the application.
 */

// Environment configuration
export { envSchema, validateEnv } from './env'
export type { EnvConfig } from './env'

// Storage keys for LocalStorage
export {
  STORAGE_KEYS,
  STORAGE_NAMESPACE,
  CREATOR_STORE_KEY,
  PAYER_STORE_KEY,
} from './storage-keys'

// Chain configurations
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
} from './chains'

// Wagmi configuration
export { wagmiConfig, config, chains } from './wagmi'

// RainbowKit theme
export { voidPayTheme } from './rainbowkit-theme'
