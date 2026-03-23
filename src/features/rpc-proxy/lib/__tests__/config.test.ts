/**
 * loadRpcConfig Tests
 * Feature: 004-rpc-proxy-failover
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadRpcConfig } from '../config'

vi.mock('@/entities/network', async () => {
  const actual = await vi.importActual('@/entities/network')
  return {
    ...actual,
    getChainById: vi.fn(),
  }
})

import { getChainById } from '@/entities/network'

const mockGetChainById = vi.mocked(getChainById)

const MOCK_ALCHEMY_KEY = 'test-alchemy-key'
const MOCK_INFURA_KEY = 'test-infura-key'

/** Returns a minimal chain object that satisfies the getChainById return shape */
function mockChain(id: number, name: string) {
  return { id, name } as ReturnType<typeof getChainById>
}

describe('loadRpcConfig', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env.NODE_ENV = 'development'
    process.env.ALCHEMY_API_KEY = MOCK_ALCHEMY_KEY
    process.env.INFURA_API_KEY = MOCK_INFURA_KEY
  })

  afterEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  it('Ethereum (chainId 1) builds correct Alchemy and Infura URLs', () => {
    mockGetChainById.mockReturnValue(mockChain(1, 'Ethereum'))

    const config = loadRpcConfig(1)

    expect(config.providers.primary.url).toBe(
      `https://eth-mainnet.g.alchemy.com/v2/${MOCK_ALCHEMY_KEY}`,
    )
    expect(config.providers.fallback.url).toBe(
      `https://mainnet.infura.io/v3/${MOCK_INFURA_KEY}`,
    )
    expect(config.providers.primary.name).toBe('Alchemy')
    expect(config.providers.fallback.name).toBe('Infura')
  })

  it('Arbitrum (chainId 42161) builds correct RPC URLs', () => {
    mockGetChainById.mockReturnValue(mockChain(42161, 'Arbitrum One'))

    const config = loadRpcConfig(42161)

    expect(config.providers.primary.url).toBe(
      `https://arb-mainnet.g.alchemy.com/v2/${MOCK_ALCHEMY_KEY}`,
    )
    expect(config.providers.fallback.url).toBe(
      `https://arbitrum-mainnet.infura.io/v3/${MOCK_INFURA_KEY}`,
    )
  })

  it('Optimism (chainId 10) builds correct RPC URLs', () => {
    mockGetChainById.mockReturnValue(mockChain(10, 'OP Mainnet'))

    const config = loadRpcConfig(10)

    expect(config.providers.primary.url).toBe(
      `https://opt-mainnet.g.alchemy.com/v2/${MOCK_ALCHEMY_KEY}`,
    )
    expect(config.providers.fallback.url).toBe(
      `https://optimism-mainnet.infura.io/v3/${MOCK_INFURA_KEY}`,
    )
  })

  it('Polygon (chainId 137) builds correct RPC URLs', () => {
    mockGetChainById.mockReturnValue(mockChain(137, 'Polygon'))

    const config = loadRpcConfig(137)

    expect(config.providers.primary.url).toBe(
      `https://polygon-mainnet.g.alchemy.com/v2/${MOCK_ALCHEMY_KEY}`,
    )
    expect(config.providers.fallback.url).toBe(
      `https://polygon-mainnet.infura.io/v3/${MOCK_INFURA_KEY}`,
    )
  })

  it('unsupported chainId throws an error', () => {
    mockGetChainById.mockReturnValue(undefined)

    expect(() => loadRpcConfig(999999)).toThrow('Unsupported chain ID: 999999')
  })

  it('default chainId (no argument) defaults to Ethereum mainnet (chainId 1)', () => {
    mockGetChainById.mockReturnValue(mockChain(1, 'Ethereum'))

    const config = loadRpcConfig()

    expect(config.providers.primary.url).toContain('eth-mainnet.g.alchemy.com')
    expect(config.providers.fallback.url).toContain('mainnet.infura.io')
  })

  it('missing API keys in production throws an error', () => {
    mockGetChainById.mockReturnValue(mockChain(1, 'Ethereum'))
    process.env.NODE_ENV = 'production'
    delete process.env.ALCHEMY_API_KEY

    expect(() => loadRpcConfig(1)).toThrow('ALCHEMY_API_KEY is required in production')
  })

  it('missing Infura key in production throws an error', () => {
    mockGetChainById.mockReturnValue(mockChain(1, 'Ethereum'))
    process.env.NODE_ENV = 'production'
    delete process.env.INFURA_API_KEY

    expect(() => loadRpcConfig(1)).toThrow('INFURA_API_KEY is required in production')
  })

  it('in development, missing API keys produce empty URL strings instead of throwing', () => {
    mockGetChainById.mockReturnValue(mockChain(1, 'Ethereum'))
    process.env.NODE_ENV = 'development'
    delete process.env.ALCHEMY_API_KEY
    delete process.env.INFURA_API_KEY

    const config = loadRpcConfig(1)

    expect(config.providers.primary.url).toBe('')
    expect(config.providers.fallback.url).toBe('')
    expect(config.mock.enabled).toBe(true)
  })

  it('returned config includes expected rate limit and mock shape', () => {
    mockGetChainById.mockReturnValue(mockChain(1, 'Ethereum'))

    const config = loadRpcConfig(1)

    expect(config.rateLimit).toEqual({ requestsPerMinute: 100, windowSeconds: 60 })
    expect(config.mock).toEqual({ enabled: true })
  })
})
