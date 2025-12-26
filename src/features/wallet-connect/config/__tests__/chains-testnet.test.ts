/**
 * T050-test: Unit test for testnet filtering logic
 *
 * Tests the environment-based testnet chain filtering.
 * Uses direct import from chains.ts to avoid wagmiConfig initialization.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

describe('chains testnet filtering', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getSupportedChains with testnet flag', () => {
    it(
      'should return only mainnet chains when NEXT_PUBLIC_ENABLE_TESTNETS is false',
      async () => {
        vi.stubEnv('NEXT_PUBLIC_ENABLE_TESTNETS', 'false')

        // Import directly from chains.ts to avoid wagmiConfig initialization
        const { getSupportedChains } = await import('@/shared/config/chains')
        const chains = getSupportedChains()

        expect(chains.length).toBe(4)
        expect(chains.every((c) => !c.testnet)).toBe(true)
      },
      15000
    )

    it(
      'should return all chains when NEXT_PUBLIC_ENABLE_TESTNETS is true',
      async () => {
        vi.stubEnv('NEXT_PUBLIC_ENABLE_TESTNETS', 'true')

        const { getSupportedChains } = await import('@/shared/config/chains')
        const chains = getSupportedChains()

        expect(chains.length).toBe(8)
      },
      15000
    )

    it(
      'should include Sepolia when testnets enabled',
      async () => {
        vi.stubEnv('NEXT_PUBLIC_ENABLE_TESTNETS', 'true')

        const { getSupportedChains } = await import('@/shared/config/chains')
        const chains = getSupportedChains()

        const sepolia = chains.find((c) => c.id === 11155111)
        expect(sepolia).toBeDefined()
        expect(sepolia?.testnet).toBe(true)
      },
      15000
    )

    it(
      'should exclude Sepolia when testnets disabled',
      async () => {
        vi.stubEnv('NEXT_PUBLIC_ENABLE_TESTNETS', 'false')

        const { getSupportedChains } = await import('@/shared/config/chains')
        const chains = getSupportedChains()

        const sepolia = chains.find((c) => c.id === 11155111)
        expect(sepolia).toBeUndefined()
      },
      15000
    )
  })

  describe('isTestnetChain', () => {
    it('should identify testnet chains correctly', async () => {
      const { isTestnetChain } = await import('@/shared/config/chains')

      // Testnets
      expect(isTestnetChain(11155111)).toBe(true) // Sepolia
      expect(isTestnetChain(421614)).toBe(true) // Arbitrum Sepolia
      expect(isTestnetChain(11155420)).toBe(true) // OP Sepolia
      expect(isTestnetChain(80002)).toBe(true) // Polygon Amoy

      // Mainnets
      expect(isTestnetChain(1)).toBe(false)
      expect(isTestnetChain(42161)).toBe(false)
      expect(isTestnetChain(10)).toBe(false)
      expect(isTestnetChain(137)).toBe(false)
    })
  })
})
