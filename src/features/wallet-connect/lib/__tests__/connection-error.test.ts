/**
 * T061-test: Test for connection rejection handling
 *
 * Tests error handling for various wallet connection failure scenarios.
 */

import { describe, it, expect } from 'vitest'

describe('connection-error', () => {
  describe('getConnectionErrorMessage', () => {
    it('should export getConnectionErrorMessage function', async () => {
      const { getConnectionErrorMessage } = await import('../connection-error')
      expect(getConnectionErrorMessage).toBeDefined()
    })

    it('should return user-friendly message for rejection', async () => {
      const { getConnectionErrorMessage, ConnectionErrorType } = await import('../connection-error')
      const message = getConnectionErrorMessage(ConnectionErrorType.USER_REJECTED)
      expect(message.toLowerCase()).toContain('rejected')
    })

    it('should return user-friendly message for no provider', async () => {
      const { getConnectionErrorMessage, ConnectionErrorType } = await import('../connection-error')
      const message = getConnectionErrorMessage(ConnectionErrorType.NO_PROVIDER)
      expect(message.toLowerCase()).toContain('wallet')
    })

    it('should return user-friendly message for already pending', async () => {
      const { getConnectionErrorMessage, ConnectionErrorType } = await import('../connection-error')
      const message = getConnectionErrorMessage(ConnectionErrorType.ALREADY_PENDING)
      expect(message.toLowerCase()).toContain('pending')
    })

    it('should return generic message for unknown errors', async () => {
      const { getConnectionErrorMessage, ConnectionErrorType } = await import('../connection-error')
      const message = getConnectionErrorMessage(ConnectionErrorType.UNKNOWN)
      expect(message).toBeDefined()
      expect(message.length).toBeGreaterThan(0)
    })
  })

  describe('parseConnectionError', () => {
    it('should export parseConnectionError function', async () => {
      const { parseConnectionError } = await import('../connection-error')
      expect(parseConnectionError).toBeDefined()
    })

    it('should identify user rejection errors', async () => {
      const { parseConnectionError, ConnectionErrorType } = await import('../connection-error')
      const error = new Error('User rejected the request')
      const result = parseConnectionError(error)
      expect(result).toBe(ConnectionErrorType.USER_REJECTED)
    })

    it('should identify no provider errors', async () => {
      const { parseConnectionError, ConnectionErrorType } = await import('../connection-error')
      const error = new Error('No provider was found')
      const result = parseConnectionError(error)
      expect(result).toBe(ConnectionErrorType.NO_PROVIDER)
    })
  })

  describe('ConnectionErrorType enum', () => {
    it('should export ConnectionErrorType enum', async () => {
      const { ConnectionErrorType } = await import('../connection-error')
      expect(ConnectionErrorType).toBeDefined()
      expect(ConnectionErrorType.USER_REJECTED).toBeDefined()
      expect(ConnectionErrorType.NO_PROVIDER).toBeDefined()
    })
  })

  describe('isUserRejection', () => {
    it('should return true for user rejection errors', async () => {
      const { isUserRejection } = await import('../connection-error')
      expect(isUserRejection(new Error('User rejected the request'))).toBe(true)
      expect(isUserRejection(new Error('Connection denied by user'))).toBe(true)
    })

    it('should return false for other errors', async () => {
      const { isUserRejection } = await import('../connection-error')
      expect(isUserRejection(new Error('Network error'))).toBe(false)
      expect(isUserRejection(new Error('Unknown error'))).toBe(false)
    })
  })

  describe('isNoProvider', () => {
    it('should return true for no provider errors', async () => {
      const { isNoProvider } = await import('../connection-error')
      expect(isNoProvider(new Error('No provider was found'))).toBe(true)
      expect(isNoProvider(new Error('Wallet not installed'))).toBe(true)
    })

    it('should return false for other errors', async () => {
      const { isNoProvider } = await import('../connection-error')
      expect(isNoProvider(new Error('User rejected'))).toBe(false)
      expect(isNoProvider(new Error('Unknown error'))).toBe(false)
    })
  })

  describe('additional error types', () => {
    it('should identify already pending errors', async () => {
      const { parseConnectionError, ConnectionErrorType } = await import('../connection-error')
      expect(parseConnectionError(new Error('Request already pending'))).toBe(ConnectionErrorType.ALREADY_PENDING)
    })

    it('should identify wallet locked errors', async () => {
      const { parseConnectionError, ConnectionErrorType } = await import('../connection-error')
      expect(parseConnectionError(new Error('Wallet is locked'))).toBe(ConnectionErrorType.WALLET_LOCKED)
    })

    it('should identify chain not supported errors', async () => {
      const { parseConnectionError, ConnectionErrorType } = await import('../connection-error')
      expect(parseConnectionError(new Error('Unrecognized chain ID'))).toBe(ConnectionErrorType.CHAIN_NOT_SUPPORTED)
    })

    it('should identify network errors', async () => {
      const { parseConnectionError, ConnectionErrorType } = await import('../connection-error')
      expect(parseConnectionError(new Error('Network timeout'))).toBe(ConnectionErrorType.NETWORK_ERROR)
    })

    it('should handle non-Error objects', async () => {
      const { parseConnectionError, ConnectionErrorType } = await import('../connection-error')
      expect(parseConnectionError('User rejected the request')).toBe(ConnectionErrorType.USER_REJECTED)
      expect(parseConnectionError('Something went wrong')).toBe(ConnectionErrorType.UNKNOWN)
    })
  })

  describe('error messages', () => {
    it('should provide messages for all error types', async () => {
      const { getConnectionErrorMessage, ConnectionErrorType } = await import('../connection-error')
      
      expect(getConnectionErrorMessage(ConnectionErrorType.USER_REJECTED)).toBeTruthy()
      expect(getConnectionErrorMessage(ConnectionErrorType.NO_PROVIDER)).toBeTruthy()
      expect(getConnectionErrorMessage(ConnectionErrorType.ALREADY_PENDING)).toBeTruthy()
      expect(getConnectionErrorMessage(ConnectionErrorType.WALLET_LOCKED)).toBeTruthy()
      expect(getConnectionErrorMessage(ConnectionErrorType.CHAIN_NOT_SUPPORTED)).toBeTruthy()
      expect(getConnectionErrorMessage(ConnectionErrorType.NETWORK_ERROR)).toBeTruthy()
      expect(getConnectionErrorMessage(ConnectionErrorType.UNKNOWN)).toBeTruthy()
    })
  })
})
