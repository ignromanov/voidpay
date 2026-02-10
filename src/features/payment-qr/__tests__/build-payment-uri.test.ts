import { describe, it, expect } from 'vitest'
import { buildPaymentUri } from '../lib/build-payment-uri'

describe('buildPaymentUri', () => {
  const recipient = '0x1234567890123456789012345678901234567890'

  describe('native token (ETH/MATIC)', () => {
    it('builds correct URI for Ethereum native', () => {
      const uri = buildPaymentUri({
        recipientAddress: recipient,
        chainId: 1,
        amount: '1000000000000000000',
      })
      expect(uri).toBe(`ethereum:${recipient}@1?value=1000000000000000000`)
    })

    it('builds correct URI for Polygon native', () => {
      const uri = buildPaymentUri({
        recipientAddress: recipient,
        chainId: 137,
        amount: '500000000000000000',
      })
      expect(uri).toBe(`ethereum:${recipient}@137?value=500000000000000000`)
    })

    it('handles zero amount', () => {
      const uri = buildPaymentUri({
        recipientAddress: recipient,
        chainId: 1,
        amount: '0',
      })
      expect(uri).toBe(`ethereum:${recipient}@1?value=0`)
    })
  })

  describe('ERC-20 token', () => {
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

    it('builds correct URI for USDC on Ethereum', () => {
      const uri = buildPaymentUri({
        recipientAddress: recipient,
        chainId: 1,
        amount: '1500000000',
        tokenAddress: usdcAddress,
      })
      expect(uri).toBe(
        `ethereum:${usdcAddress}@1/transfer?address=${recipient}&uint256=1500000000`
      )
    })

    it('builds correct URI for token on Arbitrum', () => {
      const arbToken = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
      const uri = buildPaymentUri({
        recipientAddress: recipient,
        chainId: 42161,
        amount: '2000000',
        tokenAddress: arbToken,
      })
      expect(uri).toBe(
        `ethereum:${arbToken}@42161/transfer?address=${recipient}&uint256=2000000`
      )
    })

    it('treats undefined tokenAddress as native', () => {
      const uri = buildPaymentUri({
        recipientAddress: recipient,
        chainId: 1,
        amount: '100',
        tokenAddress: undefined,
      })
      expect(uri).toBe(`ethereum:${recipient}@1?value=100`)
    })
  })

  describe('input validation', () => {
    it('throws on empty recipientAddress', () => {
      expect(() =>
        buildPaymentUri({ recipientAddress: '', chainId: 1, amount: '100' })
      ).toThrow(/Invalid recipientAddress/)
    })

    it('throws on non-0x recipientAddress', () => {
      expect(() =>
        buildPaymentUri({
          recipientAddress: '1234567890123456789012345678901234567890ab',
          chainId: 1,
          amount: '100',
        })
      ).toThrow(/Invalid recipientAddress/)
    })

    it('throws on short recipientAddress', () => {
      expect(() =>
        buildPaymentUri({ recipientAddress: '0x1234', chainId: 1, amount: '100' })
      ).toThrow(/Invalid recipientAddress/)
    })

    it('throws on zero chainId', () => {
      expect(() =>
        buildPaymentUri({ recipientAddress: recipient, chainId: 0, amount: '100' })
      ).toThrow(/Invalid chainId/)
    })

    it('throws on negative chainId', () => {
      expect(() =>
        buildPaymentUri({ recipientAddress: recipient, chainId: -1, amount: '100' })
      ).toThrow(/Invalid chainId/)
    })

    it('throws on float chainId', () => {
      expect(() =>
        buildPaymentUri({ recipientAddress: recipient, chainId: 1.5, amount: '100' })
      ).toThrow(/Invalid chainId/)
    })

    it('throws on empty amount', () => {
      expect(() =>
        buildPaymentUri({ recipientAddress: recipient, chainId: 1, amount: '' })
      ).toThrow(/Invalid amount/)
    })

    it('throws on decimal amount', () => {
      expect(() =>
        buildPaymentUri({ recipientAddress: recipient, chainId: 1, amount: '12.5' })
      ).toThrow(/Invalid amount/)
    })

    it('throws on non-numeric amount', () => {
      expect(() =>
        buildPaymentUri({ recipientAddress: recipient, chainId: 1, amount: 'abc' })
      ).toThrow(/Invalid amount/)
    })

    it('throws on invalid tokenAddress format', () => {
      expect(() =>
        buildPaymentUri({
          recipientAddress: recipient,
          chainId: 1,
          amount: '100',
          tokenAddress: '0xinvalid',
        })
      ).toThrow(/Invalid tokenAddress/)
    })
  })
})
