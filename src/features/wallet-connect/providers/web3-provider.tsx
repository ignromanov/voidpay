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
import { WagmiProvider, useAccount } from 'wagmi'
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
 * Web3Provider - Main provider component for Web3 functionality
 *
 * Wraps the application with:
 * 1. WagmiProvider - Ethereum connection state
 * 2. QueryClientProvider - Async state management
 * 3. RainbowKitProvider - Wallet connection UI
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={voidPayTheme} locale="en">
          <WalletStateSync />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
