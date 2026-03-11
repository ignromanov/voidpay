'use client'

/**
 * Web3ReadProvider - Lightweight read-only Web3 provider
 *
 * WagmiProvider + QueryClientProvider WITHOUT RainbowKit.
 * Saves ~500KB bundle for pages that only need publicClient (e.g., /invoice).
 * No wallet connection UI, no RainbowKit CSS import.
 */

import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { wagmiConfig } from '../config/wagmi'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Web3ReadProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
