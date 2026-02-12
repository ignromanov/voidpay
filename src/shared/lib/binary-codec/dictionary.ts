/**
 * Dictionary Compression
 *
 * Pre-defined dictionaries for common strings to save bytes.
 * Each common value is assigned a 1-byte code (0-255).
 */

/**
 * Common currency symbols
 */
export const CURRENCY_DICT: Record<string, number> = {
  'USDC': 1,
  'USDT': 2,
  'DAI': 3,
  'ETH': 4,
  'WETH': 5,
  'MATIC': 6,
  'ARB': 7,
  'OP': 8,
  'AVAX': 9,
  'BNB': 10,
  'BUSD': 11,
  'FRAX': 12,
  'LUSD': 13,
  'sUSD': 14,
  'TUSD': 15,
};

export const CURRENCY_DICT_REVERSE: Record<number, string> = Object.fromEntries(
  Object.entries(CURRENCY_DICT).map(([k, v]) => [v, k])
);

/**
 * Common token addresses (ERC-20)
 */
export const TOKEN_DICT: Record<string, number> = {
  // Ethereum Mainnet
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1, // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 2, // USDT
  '0x6b175474e89094c44da98b954eedeac495271d0f': 3, // DAI
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 4, // WETH
  // Polygon
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 5, // USDC (Polygon)
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 6, // USDT (Polygon)
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': 7, // DAI (Polygon)
  // Arbitrum
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': 8, // USDC (Arbitrum)
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 9, // USDT (Arbitrum)
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': 10, // DAI (Arbitrum)
};

export const TOKEN_DICT_REVERSE: Record<number, string> = Object.fromEntries(
  Object.entries(TOKEN_DICT).map(([k, v]) => [v, k])
);

/**
 * Pre-computed lowercase Maps for O(1) dictionary lookup
 * Computed once at module initialization instead of O(n) iteration per call
 */
const CURRENCY_DICT_LOWER = new Map<string, number>(
  Object.entries(CURRENCY_DICT).map(([k, v]) => [k.toLowerCase(), v])
);

const TOKEN_DICT_LOWER = new Map<string, number>(
  Object.entries(TOKEN_DICT).map(([k, v]) => [k.toLowerCase(), v])
);

/**
 * Encodes a string using dictionary if available, otherwise returns null
 * Uses pre-computed Map for O(1) lookup instead of O(n) iteration
 */
export function encodeDictString(str: string, dict: Record<string, number>): number | null {
  // Select the pre-computed lowercase Map based on which dict was passed
  const lowerMap = dict === CURRENCY_DICT ? CURRENCY_DICT_LOWER : TOKEN_DICT_LOWER;
  return lowerMap.get(str.toLowerCase()) ?? null;
}

/**
 * Decodes a dictionary code back to string
 */
export function decodeDictString(code: number, dict: Record<number, string>): string | null {
  return dict[code] || null;
}
