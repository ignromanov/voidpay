/**
 * Wallet Connect Feature Module
 *
 * Exports for the wallet-connect feature (FSD structure).
 *
 * IMPORTANT: Web3Provider and WalletButton are NOT exported from this barrel file
 * to avoid SSR side effects with IndexedDB (used by WalletConnect).
 *
 * For Web3Provider, use dynamic import:
 * ```ts
 * import dynamic from 'next/dynamic'
 * const Web3Provider = dynamic(
 *   () => import('@/features/wallet-connect/providers').then(m => m.Web3Provider),
 *   { ssr: false }
 * )
 * ```
 *
 * For wallet buttons, use LazyWalletButton which handles lazy loading internally.
 *
 * @example
 * import { LazyWalletButton } from '@/features/wallet-connect'
 */

// Provider exports - ONLY SSR-safe exports
// Web3Provider is NOT exported here - use dynamic import with ssr: false
export { Web3ScopeProvider, useWeb3Scope, withWeb3Scope } from './providers/web3-scope'

// Config exports (safe for SSR)
export {
  MAINNET_CHAINS,
  TESTNET_CHAINS,
  getSupportedChains,
  getChainById,
  isTestnetChain,
} from '@/shared/config'
export { voidPayTheme, VOIDPAY_ACCENT_COLOR, createVoidPayTheme } from './config/rainbowkit-theme'

// UI exports
export { ConnectWalletButton, truncateAddress, DefaultConnectButton } from './ui/ConnectButton'

// Lib exports (from shared)
export {
  createCustomTransport,
  createChainTransport,
  createTransportsForChains,
} from '@/shared/lib'
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

// WalletButton exports
// NOTE: WalletButton is NOT exported here to avoid SSR side effects.
// Use LazyWalletButton which handles lazy loading internally.
export { LazyWalletButton, WalletButtonLazy } from './ui/LazyWalletButton'
