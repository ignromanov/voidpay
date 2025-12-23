/**
 * Shared Providers - FSD Shared Layer
 *
 * Re-exports provider components and hooks for application-wide contexts.
 * These providers should be used in app/ layer only.
 */

// Web3 Provider stack (Wagmi + React Query + RainbowKit)
export { Web3Provider } from './web3-provider'

// Web3 Scope for on-demand loading
export { Web3ScopeProvider, useWeb3Scope, withWeb3Scope } from './web3-scope'
