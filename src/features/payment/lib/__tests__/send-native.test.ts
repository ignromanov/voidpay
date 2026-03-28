import { describe, it, expect } from 'vitest'
import { buildNativeTransferParams } from '../send-native'

describe('buildNativeTransferParams', () => {
  it('returns to and value with checksummed address', () => {
    const result = buildNativeTransferParams(
      '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // vitalik.eth lowercase
      '1000000000000000000', // 1 ETH in wei
    )
    expect(result.to).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045') // checksummed
    expect(result.value).toBe(BigInt('1000000000000000000'))
  })

  it('handles already checksummed address', () => {
    const result = buildNativeTransferParams(
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      '500000000',
    )
    expect(result.to).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    expect(result.value).toBe(BigInt('500000000'))
  })

  it('converts string amount to BigInt', () => {
    const result = buildNativeTransferParams(
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      '42',
    )
    expect(typeof result.value).toBe('bigint')
    expect(result.value).toBe(42n)
  })
})
