/**
 * Connection Error Handling
 *
 * Utilities for parsing and displaying wallet connection errors.
 */

/**
 * Types of connection errors
 */
export enum ConnectionErrorType {
  /** User rejected the connection request */
  USER_REJECTED = 'USER_REJECTED',
  /** No wallet provider found */
  NO_PROVIDER = 'NO_PROVIDER',
  /** Connection request already pending */
  ALREADY_PENDING = 'ALREADY_PENDING',
  /** Wallet is locked */
  WALLET_LOCKED = 'WALLET_LOCKED',
  /** Chain not supported by wallet */
  CHAIN_NOT_SUPPORTED = 'CHAIN_NOT_SUPPORTED',
  /** Network error during connection */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Unknown error */
  UNKNOWN = 'UNKNOWN',
}

/**
 * User-friendly error messages for each error type
 */
const ERROR_MESSAGES: Record<ConnectionErrorType, string> = {
  [ConnectionErrorType.USER_REJECTED]:
    'Connection rejected. Please approve the connection request in your wallet.',
  [ConnectionErrorType.NO_PROVIDER]:
    'No wallet found. Please install MetaMask or another Web3 wallet.',
  [ConnectionErrorType.ALREADY_PENDING]:
    'Connection already pending. Please check your wallet for a pending request.',
  [ConnectionErrorType.WALLET_LOCKED]:
    'Wallet is locked. Please unlock your wallet and try again.',
  [ConnectionErrorType.CHAIN_NOT_SUPPORTED]:
    'This network is not supported by your wallet. Please add it manually.',
  [ConnectionErrorType.NETWORK_ERROR]:
    'Network error occurred. Please check your internet connection and try again.',
  [ConnectionErrorType.UNKNOWN]:
    'Connection failed. Please try again or use a different wallet.',
}

/**
 * Patterns to identify error types from error messages
 */
const ERROR_PATTERNS: Array<{
  pattern: RegExp
  type: ConnectionErrorType
}> = [
  { pattern: /user rejected|denied|rejected/i, type: ConnectionErrorType.USER_REJECTED },
  { pattern: /no provider|not found|not installed/i, type: ConnectionErrorType.NO_PROVIDER },
  { pattern: /already pending|pending request/i, type: ConnectionErrorType.ALREADY_PENDING },
  { pattern: /locked|unlock/i, type: ConnectionErrorType.WALLET_LOCKED },
  { pattern: /chain.*not.*support|unrecognized chain/i, type: ConnectionErrorType.CHAIN_NOT_SUPPORTED },
  { pattern: /network|timeout|fetch/i, type: ConnectionErrorType.NETWORK_ERROR },
]

/**
 * Get user-friendly error message for a connection error type
 *
 * @param errorType - The type of connection error
 * @returns User-friendly error message
 */
export function getConnectionErrorMessage(errorType: ConnectionErrorType): string {
  return ERROR_MESSAGES[errorType]
}

/**
 * Parse an error to determine its type
 *
 * @param error - The error to parse
 * @returns The identified error type
 */
export function parseConnectionError(error: unknown): ConnectionErrorType {
  const errorMessage = error instanceof Error ? error.message : String(error)

  for (const { pattern, type } of ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return type
    }
  }

  return ConnectionErrorType.UNKNOWN
}

/**
 * Parse error and get user-friendly message in one step
 *
 * @param error - The error to parse
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const errorType = parseConnectionError(error)
  return getConnectionErrorMessage(errorType)
}

/**
 * Check if an error indicates the user rejected the connection
 *
 * @param error - The error to check
 * @returns True if user rejected
 */
export function isUserRejection(error: unknown): boolean {
  return parseConnectionError(error) === ConnectionErrorType.USER_REJECTED
}

/**
 * Check if an error indicates no wallet is installed
 *
 * @param error - The error to check
 * @returns True if no provider found
 */
export function isNoProvider(error: unknown): boolean {
  return parseConnectionError(error) === ConnectionErrorType.NO_PROVIDER
}
