/**
 * Wallet Connect Feature Module
 *
 * Exports for the wallet-connect feature (FSD structure).
 *
 * @example
 * import { ConnectWalletButton, wagmiConfig } from '@/features/wallet-connect'
 */

// Config exports
export { wagmiConfig, chains } from './config/wagmi'
export {
  MAINNET_CHAINS,
  TESTNET_CHAINS,
  getSupportedChains,
  getChainById,
  isTestnetChain,
} from './config/chains'
export { voidPayTheme, VOIDPAY_ACCENT_COLOR, createVoidPayTheme } from './config/rainbowkit-theme'

// UI exports
export { ConnectWalletButton, truncateAddress, DefaultConnectButton } from './ui/ConnectButton'

// Lib exports
export {
  createCustomTransport,
  createChainTransport,
  createTransportsForChains,
} from './lib/custom-transport'
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
