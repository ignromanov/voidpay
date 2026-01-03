/**
 * Dictionary Compression Tests
 * Tests for currency and token dictionary encoding
 */

import { describe, it, expect } from 'vitest'
import {
  CURRENCY_DICT,
  CURRENCY_DICT_REVERSE,
  TOKEN_DICT,
  TOKEN_DICT_REVERSE,
  encodeDictString,
  decodeDictString,
} from '../dictionary'

describe('dictionary compression', () => {
  describe('CURRENCY_DICT', () => {
    it('contains common stablecoins', () => {
      expect(CURRENCY_DICT['USDC']).toBe(1)
      expect(CURRENCY_DICT['USDT']).toBe(2)
      expect(CURRENCY_DICT['DAI']).toBe(3)
    })

    it('contains native tokens', () => {
      expect(CURRENCY_DICT['ETH']).toBe(4)
      expect(CURRENCY_DICT['MATIC']).toBe(6)
    })

    it('contains wrapped tokens', () => {
      expect(CURRENCY_DICT['WETH']).toBe(5)
    })

    it('contains L2 tokens', () => {
      expect(CURRENCY_DICT['ARB']).toBe(7)
      expect(CURRENCY_DICT['OP']).toBe(8)
    })
  })

  describe('CURRENCY_DICT_REVERSE', () => {
    it('maps codes back to currency symbols', () => {
      expect(CURRENCY_DICT_REVERSE[1]).toBe('USDC')
      expect(CURRENCY_DICT_REVERSE[4]).toBe('ETH')
    })

    it('has same number of entries as forward dict', () => {
      expect(Object.keys(CURRENCY_DICT_REVERSE).length).toBe(Object.keys(CURRENCY_DICT).length)
    })
  })

  describe('TOKEN_DICT', () => {
    it('contains Ethereum mainnet USDC', () => {
      expect(TOKEN_DICT['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']).toBe(1)
    })

    it('contains Ethereum mainnet USDT', () => {
      expect(TOKEN_DICT['0xdac17f958d2ee523a2206206994597c13d831ec7']).toBe(2)
    })

    it('contains Polygon tokens', () => {
      expect(TOKEN_DICT['0x2791bca1f2de4661ed88a30c99a7a9449aa84174']).toBe(5)
    })

    it('contains Arbitrum tokens', () => {
      expect(TOKEN_DICT['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8']).toBe(8)
    })
  })

  describe('TOKEN_DICT_REVERSE', () => {
    it('maps codes back to addresses', () => {
      expect(TOKEN_DICT_REVERSE[1]).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    })
  })

  describe('encodeDictString', () => {
    it('encodes known currency to code', () => {
      expect(encodeDictString('USDC', CURRENCY_DICT)).toBe(1)
      expect(encodeDictString('ETH', CURRENCY_DICT)).toBe(4)
    })

    it('is case-insensitive', () => {
      expect(encodeDictString('usdc', CURRENCY_DICT)).toBe(1)
      expect(encodeDictString('Usdc', CURRENCY_DICT)).toBe(1)
      expect(encodeDictString('USDC', CURRENCY_DICT)).toBe(1)
    })

    it('returns null for unknown strings', () => {
      expect(encodeDictString('UNKNOWN', CURRENCY_DICT)).toBeNull()
      expect(encodeDictString('', CURRENCY_DICT)).toBeNull()
    })

    it('works with token addresses', () => {
      const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
      expect(encodeDictString(usdcAddress, TOKEN_DICT)).toBe(1)
    })

    it('is case-insensitive for addresses', () => {
      const usdcLower = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
      const usdcUpper = '0xA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48'
      expect(encodeDictString(usdcLower, TOKEN_DICT)).toBe(1)
      expect(encodeDictString(usdcUpper, TOKEN_DICT)).toBe(1)
    })
  })

  describe('decodeDictString', () => {
    it('decodes code to currency symbol', () => {
      expect(decodeDictString(1, CURRENCY_DICT_REVERSE)).toBe('USDC')
      expect(decodeDictString(4, CURRENCY_DICT_REVERSE)).toBe('ETH')
    })

    it('returns null for unknown code', () => {
      expect(decodeDictString(999, CURRENCY_DICT_REVERSE)).toBeNull()
      expect(decodeDictString(0, CURRENCY_DICT_REVERSE)).toBeNull()
    })

    it('decodes token addresses', () => {
      expect(decodeDictString(1, TOKEN_DICT_REVERSE)).toBe(
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
      )
    })
  })
})
