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
 * @see https://wagmi.sh/core/api/createConfig
 */

import { createStorage } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { getSupportedChains, ALL_CHAIN_IDS } from '@/shared/config'
import { createTransportsForChains } from '@/shared/lib'

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
 * Wagmi configuration using RainbowKit's getDefaultConfig
 *
 * This provides:
 * - Pre-configured connectors (MetaMask, WalletConnect, Coinbase, Rainbow)
 * - Automatic wallet detection
 * - Mobile wallet support via WalletConnect
 * - SSR-safe storage with LocalStorage persistence
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'VoidPay',
  projectId: projectIdForConfig,
  chains,
  transports,
  ssr: true,
  storage: createStorage({
    storage:
      typeof window !== 'undefined'
        ? window.localStorage
        : {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          },
    key: 'voidpay-wallet',
  }),
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
