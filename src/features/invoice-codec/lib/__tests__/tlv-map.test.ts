import { describe, expect, it } from 'vitest'
import {
  COMPRESSED_TEXT_WHITELIST,
  CURRENCY_DICT,
  CURRENCY_DICT_REVERSE,
  TlvType,
  TOKEN_DICT,
  TOKEN_DICT_REVERSE,
  decodeCurrency,
  decodeTokenAddress,
  encodeCurrency,
  encodeTokenAddress,
} from '../tlv-map'

// ---------------------------------------------------------------------------
// TlvType constants
// ---------------------------------------------------------------------------

describe('TlvType', () => {
  it('all values are numbers', () => {
    for (const [name, value] of Object.entries(TlvType)) {
      expect(typeof value, `TlvType.${name}`).toBe('number')
    }
  })

  it('no duplicate type numbers', () => {
    const values = Object.values(TlvType)
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })

  it('required types are even', () => {
    const requiredTypes = [
      TlvType.CHAIN_ID,
      TlvType.ISSUED_AT,
      TlvType.DUE_AT,
      TlvType.DECIMALS,
      TlvType.FROM_WALLET,
      TlvType.CURRENCY,
      TlvType.ITEMS,
      TlvType.FROM_NAME,
      TlvType.CLIENT_NAME,
      TlvType.SALT,
      TlvType.INVOICE_ID,
    ]
    for (const t of requiredTypes) {
      expect(t % 2, `type ${t} should be even (required)`).toBe(0)
    }
  })

  it('optional types are odd', () => {
    const optionalTypes = [
      TlvType.TOKEN_ADDRESS,
      TlvType.CLIENT_WALLET,
      TlvType.NOTES,
      TlvType.FROM_EMAIL,
      TlvType.FROM_PHONE,
      TlvType.FROM_ADDRESS,
      TlvType.CLIENT_EMAIL,
      TlvType.CLIENT_PHONE,
      TlvType.CLIENT_ADDRESS,
      TlvType.TAX,
      TlvType.DISCOUNT,
      TlvType.TOTAL,
      TlvType.MAGIC_DUST,
      TlvType.TTL,
      TlvType.DOMAIN_SEPARATOR,
      TlvType.FROM_TAX_ID,
      TlvType.CLIENT_TAX_ID,
      TlvType.COMPRESSED_TEXT,
    ]
    for (const t of optionalTypes) {
      expect(t % 2, `type ${t} should be odd (optional)`).toBe(1)
    }
  })

  it('has correct values per spec §3', () => {
    // Required (even)
    expect(TlvType.CHAIN_ID).toBe(2)
    expect(TlvType.ISSUED_AT).toBe(4)
    expect(TlvType.DUE_AT).toBe(6)
    expect(TlvType.DECIMALS).toBe(8)
    expect(TlvType.FROM_WALLET).toBe(10)
    expect(TlvType.CURRENCY).toBe(12)
    expect(TlvType.ITEMS).toBe(14)
    expect(TlvType.FROM_NAME).toBe(16)
    expect(TlvType.CLIENT_NAME).toBe(18)
    expect(TlvType.SALT).toBe(20)
    expect(TlvType.INVOICE_ID).toBe(22)

    // Optional (odd)
    expect(TlvType.TOKEN_ADDRESS).toBe(1)
    expect(TlvType.CLIENT_WALLET).toBe(3)
    expect(TlvType.NOTES).toBe(5)
    expect(TlvType.FROM_EMAIL).toBe(7)
    expect(TlvType.FROM_PHONE).toBe(9)
    expect(TlvType.FROM_ADDRESS).toBe(11)
    expect(TlvType.CLIENT_EMAIL).toBe(13)
    expect(TlvType.CLIENT_PHONE).toBe(15)
    expect(TlvType.CLIENT_ADDRESS).toBe(17)
    expect(TlvType.TAX).toBe(19)
    expect(TlvType.DISCOUNT).toBe(21)
    expect(TlvType.TOTAL).toBe(23)
    expect(TlvType.MAGIC_DUST).toBe(25)
    expect(TlvType.TTL).toBe(29)
    expect(TlvType.DOMAIN_SEPARATOR).toBe(31)
    expect(TlvType.FROM_TAX_ID).toBe(35)
    expect(TlvType.CLIENT_TAX_ID).toBe(37)
    expect(TlvType.COMPRESSED_TEXT).toBe(253)
  })
})

