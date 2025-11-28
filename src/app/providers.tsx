'use client'

/**
 * Application Providers
 *
 * Sets up the React context providers for Web3 functionality:
 * - WagmiProvider: Ethereum wallet connection and state
 * - QueryClientProvider: React Query for async state management
 * - RainbowKitProvider: Wallet connection UI with VoidPay theme
 */

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

import { config } from '@/shared/config/wagmi'
import { voidPayTheme } from '@/features/wallet-connect/config/rainbowkit-theme'

// Import RainbowKit CSS
import '@rainbow-me/rainbowkit/styles.css'

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
 * Props for provider components
 */
interface ProviderProps {
  children: React.ReactNode
}

/**
 * Web3Provider - Main provider component for Web3 functionality
 *
 * Wraps the application with:
 * 1. WagmiProvider - Ethereum connection state
 * 2. QueryClientProvider - Async state management
 * 3. RainbowKitProvider - Wallet connection UI
 */
export function Web3Provider({ children }: ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={voidPayTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

/**
 * Providers - Alias for Web3Provider
 *
 * Used in layout.tsx for consistent naming.
 */
export const Providers = Web3Provider
