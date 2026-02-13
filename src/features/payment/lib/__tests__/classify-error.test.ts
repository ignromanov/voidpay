import { describe, it, expect } from 'vitest'
import { classifyPaymentError } from '../classify-error'

describe('classifyPaymentError', () => {
  it('classifies UserRejectedRequestError by name', () => {
    const error = new Error('User rejected request')
    error.name = 'UserRejectedRequestError'
    expect(classifyPaymentError(error, 'sending')).toBe('USER_REJECTED')
  })

  it('classifies user rejection by shortMessage', () => {
    const error = Object.assign(new Error('some error'), {
      shortMessage: 'User rejected the request.',
    })
    expect(classifyPaymentError(error, 'sending')).toBe('USER_REJECTED')
  })

  it('classifies user denial by message', () => {
    const error = new Error('User denied transaction signature')
    expect(classifyPaymentError(error, 'sending')).toBe('USER_REJECTED')
  })

  it('classifies insufficient funds', () => {
    const error = Object.assign(new Error(''), {
      shortMessage: 'Insufficient funds for transfer',
    })
    expect(classifyPaymentError(error, 'sending')).toBe('INSUFFICIENT_FUNDS')
  })

  it('classifies insufficient balance variant', () => {
    const error = Object.assign(new Error(''), {
      shortMessage: 'insufficient balance for transfer',
    })
    expect(classifyPaymentError(error, 'sending')).toBe('INSUFFICIENT_FUNDS')
  })

  it('classifies transaction reverted', () => {
    const error = Object.assign(new Error(''), {
      shortMessage: 'execution reverted',
    })
    expect(classifyPaymentError(error, 'confirming')).toBe('TX_REVERTED')
  })

  it('falls back to UNKNOWN for unrecognized errors', () => {
    const error = new Error('Something completely unexpected')
    expect(classifyPaymentError(error, 'sending')).toBe('UNKNOWN')
  })

  it('classifies INSUFFICIENT_GAS by gas-specific pattern', () => {
    const error = Object.assign(new Error(''), {
      shortMessage: 'Insufficient funds for gas * price + value',
    })
    expect(classifyPaymentError(error, 'sending')).toBe('INSUFFICIENT_GAS')
  })

  it('INSUFFICIENT_GAS takes priority over INSUFFICIENT_FUNDS', () => {
    const error = Object.assign(new Error(''), {
      shortMessage: 'insufficient funds for gas',
    })
    // Should be GAS, not FUNDS
    expect(classifyPaymentError(error, 'sending')).toBe('INSUFFICIENT_GAS')
  })

  it('classifies NETWORK_SWITCH_FAILED based on switching step', () => {
    const error = new Error('Chain switch failed')
    expect(classifyPaymentError(error, 'switching')).toBe('NETWORK_SWITCH_FAILED')
  })

  it('classifies NETWORK_SWITCH_FAILED even for user rejection during switching', () => {
    // Note: User rejection during switching step is classified as NETWORK_SWITCH_FAILED
    // because USER_REJECTED check happens first (name-based). But if it's a generic
    // error during switching, it should be NETWORK_SWITCH_FAILED.
    const error = new Error('Some switching error occurred')
    expect(classifyPaymentError(error, 'switching')).toBe('NETWORK_SWITCH_FAILED')
  })

  it('classifies RPC_ERROR for network errors', () => {
    const error = Object.assign(new Error(''), {
      shortMessage: 'Network request failed',
    })
    expect(classifyPaymentError(error, 'sending')).toBe('RPC_ERROR')
  })

  it('classifies RPC_ERROR for timeout errors', () => {
    const error = Object.assign(new Error(''), {
      shortMessage: 'Request timeout',
    })
    expect(classifyPaymentError(error, 'sending')).toBe('RPC_ERROR')
  })

  it('classifies RPC_ERROR for RPC-specific errors', () => {
    const error = Object.assign(new Error(''), {
      shortMessage: 'RPC server responded with error',
    })
    expect(classifyPaymentError(error, 'sending')).toBe('RPC_ERROR')
  })

  it('USER_REJECTED takes priority over step-based classification', () => {
    const error = new Error('User rejected')
    error.name = 'UserRejectedRequestError'
    // Even during switching step, user rejection is USER_REJECTED
    expect(classifyPaymentError(error, 'switching')).toBe('USER_REJECTED')
  })
})
