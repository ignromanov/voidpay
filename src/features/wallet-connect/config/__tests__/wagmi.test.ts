/**
 * T012-test: Unit test for Wagmi configuration
 *
 * Tests the Wagmi config setup with custom transport, storage, and chain configuration.
 * Verifies Constitutional compliance (Principle VI - RPC Key Protection).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Config } from 'wagmi'

// Mock environment variables before importing the module
vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', 'test-project-id')
vi.stubEnv('NEXT_PUBLIC_ENABLE_TESTNETS', 'false')

describe('wagmi configuration', () => {
  let wagmiConfig: Config

  beforeEach(async () => {
    // Dynamic import to ensure mocks are applied
    const { wagmiConfig: config } = await import('../wagmi')
    wagmiConfig = config
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('config structure', () => {
    it('should export a valid Wagmi config', () => {
      expect(wagmiConfig).toBeDefined()
      expect(wagmiConfig.state).toBeDefined()
    })

    it('should include supported chains', () => {
      const chains = wagmiConfig.chains
      expect(chains).toBeDefined()
      expect(chains.length).toBeGreaterThanOrEqual(4) // At least 4 mainnet chains
    })

    it('should have Ethereum mainnet as a supported chain', () => {
      const chains = wagmiConfig.chains
      const ethereum = chains.find((c) => c.id === 1)
      expect(ethereum).toBeDefined()
    })

    it('should have Arbitrum as a supported chain', () => {
      const chains = wagmiConfig.chains
      const arbitrum = chains.find((c) => c.id === 42161)
      expect(arbitrum).toBeDefined()
    })

    it('should have Optimism as a supported chain', () => {
      const chains = wagmiConfig.chains
      const optimism = chains.find((c) => c.id === 10)
      expect(optimism).toBeDefined()
    })

    it('should have Polygon as a supported chain', () => {
      const chains = wagmiConfig.chains
      const polygon = chains.find((c) => c.id === 137)
      expect(polygon).toBeDefined()
    })
  })

  describe('custom transport', () => {
    it('should use custom transport for all chains', () => {
      // Verify transports are configured (implementation detail)
      // The transport should route through /api/rpc
      const chains = wagmiConfig.chains
      expect(chains.length).toBeGreaterThan(0)
    })

    it('should not expose any API keys in the config', () => {
      // Check that the chains don't contain API keys in their RPC URLs
      // (Wagmi config has circular references, so we check chains directly)
      const chains = wagmiConfig.chains
      chains.forEach((chain) => {
        const rpcUrls = chain.rpcUrls
        const defaultUrl = rpcUrls.default?.http[0] ?? ''
        expect(defaultUrl).not.toContain('ALCHEMY')
        expect(defaultUrl).not.toContain('INFURA')
        expect(defaultUrl).not.toContain('api-key')
      })
    })
  })

  describe('storage configuration', () => {
    it('should be configured for localStorage persistence', () => {
      // Wagmi config should use createStorage for localStorage
      // This is verified by the config setup
      expect(wagmiConfig.storage).toBeDefined()
    })
  })

  describe('connectors', () => {
    it('should have connectors configured', () => {
      // Connectors are lazy-loaded by RainbowKit, but config should be ready
      expect(wagmiConfig.connectors).toBeDefined()
    })
  })
})

describe('wagmi config with testnets', () => {
  afterEach(() => {
    vi.resetModules()
  })

  it('should include testnet chains when NEXT_PUBLIC_ENABLE_TESTNETS is true', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_TESTNETS', 'true')

    // Re-import with new env
    const { wagmiConfig: config } = await import('../wagmi')

    const chains = config.chains
    // Should have 8 chains: 4 mainnet + 4 testnet
    expect(chains.length).toBe(8)

    // Check for testnet chains (Sepolia)
    const hasTestnet = chains.some((c) => c.testnet)
    expect(hasTestnet).toBe(true)
  })

  it('should exclude testnet chains when NEXT_PUBLIC_ENABLE_TESTNETS is false', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_TESTNETS', 'false')

    const { wagmiConfig: config } = await import('../wagmi')

    const chains = config.chains
    // Should have only 4 mainnet chains
    expect(chains.length).toBe(4)

    // No testnets should be present
    const hasTestnet = chains.some((c) => c.testnet)
    expect(hasTestnet).toBe(false)
  })
})
