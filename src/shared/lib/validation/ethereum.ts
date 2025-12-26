/**
 * Ethereum address validation utilities
 *
 * Moved to shared layer for FSD compliance - both shared/ui and entities
 * can import validation utilities from this location.
 */

/**
 * Regular expression to validate Ethereum addresses
 * Matches 0x followed by exactly 40 hexadecimal characters
 */
export const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

/**
 * Validates if a string is a valid Ethereum address
 *
 * @param address - The address string to validate
 * @returns true if the address is a valid Ethereum address
 */
export function isValidEthAddress(address: string): boolean {
  return ETH_ADDRESS_REGEX.test(address)
}
