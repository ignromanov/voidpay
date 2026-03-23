import { describe, it, expect } from 'vitest'
import { matchTransfer, type TransferResult } from '../match-transfer'

const createTransfer = (
  value: string,
  hash = ('0x' + 'a'.repeat(64)) as `0x${string}`,
  address: string | null = null,
  category: TransferResult['category'] = 'external',
): TransferResult => ({
  hash,
  rawContract: { value, address, decimal: '0x12' },
  category,
  blockTimestamp: '2026-03-06T00:00:00Z',
})

describe('matchTransfer', () => {
  it('returns matching transfer when exact BigInt match', () => {
    const transfers = [createTransfer('0x3b9aca2a')] // 1000000042
    const result = matchTransfer(transfers, BigInt('1000000042'))
    expect(result).not.toBeNull()
    expect(result?.hash).toBe('0x' + 'a'.repeat(64))
  })

  it('returns null when no match', () => {
    const transfers = [createTransfer('0x3b9aca00')] // 1000000000
    const result = matchTransfer(transfers, BigInt('1000000042'))
    expect(result).toBeNull()
  })

  it('returns first match from multiple transfers', () => {
    const t1 = createTransfer('0x3b9aca00', ('0x' + 'b'.repeat(64)) as `0x${string}`)
    const t2 = createTransfer('0x3b9aca2a', ('0x' + 'c'.repeat(64)) as `0x${string}`)
    const t3 = createTransfer('0x3b9aca2a', ('0x' + 'd'.repeat(64)) as `0x${string}`)
    const result = matchTransfer([t1, t2, t3], BigInt('1000000042'))
    expect(result?.hash).toBe('0x' + 'c'.repeat(64))
  })

  it('matches native token transfer (rawContract.address is null)', () => {
    const transfers = [createTransfer('0xde0b6b3a7640000', '0x' + 'e'.repeat(64) as `0x${string}`, null, 'external')]
    const result = matchTransfer(transfers, BigInt('0xde0b6b3a7640000')) // 1 ETH in wei
    expect(result).not.toBeNull()
    expect(result?.rawContract.address).toBeNull()
  })

  it('matches ERC-20 token transfer by rawContract.value', () => {
    const erc20Address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    const transfers = [
      createTransfer('0x5f5e100', '0x' + 'f'.repeat(64) as `0x${string}`, erc20Address, 'erc20'),
    ]
    const result = matchTransfer(transfers, BigInt('0x5f5e100')) // 100 USDC (6 decimals)
    expect(result).not.toBeNull()
    expect(result?.category).toBe('erc20')
    expect(result?.rawContract.address).toBe(erc20Address)
  })

  it('handles edge case: zero value "0x0"', () => {
    const transfers = [createTransfer('0x0')]
    const result = matchTransfer(transfers, 0n)
    expect(result).not.toBeNull()
  })

  it('handles edge case: large value 1 ETH in wei "0xDE0B6B3A7640000"', () => {
    const transfers = [createTransfer('0xDE0B6B3A7640000')]
    const result = matchTransfer(transfers, 1_000_000_000_000_000_000n) // 1e18
    expect(result).not.toBeNull()
  })

  it('returns null when transfers array is empty', () => {
    const result = matchTransfer([], BigInt('1000000042'))
    expect(result).toBeNull()
  })
})
