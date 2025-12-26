/**
 * Wallet Connect Feature Module
 *
 * Exports for the wallet-connect feature (FSD structure).
 *
 * IMPORTANT: wagmiConfig and chains are NOT exported from this barrel file
 * to avoid SSR side effects. Import them directly when needed:
 * - import { wagmiConfig, chains } from '@/features/wallet-connect/config/wagmi'
 *
 * @example
 * import { ConnectWalletButton, Web3Provider } from '@/features/wallet-connect'
 */

// Provider exports (lazy-loaded)
export { Web3Provider, Web3ScopeProvider, useWeb3Scope, withWeb3Scope } from './providers'

// Config exports (safe for SSR)
export { MAINNET_CHAINS, TESTNET_CHAINS, getSupportedChains, getChainById, isTestnetChain } from '@/shared/config'
export { voidPayTheme, VOIDPAY_ACCENT_COLOR, createVoidPayTheme } from './config/rainbowkit-theme'

// UI exports
export { ConnectWalletButton, truncateAddress, DefaultConnectButton } from './ui/ConnectButton'

// Lib exports (from shared)
export { createCustomTransport, createChainTransport, createTransportsForChains } from '@/shared/lib'
export { useNetworkSwitch, canSwitchNetwork } from './lib/network-switch'
export { detectNetworkMismatch, useNetworkMismatch } from './lib/network-mismatch'
export {
  shouldBlockNetworkSwitch,
  getPendingTxWarningMessage,
  usePendingTxGuard,
} from './lib/pending-tx-guard'
export { useNetworkTheme, NETWORK_THEME_CSS_VARS } from './lib/use-network-theme'
export {
  getConnectionErrorMessage,
  parseConnectionError,
  ConnectionErrorType,
  isUserRejection,
  isNoProvider,
} from './lib/connection-error'

// Additional config exports
export {
  NETWORK_THEMES,
  getNetworkTheme,
  getNetworkThemeColor,
  DEFAULT_NETWORK_THEME,
} from './config/network-themes'

// Additional UI exports
export { TestnetBanner, useIsTestnet } from './ui/TestnetBanner'
export { NetworkSelect, type NetworkSelectProps } from './ui/NetworkSelect'
