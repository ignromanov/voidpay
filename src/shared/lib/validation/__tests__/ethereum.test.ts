/**
 * Ethereum validation tests
 */
import { describe, it, expect } from 'vitest'
import {
  ETH_ADDRESS_REGEX,
  isValidEthAddress,
  validateAddress,
  isValidAddress,
} from '../ethereum'

describe('Ethereum Validation', () => {
  // Test addresses
  const VALID_ADDRESS = '0x1234567890123456789012345678901234567890'
  const VALID_CHECKSUMMED = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // Vitalik
  const VALID_LOWERCASE = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
  const INVALID_TOO_SHORT = '0x123456789012345678901234567890123456789' // 39 chars
  const INVALID_TOO_LONG = '0x12345678901234567890123456789012345678901' // 41 chars
  const INVALID_NO_PREFIX = '1234567890123456789012345678901234567890'
  const INVALID_BAD_CHARS = '0x12345678901234567890123456789012345ZZZZZ'
  const EMPTY = ''
  const RANDOM_STRING = 'not an address at all'

  describe('ETH_ADDRESS_REGEX', () => {
    it('matches valid lowercase address', () => {
      expect(ETH_ADDRESS_REGEX.test(VALID_ADDRESS)).toBe(true)
    })

    it('matches checksummed address', () => {
      expect(ETH_ADDRESS_REGEX.test(VALID_CHECKSUMMED)).toBe(true)
    })

    it('rejects address without 0x prefix', () => {
      expect(ETH_ADDRESS_REGEX.test(INVALID_NO_PREFIX)).toBe(false)
    })

    it('rejects address with invalid characters', () => {
      expect(ETH_ADDRESS_REGEX.test(INVALID_BAD_CHARS)).toBe(false)
    })

    it('rejects too short address', () => {
      expect(ETH_ADDRESS_REGEX.test(INVALID_TOO_SHORT)).toBe(false)
    })

    it('rejects too long address', () => {
      expect(ETH_ADDRESS_REGEX.test(INVALID_TOO_LONG)).toBe(false)
    })

    it('rejects empty string', () => {
      expect(ETH_ADDRESS_REGEX.test(EMPTY)).toBe(false)
    })
  })

  describe('isValidEthAddress', () => {
    it('returns true for valid address', () => {
      expect(isValidEthAddress(VALID_ADDRESS)).toBe(true)
    })

    it('returns true for checksummed address', () => {
      expect(isValidEthAddress(VALID_CHECKSUMMED)).toBe(true)
    })

    it('returns true for lowercase address', () => {
      expect(isValidEthAddress(VALID_LOWERCASE)).toBe(true)
    })

    it('returns false for invalid address', () => {
      expect(isValidEthAddress(INVALID_TOO_SHORT)).toBe(false)
      expect(isValidEthAddress(INVALID_NO_PREFIX)).toBe(false)
      expect(isValidEthAddress(RANDOM_STRING)).toBe(false)
      expect(isValidEthAddress(EMPTY)).toBe(false)
    })

    it('narrows type correctly', () => {
      const address = VALID_ADDRESS
      if (isValidEthAddress(address)) {
        // TypeScript should infer address as `0x${string}`
        const typed: `0x${string}` = address
        expect(typed).toBe(address)
      }
    })
  })

  describe('validateAddress', () => {
    it('returns checksummed address for valid input', () => {
      const result = validateAddress(VALID_LOWERCASE)
      expect(result).toBe(VALID_CHECKSUMMED)
    })

    it('returns same checksummed address if already checksummed', () => {
      const result = validateAddress(VALID_CHECKSUMMED)
      expect(result).toBe(VALID_CHECKSUMMED)
    })

    it('returns null for invalid address', () => {
      expect(validateAddress(INVALID_TOO_SHORT)).toBeNull()
      expect(validateAddress(INVALID_NO_PREFIX)).toBeNull()
      expect(validateAddress(RANDOM_STRING)).toBeNull()
      expect(validateAddress(EMPTY)).toBeNull()
    })

    it('normalizes lowercase addresses', () => {
      // Use lowercase input - viem accepts lowercase and normalizes to checksum
      const result = validateAddress(VALID_LOWERCASE)
      expect(result).toBe(VALID_CHECKSUMMED)
    })
  })

  describe('isValidAddress', () => {
    it('returns true for valid address', () => {
      expect(isValidAddress(VALID_ADDRESS)).toBe(true)
    })

    it('returns true for checksummed address', () => {
      expect(isValidAddress(VALID_CHECKSUMMED)).toBe(true)
    })

    it('returns false for invalid address', () => {
      expect(isValidAddress(INVALID_TOO_SHORT)).toBe(false)
      expect(isValidAddress(INVALID_NO_PREFIX)).toBe(false)
      expect(isValidAddress(RANDOM_STRING)).toBe(false)
    })

    it('acts as type guard', () => {
      const unknown: string = VALID_ADDRESS
      if (isValidAddress(unknown)) {
        // TypeScript should know this is `0x${string}`
        const address: `0x${string}` = unknown
        expect(address.startsWith('0x')).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('handles null-like values gracefully', () => {
      // @ts-expect-error - testing runtime behavior
      expect(isValidEthAddress(null)).toBe(false)
      // @ts-expect-error - testing runtime behavior
      expect(isValidEthAddress(undefined)).toBe(false)
    })

    it('handles zero address', () => {
      const zeroAddress = '0x0000000000000000000000000000000000000000'
      expect(isValidEthAddress(zeroAddress)).toBe(true)
      expect(validateAddress(zeroAddress)).not.toBeNull()
    })

    it('handles max address (lowercase)', () => {
      // viem requires lowercase for non-checksummed addresses
      const maxAddress = '0xffffffffffffffffffffffffffffffffffffffff'
      expect(isValidEthAddress(maxAddress)).toBe(true)
    })

    it('accepts lowercase hex addresses', () => {
      // viem accepts lowercase (no checksum) and properly checksummed addresses
      const lower = '0xabcdef1234567890abcdef1234567890abcdef12'
      expect(isValidEthAddress(lower)).toBe(true)

      // validateAddress normalizes to checksummed format
      const checksummed = validateAddress(lower)
      expect(checksummed).not.toBeNull()
      expect(isValidEthAddress(checksummed!)).toBe(true)
    })

    it('rejects addresses with spaces', () => {
      const withSpaces = ' 0x1234567890123456789012345678901234567890 '
      expect(isValidEthAddress(withSpaces)).toBe(false)
    })

    it('rejects addresses with newlines', () => {
      const withNewline = '0x1234567890123456789012345678901234567890\n'
      expect(isValidEthAddress(withNewline)).toBe(false)
    })

    it('handles common wallet addresses', () => {
      // Some well-known addresses
      const addresses = [
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      ]

      for (const addr of addresses) {
        expect(isValidEthAddress(addr)).toBe(true)
        expect(validateAddress(addr)).not.toBeNull()
      }
    })
  })
})
