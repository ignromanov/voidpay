/**
 * TLV Map — Invoice field ↔ TLV type mapping and dictionaries.
 *
 * Spec reference: 024-codec-v1-tlv spec.md §3 (TLV type registry) + §5 (dictionaries).
 *
 * Placement: features/invoice-codec — this is Invoice domain knowledge,
 * NOT generic TLV primitives (those live in shared/lib/tlv-codec).
 */

// ---------------------------------------------------------------------------
// TLV Type Registry
// ---------------------------------------------------------------------------

/**
 * TLV type numbers per spec §3.
 *
 * Even  = REQUIRED (decoder MUST reject invoice if unknown even type encountered)
 * Odd   = OPTIONAL (decoder MUST skip unknown odd types silently — BOLT12 rule)
 */
export const TlvType = {
  // --- Optional (odd) types ------------------------------------------------
  TOKEN_ADDRESS: 1,      // tokenAddress — prefix byte (0x00=dict, 0x01=raw 20 bytes)
  CLIENT_WALLET: 3,      // client.walletAddress — raw bytes (20 bytes EVM)
  NOTES: 5,              // notes — UTF-8 string
  FROM_EMAIL: 7,         // from.email — UTF-8 string
  FROM_PHONE: 9,         // from.phone — UTF-8 string
  FROM_ADDRESS: 11,      // from.physicalAddress — UTF-8 string
  CLIENT_EMAIL: 13,      // client.email — UTF-8 string
  CLIENT_PHONE: 15,      // client.phone — UTF-8 string
  CLIENT_ADDRESS: 17,    // client.physicalAddress — UTF-8 string
  TAX: 19,               // tax — UTF-8 string (percentage)
  DISCOUNT: 21,          // discount — UTF-8 string (percentage)
  TTL: 29,               // codec-only: uint32 BE unix timestamp (ERC-3009 validBefore)
  DOMAIN_SEPARATOR: 31,  // codec-only: 32 bytes keccak256 hash
  FROM_TAX_ID: 35,       // from.taxId — UTF-8 string
  CLIENT_TAX_ID: 37,     // client.taxId — UTF-8 string
  MEMO: 27,              // memo — UTF-8 string (reserved, optional)
  SIGNATURE: 33,         // EIP-712 signature (reserved, optional)
  RECURRING: 39,         // recurring billing config (reserved, optional)
  COMPRESSED_TEXT: 253,  // codec-only: grouped deflate block (§3.4)

  // --- Required (even) types -----------------------------------------------
  CHAIN_ID: 2,           // networkId — varint
  ISSUED_AT: 4,          // issuedAt — uint32 BE unix timestamp
  DUE_AT: 6,             // dueAt — uint32 BE unix timestamp
  DECIMALS: 8,           // decimals — uint8
  FROM_WALLET: 10,       // from.walletAddress — raw bytes (20 bytes EVM)
  CURRENCY: 12,          // currency — prefix byte (0x00=dict, 0x01=raw UTF-8)
  ITEMS: 14,             // items[] — packed binary (§3.3)
  FROM_NAME: 16,         // from.name — UTF-8 string
  CLIENT_NAME: 18,       // client.name — UTF-8 string
  SALT: 20,              // codec-only: 16 random bytes (crypto.getRandomValues)
  INVOICE_ID: 22,        // invoiceId — UTF-8 string
  TOTAL: 24,             // subtotal WITHOUT magicDust — BigInt varint (atomic units)
} as const

export type TlvTypeValue = (typeof TlvType)[keyof typeof TlvType]

// ---------------------------------------------------------------------------
// Currency Dictionary (spec §5.1)
// ---------------------------------------------------------------------------

/**
 * Currency symbol → compact 1-byte code.
 * Codes 12-20 are reserved for future currencies.
 */
export const CURRENCY_DICT: Record<string, number> = {
  USDC: 1,
  USDT: 2,
  DAI: 3,
  ETH: 4,
  WETH: 5,
  MATIC: 6,
  POL: 7,
  WBTC: 8,
  'USDC.E': 9,
  EURC: 10,
  USDT0: 11,
}

