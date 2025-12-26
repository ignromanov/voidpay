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
 */
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

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
  projectId: walletConnectProjectId,
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