// ---------------------------------------------------------------------------
// Currency dictionary
// ---------------------------------------------------------------------------

describe('CURRENCY_DICT', () => {
  it('has 11 entries per spec §5.1', () => {
    expect(Object.keys(CURRENCY_DICT)).toHaveLength(11)
  })

  it('forward lookup: all expected symbols', () => {
    expect(CURRENCY_DICT['USDC']).toBe(1)
    expect(CURRENCY_DICT['USDT']).toBe(2)
    expect(CURRENCY_DICT['DAI']).toBe(3)
    expect(CURRENCY_DICT['ETH']).toBe(4)
    expect(CURRENCY_DICT['WETH']).toBe(5)
    expect(CURRENCY_DICT['MATIC']).toBe(6)
    expect(CURRENCY_DICT['POL']).toBe(7)
    expect(CURRENCY_DICT['WBTC']).toBe(8)
    expect(CURRENCY_DICT['USDC.E']).toBe(9)
    expect(CURRENCY_DICT['EURC']).toBe(10)
    expect(CURRENCY_DICT['USDT0']).toBe(11)
  })

  it('no duplicate codes in forward dict', () => {
    const codes = Object.values(CURRENCY_DICT)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('codes are positive integers in range 1-11', () => {
    for (const code of Object.values(CURRENCY_DICT)) {
      expect(code).toBeGreaterThanOrEqual(1)
      expect(code).toBeLessThanOrEqual(11)
    }
  })
})

describe('CURRENCY_DICT_REVERSE', () => {
  it('reverse lookup: all expected codes', () => {
    expect(CURRENCY_DICT_REVERSE[1]).toBe('USDC')
    expect(CURRENCY_DICT_REVERSE[2]).toBe('USDT')
    expect(CURRENCY_DICT_REVERSE[3]).toBe('DAI')
    expect(CURRENCY_DICT_REVERSE[4]).toBe('ETH')
    expect(CURRENCY_DICT_REVERSE[5]).toBe('WETH')
    expect(CURRENCY_DICT_REVERSE[6]).toBe('MATIC')
    expect(CURRENCY_DICT_REVERSE[7]).toBe('POL')
    expect(CURRENCY_DICT_REVERSE[8]).toBe('WBTC')
    expect(CURRENCY_DICT_REVERSE[9]).toBe('USDC.E')
    expect(CURRENCY_DICT_REVERSE[10]).toBe('EURC')
    expect(CURRENCY_DICT_REVERSE[11]).toBe('USDT0')
  })

  it('has same count as forward dict', () => {
    expect(Object.keys(CURRENCY_DICT_REVERSE)).toHaveLength(
      Object.keys(CURRENCY_DICT).length
    )
  })
})

// ---------------------------------------------------------------------------
// Token address dictionary
// ---------------------------------------------------------------------------

describe('TOKEN_DICT', () => {
  it('all entries have code and decimals', () => {
    for (const [addr, entry] of Object.entries(TOKEN_DICT)) {
      expect(typeof entry.code, `${addr}.code`).toBe('number')
      expect(typeof entry.decimals, `${addr}.decimals`).toBe('number')
      expect(entry.code).toBeGreaterThan(0)
      expect([6, 8, 18]).toContain(entry.decimals)
    }
  })

  it('addresses are stored lowercase', () => {
    for (const addr of Object.keys(TOKEN_DICT)) {
      expect(addr).toBe(addr.toLowerCase())
    }
  })

  it('no duplicate codes', () => {
    const codes = Object.values(TOKEN_DICT).map((e) => e.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('Ethereum range: codes 1-9', () => {
    const ethAddresses = [
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
      '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c', // EURC
      '0x6c96de32cea08842dcc4058c14d3aaad7fa41dee', // USDT0
    ]
    for (const addr of ethAddresses) {
      const entry = TOKEN_DICT[addr]
      expect(entry, `missing ETH token ${addr}`).toBeDefined()
      expect(entry!.code).toBeGreaterThanOrEqual(1)
      expect(entry!.code).toBeLessThanOrEqual(9)
    }
  })

  it('Arbitrum range: codes 10-19', () => {
    const arbAddresses = [
      '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC.e
      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
      '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', // DAI
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
      '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', // WBTC
    ]
    for (const addr of arbAddresses) {
      const entry = TOKEN_DICT[addr]
      expect(entry, `missing ARB token ${addr}`).toBeDefined()
      expect(entry!.code).toBeGreaterThanOrEqual(10)
      expect(entry!.code).toBeLessThanOrEqual(19)
    }
  })

  it('Optimism range: codes 20-29', () => {
    const opAddresses = [
      '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // USDC
      '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // USDC.e
      '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', // USDT
      '0x4200000000000000000000000000000000000006', // WETH
      '0x68f180fcce6836688e9084f035309e29bf0a2095', // WBTC
    ]
    for (const addr of opAddresses) {
      const entry = TOKEN_DICT[addr]
      expect(entry, `missing OP token ${addr}`).toBeDefined()
      expect(entry!.code).toBeGreaterThanOrEqual(20)
      expect(entry!.code).toBeLessThanOrEqual(29)
    }
  })

  it('Polygon range: codes 30-39', () => {
    const polyAddresses = [
      '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // USDC
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC.e
      '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
      '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
      '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
      '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', // WBTC
    ]
    for (const addr of polyAddresses) {
      const entry = TOKEN_DICT[addr]
      expect(entry, `missing POLY token ${addr}`).toBeDefined()
      expect(entry!.code).toBeGreaterThanOrEqual(30)
      expect(entry!.code).toBeLessThanOrEqual(39)
    }
  })

  it('Base range: codes 40-49 (reserved)', () => {
    const baseAddresses = [
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
      '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca', // USDbC
      '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', // DAI
      '0x0555e30da8f98308edb960aa94c0ed47230d2b9c', // WBTC
      '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42', // EURC
    ]
    for (const addr of baseAddresses) {
      const entry = TOKEN_DICT[addr]
      expect(entry, `missing Base token ${addr}`).toBeDefined()
      expect(entry!.code).toBeGreaterThanOrEqual(40)
      expect(entry!.code).toBeLessThanOrEqual(49)
    }
  })

  it('decimals cross-check: known tokens have expected decimals', () => {
    // USDC = 6 decimals on all chains
    expect(TOKEN_DICT['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']!.decimals).toBe(6) // ETH USDC
    expect(TOKEN_DICT['0xaf88d065e77c8cc2239327c5edb3a432268e5831']!.decimals).toBe(6) // ARB USDC
    expect(TOKEN_DICT['0x0b2c639c533813f4aa9d7837caf62653d097ff85']!.decimals).toBe(6) // OP USDC
    expect(TOKEN_DICT['0x3c499c542cef5e3811e1192ce70d8cc03d5c3359']!.decimals).toBe(6) // POLY USDC

    // WETH = 18 decimals on all chains
    expect(TOKEN_DICT['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2']!.decimals).toBe(18) // ETH WETH
    expect(TOKEN_DICT['0x82af49447d8a07e3bd95bd0d56f35241523fbab1']!.decimals).toBe(18) // ARB WETH
    expect(TOKEN_DICT['0x4200000000000000000000000000000000000006']!.decimals).toBe(18)  // OP WETH

    // WBTC = 8 decimals on all chains
    expect(TOKEN_DICT['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599']!.decimals).toBe(8)  // ETH WBTC
    expect(TOKEN_DICT['0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f']!.decimals).toBe(8)  // ARB WBTC
    expect(TOKEN_DICT['0x68f180fcce6836688e9084f035309e29bf0a2095']!.decimals).toBe(8)  // OP WBTC
    expect(TOKEN_DICT['0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6']!.decimals).toBe(8)  // POLY WBTC

    // DAI = 18 decimals
    expect(TOKEN_DICT['0x6b175474e89094c44da98b954eedeac495271d0f']!.decimals).toBe(18) // ETH DAI
    expect(TOKEN_DICT['0xda10009cbd5d07dd0cecc66161fc93d7c9000da1']!.decimals).toBe(18) // ARB DAI
    expect(TOKEN_DICT['0x8f3cf7ad23cd3cadbd9735aff958023239c6a063']!.decimals).toBe(18) // POLY DAI

    // EURC = 6 decimals
    expect(TOKEN_DICT['0x1abaea1f7c830bd89acc67ec4af516284b1bc33c']!.decimals).toBe(6)  // ETH EURC
  })
})

describe('TOKEN_DICT_REVERSE', () => {
  it('code 1 → ETH USDC with 6 decimals', () => {
    const entry = TOKEN_DICT_REVERSE[1]
    expect(entry).toBeDefined()
    expect(entry!.address).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    expect(entry!.decimals).toBe(6)
  })

  it('code 4 → ETH WETH with 18 decimals', () => {
    const entry = TOKEN_DICT_REVERSE[4]
    expect(entry).toBeDefined()
    expect(entry!.address).toBe('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
    expect(entry!.decimals).toBe(18)
  })

  it('code 10 → ARB USDC with 6 decimals', () => {
    const entry = TOKEN_DICT_REVERSE[10]
    expect(entry).toBeDefined()
    expect(entry!.address).toBe('0xaf88d065e77c8cc2239327c5edb3a432268e5831')
    expect(entry!.decimals).toBe(6)
  })

  it('code 20 → OP USDC with 6 decimals', () => {
    const entry = TOKEN_DICT_REVERSE[20]
    expect(entry).toBeDefined()
    expect(entry!.address).toBe('0x0b2c639c533813f4aa9d7837caf62653d097ff85')
    expect(entry!.decimals).toBe(6)
  })

  it('code 30 → POLY USDC with 6 decimals', () => {
    const entry = TOKEN_DICT_REVERSE[30]
    expect(entry).toBeDefined()
    expect(entry!.address).toBe('0x3c499c542cef5e3811e1192ce70d8cc03d5c3359')
    expect(entry!.decimals).toBe(6)
  })

  it('code 40 → Base USDC with 6 decimals', () => {
    const entry = TOKEN_DICT_REVERSE[40]
    expect(entry).toBeDefined()
    expect(entry!.address).toBe('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913')
    expect(entry!.decimals).toBe(6)
  })

  it('code 43 → Base WETH with 18 decimals (special reverse-only entry)', () => {
    const entry = TOKEN_DICT_REVERSE[43]
    expect(entry).toBeDefined()
    expect(entry!.address).toBe('0x4200000000000000000000000000000000000006')
    expect(entry!.decimals).toBe(18)
  })

  it('no duplicate codes in reverse dict (excluding code 43 special case)', () => {
    // All codes from TOKEN_DICT must map 1-to-1 in reverse
    const forwardCodes = Object.values(TOKEN_DICT).map((e) => e.code)
    for (const code of forwardCodes) {
      expect(TOKEN_DICT_REVERSE[code]).toBeDefined()
    }
  })

  it('addresses in reverse dict are lowercase', () => {
    for (const [, entry] of Object.entries(TOKEN_DICT_REVERSE)) {
      expect(entry.address).toBe(entry.address.toLowerCase())
    }
  })
})

// ---------------------------------------------------------------------------
// encodeCurrency / decodeCurrency
// ---------------------------------------------------------------------------

describe('encodeCurrency', () => {
  it('returns correct code for known symbols', () => {
    expect(encodeCurrency('USDC')).toBe(1)
    expect(encodeCurrency('USDT')).toBe(2)
    expect(encodeCurrency('DAI')).toBe(3)
    expect(encodeCurrency('ETH')).toBe(4)
    expect(encodeCurrency('WETH')).toBe(5)
    expect(encodeCurrency('EURC')).toBe(10)
    expect(encodeCurrency('USDT0')).toBe(11)
  })

  it('is case-insensitive', () => {
    expect(encodeCurrency('usdc')).toBe(1)
    expect(encodeCurrency('Usdt')).toBe(2)
    expect(encodeCurrency('weth')).toBe(5)
  })

  it('returns null for unknown symbol', () => {
    expect(encodeCurrency('UNKNOWN')).toBeNull()
    expect(encodeCurrency('')).toBeNull()
    expect(encodeCurrency('BTC')).toBeNull()
  })
})

describe('decodeCurrency', () => {
  it('returns correct symbol for known codes', () => {
    expect(decodeCurrency(1)).toBe('USDC')
    expect(decodeCurrency(2)).toBe('USDT')
    expect(decodeCurrency(3)).toBe('DAI')
    expect(decodeCurrency(4)).toBe('ETH')
    expect(decodeCurrency(5)).toBe('WETH')
    expect(decodeCurrency(10)).toBe('EURC')
    expect(decodeCurrency(11)).toBe('USDT0')
  })

  it('returns null for unknown code', () => {
    expect(decodeCurrency(0)).toBeNull()
    expect(decodeCurrency(12)).toBeNull()
    expect(decodeCurrency(255)).toBeNull()
  })
})

describe('encodeCurrency / decodeCurrency roundtrip', () => {
  it('all dictionary entries roundtrip correctly', () => {
    for (const symbol of Object.keys(CURRENCY_DICT)) {
      const code = encodeCurrency(symbol)
      expect(code).not.toBeNull()
      const decoded = decodeCurrency(code!)
      expect(decoded).toBe(symbol)
    }
  })
})

// ---------------------------------------------------------------------------
// encodeTokenAddress / decodeTokenAddress
// ---------------------------------------------------------------------------

describe('encodeTokenAddress', () => {
  it('returns entry for known addresses', () => {
    const entry = encodeTokenAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    expect(entry).not.toBeNull()
    expect(entry!.code).toBe(1)
    expect(entry!.decimals).toBe(6)
  })

  it('is case-insensitive', () => {
    const lower = encodeTokenAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    const upper = encodeTokenAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
    const mixed = encodeTokenAddress('0xA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
    expect(lower).toEqual(upper)
    expect(lower).toEqual(mixed)
  })

  it('returns null for unknown address', () => {
    expect(encodeTokenAddress('0x0000000000000000000000000000000000000000')).toBeNull()
    expect(encodeTokenAddress('')).toBeNull()
  })

  it('ARB USDC encodes correctly', () => {
    const entry = encodeTokenAddress('0xaf88d065e77c8cc2239327c5edb3a432268e5831')
    expect(entry!.code).toBe(10)
    expect(entry!.decimals).toBe(6)
  })
})

describe('decodeTokenAddress', () => {
  it('returns entry for known codes', () => {
    const entry = decodeTokenAddress(1)
    expect(entry).not.toBeNull()
    expect(entry!.address).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    expect(entry!.decimals).toBe(6)
  })

  it('returns null for unknown code', () => {
    expect(decodeTokenAddress(0)).toBeNull()
    expect(decodeTokenAddress(99)).toBeNull()
    expect(decodeTokenAddress(255)).toBeNull()
  })

  it('Base WETH (code 43) decodes correctly', () => {
    const entry = decodeTokenAddress(43)
    expect(entry).not.toBeNull()
    expect(entry!.address).toBe('0x4200000000000000000000000000000000000006')
    expect(entry!.decimals).toBe(18)
  })
})

describe('encodeTokenAddress / decodeTokenAddress roundtrip', () => {
  it('all TOKEN_DICT entries roundtrip correctly', () => {
    for (const [address, { code, decimals }] of Object.entries(TOKEN_DICT)) {
      const encoded = encodeTokenAddress(address)
      expect(encoded, `encode ${address}`).not.toBeNull()
      expect(encoded!.code, `code for ${address}`).toBe(code)
      expect(encoded!.decimals, `decimals for ${address}`).toBe(decimals)

      const decoded = decodeTokenAddress(code)
      expect(decoded, `decode code ${code}`).not.toBeNull()
      expect(decoded!.address, `address for code ${code}`).toBe(address)
      expect(decoded!.decimals, `decimals for code ${code}`).toBe(decimals)
    }
  })
})

// ---------------------------------------------------------------------------
// COMPRESSED_TEXT_WHITELIST
// ---------------------------------------------------------------------------

describe('COMPRESSED_TEXT_WHITELIST', () => {
  it('contains exactly the text-heavy optional types from spec §3.4', () => {
    // Allowed: 5, 7, 9, 11, 13, 15, 17, 35, 37
    expect(COMPRESSED_TEXT_WHITELIST.has(5)).toBe(true)   // NOTES
    expect(COMPRESSED_TEXT_WHITELIST.has(7)).toBe(true)   // FROM_EMAIL
    expect(COMPRESSED_TEXT_WHITELIST.has(9)).toBe(true)   // FROM_PHONE
    expect(COMPRESSED_TEXT_WHITELIST.has(11)).toBe(true)  // FROM_ADDRESS
    expect(COMPRESSED_TEXT_WHITELIST.has(13)).toBe(true)  // CLIENT_EMAIL
    expect(COMPRESSED_TEXT_WHITELIST.has(15)).toBe(true)  // CLIENT_PHONE
    expect(COMPRESSED_TEXT_WHITELIST.has(17)).toBe(true)  // CLIENT_ADDRESS
    expect(COMPRESSED_TEXT_WHITELIST.has(35)).toBe(true)  // FROM_TAX_ID
    expect(COMPRESSED_TEXT_WHITELIST.has(37)).toBe(true)  // CLIENT_TAX_ID
  })

  it('has exactly 9 entries', () => {
    expect(COMPRESSED_TEXT_WHITELIST.size).toBe(9)
  })

  it('does NOT contain forbidden types', () => {
    // Even (required) types must not appear in compressed block
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.CHAIN_ID)).toBe(false)      // 2
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.ISSUED_AT)).toBe(false)     // 4
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.DUE_AT)).toBe(false)        // 6
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.DECIMALS)).toBe(false)      // 8
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.FROM_WALLET)).toBe(false)   // 10
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.CURRENCY)).toBe(false)      // 12
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.ITEMS)).toBe(false)         // 14
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.FROM_NAME)).toBe(false)     // 16
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.CLIENT_NAME)).toBe(false)   // 18
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.SALT)).toBe(false)          // 20
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.INVOICE_ID)).toBe(false)    // 22

    // Binary/numeric odd types must not appear in compressed block
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.TOKEN_ADDRESS)).toBe(false) // 1
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.CLIENT_WALLET)).toBe(false) // 3
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.TOTAL)).toBe(false)         // 23
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.MAGIC_DUST)).toBe(false)    // 25
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.TTL)).toBe(false)           // 29
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.DOMAIN_SEPARATOR)).toBe(false) // 31
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.COMPRESSED_TEXT)).toBe(false)  // 253

    // TAX (19) and DISCOUNT (21) excluded — short values, not worth compressing
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.TAX)).toBe(false)
    expect(COMPRESSED_TEXT_WHITELIST.has(TlvType.DISCOUNT)).toBe(false)
  })

  it('all whitelist entries are odd (optional) types', () => {
    for (const typeId of COMPRESSED_TEXT_WHITELIST) {
      expect(typeId % 2, `type ${typeId} in whitelist should be odd`).toBe(1)
    }
  })
})
