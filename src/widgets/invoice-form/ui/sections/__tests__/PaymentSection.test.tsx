import { describe, it, expect } from 'vitest'
import { findTokenForNetwork, NETWORK_TOKENS } from '@/entities/network'

describe('PaymentSection network change logic', () => {
  it('findTokenForNetwork returns USDC for all supported networks', () => {
    const chainIds = [1, 42161, 10, 137]
    for (const chainId of chainIds) {
      const token = findTokenForNetwork(chainId, 'USDC')
      expect(token).toBeDefined()
      expect(token!.symbol).toBe('USDC')
      expect(token!.decimals).toBe(6)
    }
  })

  it('fallback to first token when symbol not found', () => {
    const chainId = 1
    const token = findTokenForNetwork(chainId, 'NONEXISTENT')
    expect(token).toBeUndefined()
    const fallback = NETWORK_TOKENS[chainId]?.[0]
    expect(fallback).toBeDefined()
    expect(fallback!.symbol).toBe('ETH')
  })
})
