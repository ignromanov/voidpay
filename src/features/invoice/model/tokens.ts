/**
 * Token Registry and Network Configuration
 *
 * Constitutional Principle I: Zero-Backend
 * - Static token lists, no API calls for MVP token registry
 * - Future enhancement: Add custom token support with on-chain metadata fetch
 *
 * Constitutional Principle IV: Backward Compatibility
 * - Token addresses locked for each network
 * - Changes require new version with migration path
 */

/**
 * Token representation for selector components
 */
export interface TokenInfo {
  /** Token symbol (e.g., "USDC") */
  symbol: string

  /** Human-readable name (e.g., "USD Coin") */
  name: string

  /** Contract address, null for native tokens */
  address: `0x${string}` | null

  /** Token decimals (e.g., 6 for USDC, 18 for ETH) */
  decimals: number

  /** Tailwind color class for icon background */
  iconColor: string
}

/**
 * Network-specific token lists
 *
 * Token addresses are chain-specific and MUST NOT be reused across networks
 * Native tokens (ETH, POL) have address = null
 */
export const NETWORK_TOKENS: Record<number, TokenInfo[]> = {
  // Ethereum Mainnet (chainId: 1)
  1: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: null,
      decimals: 18,
      iconColor: 'bg-zinc-100',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6,
      iconColor: 'bg-emerald-500',
    },
    {
      symbol: 'DAI',
      name: 'Dai',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      decimals: 18,
      iconColor: 'bg-yellow-500',
    },
  ],

  // Arbitrum One (chainId: 42161)
  42161: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: null,
      decimals: 18,
      iconColor: 'bg-zinc-100',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0xfd086bc7cd5c481dcc9c85eb481dad005539f586',
      decimals: 6,
      iconColor: 'bg-emerald-500',
    },
    {
      symbol: 'ARB',
      name: 'Arbitrum',
      address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
      decimals: 18,
      iconColor: 'bg-cyan-500',
    },
  ],

  // Optimism (chainId: 10)
  10: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: null,
      decimals: 18,
      iconColor: 'bg-zinc-100',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0x94b008aa00579c1307b0ef2c499ad98a8ce98e26',
      decimals: 6,
      iconColor: 'bg-emerald-500',
    },
    {
      symbol: 'OP',
      name: 'Optimism',
      address: '0x4200000000000000000000000000000000000042',
      decimals: 18,
      iconColor: 'bg-red-500',
    },
  ],

  // Polygon PoS (chainId: 137)
  137: [
    {
      symbol: 'POL',
      name: 'Polygon',
      address: null,
      decimals: 18,
      iconColor: 'bg-purple-500',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      decimals: 6,
      iconColor: 'bg-emerald-500',
    },
  ],
}
