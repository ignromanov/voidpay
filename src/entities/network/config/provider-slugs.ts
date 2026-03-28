/**
 * Provider-specific network slug mappings
 *
 * Single source of truth for provider subdomain prefixes.
 * Used by rpc-proxy and transfers-proxy routes.
 */

/** Alchemy subdomain prefix per chain ID */
export const ALCHEMY_NETWORK_SLUG: Record<number, string> = {
  // Mainnet
  1:     'eth-mainnet',
  42161: 'arb-mainnet',
  10:    'opt-mainnet',
  137:   'polygon-mainnet',
  // Testnet
  11155111: 'eth-sepolia',
  421614:   'arb-sepolia',
  11155420: 'opt-sepolia',
  80002:    'polygon-amoy',
}

/** Infura subdomain prefix per chain ID */
export const INFURA_NETWORK_SLUG: Record<number, string> = {
  // Mainnet
  1:     'mainnet',
  42161: 'arbitrum-mainnet',
  10:    'optimism-mainnet',
  137:   'polygon-mainnet',
  // Testnet
  11155111: 'sepolia',
  421614:   'arbitrum-sepolia',
  11155420: 'optimism-sepolia',
  80002:    'polygon-amoy',
}
