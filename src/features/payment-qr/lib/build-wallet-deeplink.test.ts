import { describe, it, expect } from 'vitest'
import { buildWalletDeepLink } from './build-wallet-deeplink'
import { extractLinkAmount } from './assert-amount-parity'
import { computeAmounts } from '@/entities/invoice/lib/compute-amounts'
import { TEST_INVOICES } from '@/shared/lib/test-utils'

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

  describe.each([1, 10, 137, 8453, 42161])('chain %i', (chainId) => {
    const recipientAddress = '0x1111111111111111111111111111111111111111'
    const tokenAddress = '0x2222222222222222222222222222222222222222'

    it('native: MetaMask link carries chain and exact value=', () => {
      const link = buildWalletDeepLink('metamask', { recipientAddress, chainId, amount: '1000000000000042' })
      expect(link).toBe(`https://link.metamask.io/send/${recipientAddress}@${chainId}?value=1000000000000042`)
    })

    it('USDC: MetaMask link carries token@chain/transfer and exact uint256=', () => {
      const link = buildWalletDeepLink('metamask', { recipientAddress, chainId, amount: '1250042', tokenAddress })
      expect(link).toBe(
        `https://link.metamask.io/send/${tokenAddress}@${chainId}/transfer?address=${recipientAddress}&uint256=1250042`
      )
    })
  })

  describe('computeAmounts -> built link (end-to-end amount parity)', () => {
    it.each([
      ['native', undefined],
      ['USDC', '0x2222222222222222222222222222222222222222'],
    ])('%s: exactTotal equals the amount in the MetaMask link', (_label, tokenAddress) => {
      const invoice = { ...TEST_INVOICES.full(), magicDust: '42', total: undefined }
      const { exactTotal } = computeAmounts(invoice)
      const link = buildWalletDeepLink('metamask', {
        recipientAddress: '0x1111111111111111111111111111111111111111',
        chainId: 8453,
        amount: exactTotal,
        tokenAddress,
      })
      expect(extractLinkAmount(link)).toBe(BigInt(exactTotal))
    })
  })
})
