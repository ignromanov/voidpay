import { describe, it, expect } from 'vitest'
import { buildWalletDeepLink } from './build-wallet-deeplink'

const ERC20 = {
  recipientAddress: '0x1111111111111111111111111111111111111111',
  chainId: 42161,
  amount: '1250042',
  tokenAddress: '0x2222222222222222222222222222222222222222',
} as const

const NATIVE = {
  recipientAddress: '0x1111111111111111111111111111111111111111',
  chainId: 1,
  amount: '1000000000000042',
} as const

describe('buildWalletDeepLink', () => {
  it('builds a MetaMask ERC-20 universal link (link.metamask.io, EIP-681 mirror)', () => {
    expect(buildWalletDeepLink('metamask', ERC20)).toBe(
      'https://link.metamask.io/send/0x2222222222222222222222222222222222222222@42161/transfer?address=0x1111111111111111111111111111111111111111&uint256=1250042'
    )
  })

  it('builds a MetaMask native universal link', () => {
    expect(buildWalletDeepLink('metamask', NATIVE)).toBe(
      'https://link.metamask.io/send/0x1111111111111111111111111111111111111111@1?value=1000000000000042'
    )
  })

  it('generic → raw ethereum: URI (OS-routed, any wallet)', () => {
    expect(buildWalletDeepLink('generic', ERC20)).toBe(
      'ethereum:0x2222222222222222222222222222222222222222@42161/transfer?address=0x1111111111111111111111111111111111111111&uint256=1250042'
    )
  })

  it('rejects a decimal amount (reuses builder validation via slice path)', () => {
    expect(() => buildWalletDeepLink('metamask', { ...NATIVE, amount: '1.5' })).toThrow(/Invalid amount/)
  })
})
