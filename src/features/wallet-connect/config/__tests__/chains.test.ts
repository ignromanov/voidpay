/**
 * T011-test: Unit test for chains configuration
 *
 * Tests the network chain configurations for mainnet and testnet chains.
 * Verifies correct chain IDs, metadata, and RPC URL patterns.
 */

import { describe, it, expect, afterEach } from 'vitest'
import {
  MAINNET_CHAINS,
  TESTNET_CHAINS,
  SUPPORTED_CHAIN_IDS,
  getChainById,
  getSupportedChains,
  isTestnetChain,
} from '@/shared/config'

describe('chains configuration', () => {
  describe('MAINNET_CHAINS', () => {
    it('should include Ethereum mainnet (chain ID 1)', () => {
      const ethereum = MAINNET_CHAINS.find((c) => c.id === 1)
      expect(ethereum).toBeDefined()
      expect(ethereum?.name).toContain('Ethereum')
      expect(ethereum?.nativeCurrency.symbol).toBe('ETH')
    })

    it('should include Arbitrum One (chain ID 42161)', () => {
      const arbitrum = MAINNET_CHAINS.find((c) => c.id === 42161)
      expect(arbitrum).toBeDefined()
      expect(arbitrum?.name).toContain('Arbitrum')
      expect(arbitrum?.nativeCurrency.symbol).toBe('ETH')
    })

    it('should include Optimism (chain ID 10)', () => {
      const optimism = MAINNET_CHAINS.find((c) => c.id === 10)
      expect(optimism).toBeDefined()
      // viem uses "OP Mainnet" as the official name
      expect(optimism?.name).toMatch(/OP|Optimism/)
      expect(optimism?.nativeCurrency.symbol).toBe('ETH')
    })

    it('should include Polygon PoS (chain ID 137)', () => {
      const polygon = MAINNET_CHAINS.find((c) => c.id === 137)
      expect(polygon).toBeDefined()
      expect(polygon?.name).toContain('Polygon')
      expect(polygon?.nativeCurrency.symbol).toBe('POL')
    })

    it('should have exactly 4 mainnet chains', () => {
      expect(MAINNET_CHAINS).toHaveLength(4)
    })

    it('should have block explorer URLs for all mainnet chains', () => {
      MAINNET_CHAINS.forEach((chain) => {
        expect(chain.blockExplorers).toBeDefined()
        expect(chain.blockExplorers?.default.url).toBeDefined()
        expect(chain.blockExplorers?.default.url).toMatch(/^https:\/\//)
      })
    })
  })

  describe('TESTNET_CHAINS', () => {
    it('should include Sepolia (chain ID 11155111)', () => {
      const sepolia = TESTNET_CHAINS.find((c) => c.id === 11155111)
      expect(sepolia).toBeDefined()
      expect(sepolia?.name).toContain('Sepolia')
    })

    it('should include Arbitrum Sepolia (chain ID 421614)', () => {
      const arbSepolia = TESTNET_CHAINS.find((c) => c.id === 421614)
      expect(arbSepolia).toBeDefined()
      expect(arbSepolia?.name).toContain('Arbitrum')
    })

    it('should include Optimism Sepolia (chain ID 11155420)', () => {
      const optSepolia = TESTNET_CHAINS.find((c) => c.id === 11155420)
      expect(optSepolia).toBeDefined()
      // viem uses "OP Sepolia" as the official name
      expect(optSepolia?.name).toMatch(/OP|Optimism/)
    })

    it('should include Polygon Amoy (chain ID 80002)', () => {
      const polyAmoy = TESTNET_CHAINS.find((c) => c.id === 80002)
      expect(polyAmoy).toBeDefined()
      expect(polyAmoy?.name).toMatch(/Polygon|Amoy/)
    })

    it('should have exactly 4 testnet chains', () => {
      expect(TESTNET_CHAINS).toHaveLength(4)
    })

    it('should mark all testnet chains with testnet property', () => {
      TESTNET_CHAINS.forEach((chain) => {
        expect(chain.testnet).toBe(true)
      })
    })
  })

  describe('SUPPORTED_CHAIN_IDS', () => {
    it('should include all mainnet chain IDs', () => {
      expect(SUPPORTED_CHAIN_IDS.mainnet).toContain(1)
      expect(SUPPORTED_CHAIN_IDS.mainnet).toContain(42161)
      expect(SUPPORTED_CHAIN_IDS.mainnet).toContain(10)
      expect(SUPPORTED_CHAIN_IDS.mainnet).toContain(137)
    })

    it('should include all testnet chain IDs', () => {
      expect(SUPPORTED_CHAIN_IDS.testnet).toContain(11155111)
      expect(SUPPORTED_CHAIN_IDS.testnet).toContain(421614)
      expect(SUPPORTED_CHAIN_IDS.testnet).toContain(11155420)
      expect(SUPPORTED_CHAIN_IDS.testnet).toContain(80002)
    })
  })

  describe('getChainById', () => {
    it('should return the correct chain for a valid mainnet ID', () => {
      const ethereum = getChainById(1)
      expect(ethereum).toBeDefined()
      expect(ethereum?.id).toBe(1)
    })

    it('should return the correct chain for a valid testnet ID', () => {
      const sepolia = getChainById(11155111)
      expect(sepolia).toBeDefined()
      expect(sepolia?.id).toBe(11155111)
    })

    it('should return undefined for an unsupported chain ID', () => {
      const unsupported = getChainById(999999)
      expect(unsupported).toBeUndefined()
    })
  })

  describe('getSupportedChains', () => {
    const originalEnv = process.env.NEXT_PUBLIC_ENABLE_TESTNETS

    afterEach(() => {
      process.env.NEXT_PUBLIC_ENABLE_TESTNETS = originalEnv
    })

    it('should return only mainnet chains when testnets disabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_TESTNETS = 'false'
      const chains = getSupportedChains()
      expect(chains).toHaveLength(4)
      expect(chains.every((c) => !c.testnet)).toBe(true)
    })

    it('should return mainnet and testnet chains when testnets enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_TESTNETS = 'true'
      const chains = getSupportedChains()
      expect(chains).toHaveLength(8)
    })

    it('should default to mainnet only when env var is undefined', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_TESTNETS
      const chains = getSupportedChains()
      expect(chains).toHaveLength(4)
      expect(chains.every((c) => !c.testnet)).toBe(true)
    })
  })

  describe('isTestnetChain', () => {
    it('should return true for testnet chain IDs', () => {
      expect(isTestnetChain(11155111)).toBe(true) // Sepolia
      expect(isTestnetChain(421614)).toBe(true) // Arbitrum Sepolia
      expect(isTestnetChain(11155420)).toBe(true) // Optimism Sepolia
      expect(isTestnetChain(80002)).toBe(true) // Polygon Amoy
    })

    it('should return false for mainnet chain IDs', () => {
      expect(isTestnetChain(1)).toBe(false) // Ethereum
      expect(isTestnetChain(42161)).toBe(false) // Arbitrum
      expect(isTestnetChain(10)).toBe(false) // Optimism
      expect(isTestnetChain(137)).toBe(false) // Polygon
    })

    it('should return false for unknown chain IDs', () => {
      expect(isTestnetChain(999999)).toBe(false)
    })
  })

  describe('getChainName', () => {
    it('should return chain name for known chains', async () => {
      const { getChainName } = await import('@/shared/config')
      expect(getChainName(1)).toBe('Ethereum')
      expect(getChainName(137)).toBe('Polygon')
    })

    it('should return "Unknown" for unknown chain IDs', async () => {
      const { getChainName } = await import('@/shared/config')
      expect(getChainName(999999)).toBe('Unknown')
    })
  })

  describe('getBlockExplorerUrl', () => {
    it('should return block explorer URL for known chains', async () => {
      const { getBlockExplorerUrl } = await import('@/shared/config')
      const ethUrl = getBlockExplorerUrl(1)
      expect(ethUrl).toContain('etherscan')
    })

    it('should return undefined for unknown chain IDs', async () => {
      const { getBlockExplorerUrl } = await import('@/shared/config')
      expect(getBlockExplorerUrl(999999)).toBeUndefined()
    })
  })
})
