import { describe, it, expect } from 'vitest'
import { findTokenForNetwork, NETWORK_TOKENS } from '../tokens'

describe('findTokenForNetwork', () => {
  it('finds USDC on Ethereum (chainId 1)', () => {
    const token = findTokenForNetwork(1, 'USDC')
    expect(token).toBeDefined()
    expect(token!.symbol).toBe('USDC')
    expect(token!.decimals).toBe(6)
    expect(token!.address).toBeTruthy()
  })

  it('finds USDC on Arbitrum (chainId 42161)', () => {
    const token = findTokenForNetwork(42161, 'USDC')
    expect(token).toBeDefined()
    expect(token!.symbol).toBe('USDC')
    expect(token!.address).toBe('0xaf88d065e77c8cc2239327c5edb3a432268e5831')
  })

  it('finds USDC on Optimism (chainId 10)', () => {
    const token = findTokenForNetwork(10, 'USDC')
    expect(token).toBeDefined()
    expect(token!.symbol).toBe('USDC')
  })

  it('finds USDC on Polygon (chainId 137)', () => {
    const token = findTokenForNetwork(137, 'USDC')
    expect(token).toBeDefined()
    expect(token!.symbol).toBe('USDC')
  })

  it('returns undefined for unknown symbol', () => {
    const token = findTokenForNetwork(1, 'NONEXISTENT')
    expect(token).toBeUndefined()
  })

  it('returns undefined for unknown chainId', () => {
    const token = findTokenForNetwork(99999, 'USDC')
    expect(token).toBeUndefined()
  })

  it('finds native token (ETH) with null address', () => {
    const token = findTokenForNetwork(1, 'ETH')
    expect(token).toBeDefined()
    expect(token!.address).toBeNull()
    expect(token!.decimals).toBe(18)
  })
})
