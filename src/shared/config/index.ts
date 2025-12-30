/**
 * Shared Config - Public API
 *
 * Exports configuration modules for the application.
 *
 * IMPORTANT: Web3-related configs (wagmi, rainbowkit) are NOT exported here
 * to avoid side effects during SSR/build. They belong to features/wallet-connect:
 * - import { wagmiConfig } from '@/features/wallet-connect/config/wagmi'
 * - import { voidPayTheme } from '@/features/wallet-connect/config/rainbowkit-theme'
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
  INVOICE_VIEW_STORE_KEY,
} from './storage-keys'

// URL constants
export { VOIDPAY_DOMAIN, APP_URLS, SOCIAL_URLS, getAppBaseUrl } from './urls'

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

// NOTE: wagmiConfig and voidPayTheme are intentionally NOT exported here.
// They trigger RainbowKit initialization which requires browser environment.
// These configs belong to features/wallet-connect - import directly from:
// - '@/features/wallet-connect/config/wagmi'
// - '@/features/wallet-connect/config/rainbowkit-theme'