/** Compact code → currency symbol (reverse lookup). */
export const CURRENCY_DICT_REVERSE: Record<number, string> = Object.fromEntries(
  Object.entries(CURRENCY_DICT).map(([k, v]) => [v, k])
)

// ---------------------------------------------------------------------------
// Token Address Dictionary (spec §5.2)
// ---------------------------------------------------------------------------

export interface TokenDictEntry {
  code: number
  decimals: number
}

/**
 * Lowercase token address → { code, decimals }.
 *
 * Range convention (spec §5.2):
 *   1-9   = Ethereum  (chainId 1)
 *  10-19  = Arbitrum  (chainId 42161)
 *  20-29  = Optimism  (chainId 10)
 *  30-39  = Polygon   (chainId 137)
 *  40-49  = Base      (chainId 8453) — reserved, not yet supported in app
 *  50-59  = Future chain 1
 *  60-69  = Future chain 2
 */
export const TOKEN_DICT: Record<string, TokenDictEntry> = {
  // --- Ethereum (chainId: 1), codes 1-9 ------------------------------------
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { code: 1, decimals: 6 },   // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { code: 2, decimals: 6 },   // USDT
  '0x6b175474e89094c44da98b954eedeac495271d0f': { code: 3, decimals: 18 },  // DAI
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { code: 4, decimals: 18 },  // WETH
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { code: 5, decimals: 8 },   // WBTC
  '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c': { code: 6, decimals: 6 },   // EURC
  '0x6c96de32cea08842dcc4058c14d3aaad7fa41dee': { code: 7, decimals: 6 },   // USDT0

  // --- Arbitrum (chainId: 42161), codes 10-19 ------------------------------
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831': { code: 10, decimals: 6 },  // USDC
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': { code: 11, decimals: 6 },  // USDC.e
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': { code: 12, decimals: 6 },  // USDT
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': { code: 13, decimals: 18 }, // DAI (also on OP — different code)
  '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': { code: 14, decimals: 18 }, // WETH
  '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': { code: 15, decimals: 8 },  // WBTC

  // --- Optimism (chainId: 10), codes 20-29 ---------------------------------
  '0x0b2c639c533813f4aa9d7837caf62653d097ff85': { code: 20, decimals: 6 },  // USDC
  '0x7f5c764cbc14f9669b88837ca1490cca17c31607': { code: 21, decimals: 6 },  // USDC.e
  '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': { code: 22, decimals: 6 },  // USDT
  // Note: DAI on Optimism shares same address as Arbitrum DAI — different code assigned
  '0x4200000000000000000000000000000000000006': { code: 24, decimals: 18 }, // WETH (also on Base — see below)
  '0x68f180fcce6836688e9084f035309e29bf0a2095': { code: 25, decimals: 8 },  // WBTC

  // --- Polygon (chainId: 137), codes 30-39 ---------------------------------
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': { code: 30, decimals: 6 },  // USDC
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { code: 31, decimals: 6 },  // USDC.e
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { code: 32, decimals: 6 },  // USDT
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': { code: 33, decimals: 18 }, // DAI
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': { code: 34, decimals: 18 }, // WETH
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': { code: 35, decimals: 8 },  // WBTC

  // --- Base (chainId: 8453), codes 40-49 — reserved, not yet in app --------
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { code: 40, decimals: 6 },  // USDC
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': { code: 41, decimals: 6 },  // USDbC
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { code: 42, decimals: 18 }, // DAI
  // Note: WETH on Base shares same address as Optimism (0x4200...0006) —
  // address collision: Optimism gets code 24, Base gets code 43.
  // The encoder must determine the correct code from chainId context.
  '0x0555e30da8f98308edb960aa94c0ed47230d2b9c': { code: 44, decimals: 8 },  // WBTC
  '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42': { code: 45, decimals: 6 },  // EURC
}

/**
 * Compact code → { address (lowercase), decimals } (reverse lookup).
 * Built at module initialization — O(1) decode.
 *
 * Special case: code 24 maps to WETH on Optimism (0x4200...0006).
 * The same address on Base uses code 43 — but TOKEN_DICT_REVERSE stores
 * only one address per code; Base WETH (code 43) is handled via separate entry.
 */
