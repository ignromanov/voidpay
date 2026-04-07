/**
 * Token Registry
 *
 * Network-specific token lists for all supported chains.
 * Token addresses are chain-specific and MUST NOT be reused across networks.
 * Native tokens (ETH, POL) have address = null.
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

  /** Whether this is a custom/unverified token (optional) */
  isCustom?: boolean
}

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
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
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
      address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
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

  // Base (chainId: 8453)
  8453: [
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
      address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
  ],

  // --- Testnets ---

  // Sepolia (chainId: 11155111)
  11155111: [
    {
      symbol: 'ETH',
      name: 'Sepolia ETH',
      address: null,
      decimals: 18,
      iconColor: 'bg-zinc-100',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin (Test)',
      address: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
    {
      symbol: 'EURC',
      name: 'Euro Coin (Test)',
      address: '0x08210f9170f89ab7658f0b5e3ff39b0e03c594d4',
      decimals: 6,
      iconColor: 'bg-blue-400',
    },
  ],

  // Arbitrum Sepolia (chainId: 421614)
  421614: [
    {
      symbol: 'ETH',
      name: 'Arbitrum Sepolia ETH',
      address: null,
      decimals: 18,
      iconColor: 'bg-zinc-100',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin (Test)',
      address: '0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
  ],

  // Optimism Sepolia (chainId: 11155420)
  11155420: [
    {
      symbol: 'ETH',
      name: 'Optimism Sepolia ETH',
      address: null,
      decimals: 18,
      iconColor: 'bg-zinc-100',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin (Test)',
      address: '0x5fd84259d66cd46123540766be93dfe6d43130d7',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
  ],

  // Polygon Amoy (chainId: 80002)
  80002: [
    {
      symbol: 'POL',
      name: 'Amoy POL',
      address: null,
      decimals: 18,
      iconColor: 'bg-purple-500',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin (Test)',
      address: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
  ],
  // Base Sepolia (chainId: 84532)
  // Note: no USDT test contract available on Base Sepolia
  84532: [
    {
      symbol: 'ETH',
      name: 'Base Sepolia ETH',
      address: null,
      decimals: 18,
      iconColor: 'bg-zinc-100',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin (Test)',
      address: '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
      decimals: 6,
      iconColor: 'bg-blue-500',
    },
  ],
}

/**
 * Find a token by symbol on a specific network.
 * Returns undefined if not found.
 */
export function findTokenForNetwork(chainId: number, symbol: string): TokenInfo | undefined {
  return NETWORK_TOKENS[chainId]?.find((t) => t.symbol === symbol)
}
