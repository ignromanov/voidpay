'use client'

/**
 * Application Providers
 *
 * Re-exports Web3Provider from the wallet-connect feature.
 * This file is dynamically imported by lazy-web3-provider.tsx
 * to enable lazy loading of the Web3 stack.
 */

export { Web3Provider } from '@/features/wallet-connect'

/**
 * Providers - Alias for Web3Provider
 *
 * Used for consistent naming in lazy loading.
 */
export { Web3Provider as Providers } from '@/features/wallet-connect'
