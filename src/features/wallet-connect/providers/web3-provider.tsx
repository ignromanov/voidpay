'use client'

/**
 * Web3Provider - Core Web3 provider stack
 *
 * Feature-level provider for Web3 functionality.
 * Placed in features/wallet-connect per FSD - this feature owns
 * all wallet connectivity and Web3 context.
 *
 * Sets up the React context providers for Web3 functionality:
 * - WagmiProvider: Ethereum wallet connection and state
 * - QueryClientProvider: React Query for async state management
 * - RainbowKitProvider: Wallet connection UI with VoidPay theme
 *
 * PERFORMANCE: This module is loaded on-demand via dynamic import.
 * RainbowKit CSS is co-located here to load together with the provider.
 */

import { useEffect, useRef, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, WagmiContext, useAccount } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

// RainbowKit styles - loaded on-demand with Web3Provider
import '@rainbow-me/rainbowkit/styles.css'

import { wagmiConfig } from '../config/wagmi'
import { voidPayTheme } from '../config/rainbowkit-theme'

/**
 * Dispatches a custom DOM event when wallet connection state changes.
 * Allows LazyWalletButton (which may not yet have a Web3Provider)
 * to detect connections made through other scoped providers.
 */
function WalletStateSync() {
  const { isConnected } = useAccount()
  const wasConnected = useRef(false)

  useEffect(() => {
    if (isConnected && !wasConnected.current) {
      window.dispatchEvent(new Event('voidpay:wallet-connected'))
    }
    wasConnected.current = isConnected
  }, [isConnected])

  return null
}

/**
 * QueryClient instance for React Query
 * Manages caching and refetching of async data
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Retry failed queries once
      retry: 1,
    },
  },
})

/**
 * Props for Web3Provider
 */
type Web3ProviderProps = {
  children: ReactNode
}

/**
 * Tracks whether the primary WagmiProvider has been hydrated.
 *
 * wagmi's WagmiProvider triggers rehydrate() on mount, which reads
 * serialized connector objects from localStorage and overwrites
 * config.state.connections. Between rehydrate() and reconnect()
 * completing, connectors are plain objects without methods like
 * getChainId(), causing writeContract/sendTransaction to crash.
 *
 * After first hydration, subsequent Web3Provider instances provide
 * only the React context (via WagmiContext.Provider) — enough for
 * all wagmi hooks — without re-triggering the destructive rehydration.
 */
let hydrationDone = false

/**
 * Web3Provider - Main provider component for Web3 functionality
 *
 * Singleton-safe: only the first mounted instance triggers wagmi
 * hydration and reconnect. Subsequent instances provide context only.
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  const skipHydration = useRef(hydrationDone)

  useEffect(() => {
    hydrationDone = true
  }, [])

  const inner = (
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={voidPayTheme} locale="en">
        <WalletStateSync />
        {children}
      </RainbowKitProvider>
    </QueryClientProvider>
  )

  if (skipHydration.current) {
    return (
      <WagmiContext.Provider value={wagmiConfig}>
        {inner}
      </WagmiContext.Provider>
    )
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      {inner}
    </WagmiProvider>
  )
}
