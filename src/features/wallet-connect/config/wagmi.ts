/**
 * Wagmi Configuration for VoidPay
 *
 * Feature-level configuration for Web3 wallet connectivity.
 * Placed in features/wallet-connect per FSD - this is the feature
 * responsible for wallet interaction.
 *
 * Configures Wagmi with:
 * - Custom transport routing to /api/rpc (Constitutional Principle VI)
 * - LocalStorage persistence via createStorage
 * - All supported mainnet/testnet chains
 *
 * Telegram WebView gate (GH#214):
 * When isTelegramWebView() is true, each wallet's `mobile` field is
 * stripped so RainbowKit falls through to the WC QR modal instead of
 * executing `window.location.href = "wc:..."` which causes a blank page.
 *
 * @see https://wagmi.sh/core/api/createConfig
 */

import { createStorage } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  rainbowWallet,
  metaMaskWallet,
  walletConnectWallet,
  safeWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { getSupportedChains, ALL_CHAIN_IDS } from '@/entities/network'
import { createTransportsForChains, isTelegramWebView } from '@/shared/lib'
import { WAGMI_STORAGE_KEY } from '@/shared/config'

/**
 * WalletConnect Project ID from environment
 * Required for WalletConnect v2 connections
 *
 * FALLBACK: Uses a placeholder during build/SSR when env var is not set.
 * This allows static generation to complete without crashing.
 * The placeholder won't work for actual wallet connections in production -
 * a real projectId must be set via NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.
 *
 * @see https://cloud.walletconnect.com/
 */
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Warn if using fallback (build-time only, won't work for actual connections)
if (!walletConnectProjectId) {
  console.warn(
    '[wagmi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. ' +
      'WalletConnect connections will not work. ' +
      'Get a project ID from https://cloud.walletconnect.com/'
  )
}

// Use placeholder for build, empty string would cause RainbowKit to throw
const projectIdForConfig = walletConnectProjectId ?? 'placeholder-build-key'

/**
 * Get chains configuration
 */
const chains = getSupportedChains()

/**
 * Create transports for all supported chains
 * Routes all RPC calls through /api/rpc proxy
 */
const transports = createTransportsForChains([...ALL_CHAIN_IDS])

/**
 * Wraps a wallet factory so its `mobile` field is always undefined.
 *
 * RainbowKit checks `wallet.mobile?.getUri` to decide whether to do
 * `window.location.href = "wc:..."`. Setting mobile to undefined
 * short-circuits that branch → falls through to the QR modal instead.
 * This is the correct fix for Telegram WebView (GH#214).
 */
function stripMobile<T extends (opts: { projectId: string }) => unknown>(factory: T): T {
  return ((opts: { projectId: string }) => ({ ...(factory(opts) as object), mobile: undefined })) as T
}

/**
 * Wallet list for Telegram WebView: mobile deep-links stripped so the
 * WalletConnect QR modal is the only connect path (no wc: redirect).
 *
 * coinbaseWallet excluded: deprecated in RainbowKit v2.2.11 (replaced by
 * `base`) and as a deep-link wallet its mobile field is the only meaningful
 * feature — without it, it becomes a redundant WC entry.
 */
const TELEGRAM_WALLET_LIST = [
  {
    groupName: 'Scan to connect',
    wallets: [
      stripMobile(rainbowWallet),
      stripMobile(metaMaskWallet),
      stripMobile(safeWallet),
      walletConnectWallet, // already has no mobile
    ],
  },
]

const sharedStorageConfig = createStorage({
  storage:
    typeof window !== 'undefined'
      ? window.localStorage
      : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        },
  key: WAGMI_STORAGE_KEY,
})

/**
 * Wagmi configuration using RainbowKit's getDefaultConfig
 *
 * In Telegram WebView: uses a custom wallet list with mobile stripped.
 * Elsewhere: uses RainbowKit's built-in default wallet list.
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'VoidPay',
  projectId: projectIdForConfig,
  chains,
  transports,
  ssr: true,
  storage: sharedStorageConfig,
  ...(isTelegramWebView() ? { wallets: TELEGRAM_WALLET_LIST } : {}),
})

/**
 * Re-export chains for convenience
 */
export { chains }

/**
 * Alias for backward compatibility
 * @deprecated Use wagmiConfig instead
 */
export const config = wagmiConfig
