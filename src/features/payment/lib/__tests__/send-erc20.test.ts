import { describe, it, expect } from 'vitest'
import { buildErc20TransferParams } from '../send-erc20'

describe('buildErc20TransferParams', () => {
  const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
  const recipient = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'

  it('returns correct contract call parameters', () => {
    const result = buildErc20TransferParams(tokenAddress, recipient, '1000000')
    expect(result.address).toBe(tokenAddress)
    expect(result.functionName).toBe('transfer')
    expect(result.args).toHaveLength(2)
    expect(result.args[1]).toBe(BigInt('1000000'))
  })

  it('normalizes recipient address to checksum', () => {
    const result = buildErc20TransferParams(tokenAddress, recipient, '1000000')
    expect(result.args[0]).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
  })

  it('includes ERC-20 transfer ABI', () => {
    const result = buildErc20TransferParams(tokenAddress, recipient, '1000000')
    expect(result.abi).toBeDefined()
    expect(result.abi[0].name).toBe('transfer')
  })

  it('throws when tokenAddress is undefined', () => {
    expect(() =>
      buildErc20TransferParams(undefined as unknown as string, recipient, '1000000')
    ).toThrow()
  })

  it('throws when tokenAddress is empty string', () => {
    expect(() =>
      buildErc20TransferParams('', recipient, '1000000')
    ).toThrow()
  })
})