export const TOKEN_DICT_REVERSE: Record<number, { address: string; decimals: number }> = {}

// Build reverse mapping: code → { address, decimals }
// For duplicate addresses (OP WETH / Base WETH), the entry inserted last wins.
// Since OP (code 24) and Base (code 43) have different codes, there is no
// code collision — each code maps to exactly one entry.
for (const [address, entry] of Object.entries(TOKEN_DICT)) {
  TOKEN_DICT_REVERSE[entry.code] = { address, decimals: entry.decimals }
}

// Base WETH shares address 0x4200...0006 with Optimism WETH.
// TOKEN_DICT can only store one entry per address key; Base WETH is NOT in
// TOKEN_DICT (would overwrite OP entry). Add code 43 to reverse only.
TOKEN_DICT_REVERSE[43] = {
  address: '0x4200000000000000000000000000000000000006',
  decimals: 18,
}

// ---------------------------------------------------------------------------
// Compressed Text Whitelist (spec §3.4)
// ---------------------------------------------------------------------------

/**
 * Set of TLV type_ids allowed inside a Type 253 (COMPRESSED_TEXT) block.
 *
 * Decoder MUST reject with CORRUPTED_DATA if any type_id found in the
 * compressed block is not in this set. This prevents Type Spoofing —
 * a malicious compressed block overwriting business-critical fields like
 * TOTAL or FROM_WALLET.
 *
 * Allowed: optional text-heavy odd types only (5, 7, 9, 11, 13, 15, 17, 35, 37).
 * Forbidden: any even type, any binary type (1, 3, 23, 25, 29, 31, etc.).
 * Also excluded: INVOICE_ID (22, even — required, must appear as individual TLV).
 * Also excluded: TAX (19), DISCOUNT (21) — short values, compression not worth it.
 */
export const COMPRESSED_TEXT_WHITELIST = new Set<number>([
  TlvType.NOTES,           // 5
  TlvType.FROM_EMAIL,      // 7
  TlvType.FROM_PHONE,      // 9
  TlvType.FROM_ADDRESS,    // 11
  TlvType.CLIENT_EMAIL,    // 13
  TlvType.CLIENT_PHONE,    // 15
  TlvType.CLIENT_ADDRESS,  // 17
  TlvType.FROM_TAX_ID,     // 35
  TlvType.CLIENT_TAX_ID,   // 37
])

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Encode currency symbol to dictionary code.
 * Returns null if the symbol is not in the dictionary (caller should use raw UTF-8).
 */
export function encodeCurrency(symbol: string): number | null {
  return CURRENCY_DICT[symbol.toUpperCase()] ?? null
}

/**
 * Decode currency dictionary code to symbol string.
 * Returns null if code is not recognized.
 */
export function decodeCurrency(code: number): string | null {
  return CURRENCY_DICT_REVERSE[code] ?? null
}

/** Chain ID → valid token dictionary code range */
const CHAIN_CODE_RANGES: Record<number, [number, number]> = {
  1: [1, 9],       // Ethereum
  42161: [10, 19],  // Arbitrum
  10: [20, 29],     // Optimism
  137: [30, 39],    // Polygon
  8453: [40, 49],   // Base
}

/**
 * Encode token address to { code, decimals } dictionary entry.
 * When chainId is provided, validates that the resolved code falls within the chain's range.
 * Returns null if the address is not in the dictionary (caller should use raw 20 bytes).
 */
export function encodeTokenAddress(address: string, chainId?: number): TokenDictEntry | null {
  const entry = TOKEN_DICT[address.toLowerCase()] ?? null
  if (!entry || chainId == null) return entry

  const range = CHAIN_CODE_RANGES[chainId]
  if (range && (entry.code < range[0] || entry.code > range[1])) {
    // Address exists in dict but for a different chain — encode as raw bytes
    return null
  }
  return entry
}

/**
 * Decode token dictionary code to { address (lowercase), decimals }.
 * Returns null if code is not recognized.
 */
export function decodeTokenAddress(code: number): { address: string; decimals: number } | null {
  return TOKEN_DICT_REVERSE[code] ?? null
}
