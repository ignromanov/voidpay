/**
 * Wagmi Configuration Re-export
 *
 * Re-exports the Wagmi config from the wallet-connect feature module.
 * The feature module contains all Web3 configuration including:
 * - Custom transport routing to /api/rpc (Constitutional Principle VI)
 * - Chain configurations for mainnet and testnet
 * - LocalStorage persistence
 *
 * @see src/features/wallet-connect/config/wagmi.ts for implementation
 */

export { wagmiConfig as config, chains } from '@/features/wallet-connect/config/wagmi'