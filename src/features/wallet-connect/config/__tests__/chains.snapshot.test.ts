/**
 * T031-test: Snapshot test for chain IDs and explorer URLs
 *
 * Ensures chain configurations don't accidentally change.
 */

import { describe, it, expect } from 'vitest'
import { MAINNET_CHAINS, TESTNET_CHAINS, SUPPORTED_CHAIN_IDS } from '@/shared/config'

describe('chains snapshot tests', () => {
  describe('SUPPORTED_CHAIN_IDS', () => {
    it('should have stable mainnet chain IDs', () => {
      expect(SUPPORTED_CHAIN_IDS.mainnet).toMatchInlineSnapshot(`
        [
          1,
          42161,
          10,
          137,
        ]
      `)
    })

    it('should have stable testnet chain IDs', () => {
      expect(SUPPORTED_CHAIN_IDS.testnet).toMatchInlineSnapshot(`
        [
          11155111,
          421614,
          11155420,
          80002,
        ]
      `)
    })
  })

  describe('chain explorer URLs', () => {
    it('should have stable mainnet explorer URLs', () => {
      const explorerUrls = MAINNET_CHAINS.map((chain) => ({
        id: chain.id,
        name: chain.name,
        explorerUrl: chain.blockExplorers?.default.url,
      }))

      expect(explorerUrls).toMatchInlineSnapshot(`
        [
          {
            "explorerUrl": "https://etherscan.io",
            "id": 1,
            "name": "Ethereum",
          },
          {
            "explorerUrl": "https://arbiscan.io",
            "id": 42161,
            "name": "Arbitrum One",
          },
          {
            "explorerUrl": "https://optimistic.etherscan.io",
            "id": 10,
            "name": "OP Mainnet",
          },
          {
            "explorerUrl": "https://polygonscan.com",
            "id": 137,
            "name": "Polygon",
          },
        ]
      `)
    })

    it('should have stable testnet explorer URLs', () => {
      const explorerUrls = TESTNET_CHAINS.map((chain) => ({
        id: chain.id,
        name: chain.name,
        explorerUrl: chain.blockExplorers?.default.url,
      }))

      expect(explorerUrls).toMatchInlineSnapshot(`
        [
          {
            "explorerUrl": "https://sepolia.etherscan.io",
            "id": 11155111,
            "name": "Sepolia",
          },
          {
            "explorerUrl": "https://sepolia.arbiscan.io",
            "id": 421614,
            "name": "Arbitrum Sepolia",
          },
          {
            "explorerUrl": "https://optimism-sepolia.blockscout.com",
            "id": 11155420,
            "name": "OP Sepolia",
          },
          {
            "explorerUrl": "https://amoy.polygonscan.com",
            "id": 80002,
            "name": "Polygon Amoy",
          },
        ]
      `)
    })
  })

  describe('chain native currencies', () => {
    it('should have correct native currency for mainnet chains', () => {
      const currencies = MAINNET_CHAINS.map((chain) => ({
        id: chain.id,
        symbol: chain.nativeCurrency.symbol,
        decimals: chain.nativeCurrency.decimals,
      }))

      expect(currencies).toMatchInlineSnapshot(`
        [
          {
            "decimals": 18,
            "id": 1,
            "symbol": "ETH",
          },
          {
            "decimals": 18,
            "id": 42161,
            "symbol": "ETH",
          },
          {
            "decimals": 18,
            "id": 10,
            "symbol": "ETH",
          },
          {
            "decimals": 18,
            "id": 137,
            "symbol": "POL",
          },
        ]
      `)
    })
  })
})
