/**
 * Wallet Connect Providers
 *
 * Web3 provider components for the wallet-connect feature.
 * These providers are loaded lazily to optimize initial bundle size.
 */

export { Web3Provider } from './web3-provider'
export { Web3ScopeProvider, useWeb3Scope, withWeb3Scope } from './web3-scope'
