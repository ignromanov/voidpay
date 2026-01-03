/**
 * Ethereum address validation utilities
 *
 * Moved to shared layer for FSD compliance - both shared/ui and entities
 * can import validation utilities from this location.
 *
 * Uses viem for EIP-55 checksum validation.
 */

import { isAddress, getAddress } from 'viem'

/**
 * Regular expression to validate Ethereum addresses (basic format check)
 * Matches 0x followed by exactly 40 hexadecimal characters
 * @deprecated Use isValidEthAddress() or validateAddress() for proper validation
 */
export const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

/**
 * Validates if a string is a valid Ethereum address
 * Uses viem's isAddress which validates format AND checksum (if present)
 *
 * @param address - The address string to validate
 * @returns true if the address is a valid Ethereum address
 */
export function isValidEthAddress(address: string): address is `0x${string}` {
  return isAddress(address)
}

/**
 * Validates and normalizes Ethereum address to EIP-55 checksum format
 *
 * EIP-55 checksum encoding ensures that addresses are case-sensitive,
 * providing an extra layer of protection against transcription errors.
 *
 * @param address - The address string to validate
 * @returns Normalized checksummed address or null if invalid
 *
 * @example
 * ```typescript
 * validateAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')
 * // Returns: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
 *
 * validateAddress('0xinvalid')
 * // Returns: null
 * ```
 */
export function validateAddress(address: string): `0x${string}` | null {
  if (!isAddress(address)) {
    return null
  }
  return getAddress(address)
}

/**
 * Type guard for valid Ethereum address with proper TypeScript narrowing
 *
 * @param address - The address string to validate
 * @returns true if the address is valid, with type narrowing to `0x${string}`
 *
 * @example
 * ```typescript
 * if (isValidAddress(userInput)) {
 *   // TypeScript now knows userInput is `0x${string}`
 *   sendTransaction(userInput)
 * }
 * ```
 */
export function isValidAddress(address: string): address is `0x${string}` {
  return isAddress(address)
}
