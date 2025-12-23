/**
 * Chain Configurations Re-export
 *
 * @deprecated Import from '@/shared/config' instead
 *
 * This file re-exports chain configurations from shared for backward compatibility.
 * All new code should import directly from shared.
 */

export {
  MAINNET_CHAINS,
  TESTNET_CHAINS,
  SUPPORTED_CHAIN_IDS,
  ALL_CHAIN_IDS,
  getChainById,
  getSupportedChains,
  isTestnetChain,
  getChainName,
  getBlockExplorerUrl,
} from '@/shared/config'

export type { Chain } from 'viem'
