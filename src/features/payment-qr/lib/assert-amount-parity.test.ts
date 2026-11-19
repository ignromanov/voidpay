import { describe, it, expect } from 'vitest'
import { assertAmountParity, extractLinkAmount, isAmountParityOk } from './assert-amount-parity'
import { buildWalletDeepLink } from './build-wallet-deeplink'

const R = '0x1111111111111111111111111111111111111111'
const T = '0x2222222222222222222222222222222222222222'

describe('assertAmountParity', () => {
  it('passes for a native link whose value= equals exactTotal', () => {
    const href = buildWalletDeepLink('metamask', { recipientAddress: R, chainId: 1, amount: '1000000000000042' })
    expect(() => assertAmountParity(href, 1000000000000042n)).not.toThrow()
  })

  it('passes for an ERC-20 link whose uint256= equals exactTotal (string input)', () => {
    const href = buildWalletDeepLink('metamask', { recipientAddress: R, chainId: 42161, amount: '1250042', tokenAddress: T })
    expect(() => assertAmountParity(href, '1250042')).not.toThrow()
  })

  it('throws when the href amount diverges from exactTotal, without leaking amounts', () => {
    const href = buildWalletDeepLink('metamask', { recipientAddress: R, chainId: 1, amount: '1250000' })
    expect(() => assertAmountParity(href, 1250042n)).toThrow(/amount parity/)
    try {
      assertAmountParity(href, 1250042n)
    } catch (e) {
      expect((e as Error).message).not.toMatch(/1250|0x1111/)
    }
  })

  it('fails closed when the href carries no amount or a non-integer amount', () => {
    expect(isAmountParityOk('https://link.metamask.io/send/0x1@1', 1n)).toBe(false)
    expect(isAmountParityOk('ethereum:0x1@1?value=1.5', 1n)).toBe(false)
    expect(isAmountParityOk('ethereum:0x1@1?value=1', 'not-a-number')).toBe(false)
  })

  it('extractLinkAmount reads value= and uint256=', () => {
    expect(extractLinkAmount('ethereum:0x1@1?value=42')).toBe(42n)
    expect(extractLinkAmount('ethereum:0x1@1/transfer?address=0x2&uint256=7')).toBe(7n)
  })
})
