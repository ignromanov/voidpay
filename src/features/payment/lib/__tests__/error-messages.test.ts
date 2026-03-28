import { describe, it, expect } from 'vitest'
import { getErrorMessage, formatErrorMessage } from '../error-messages'
import type { PaymentErrorType } from '../../model/types'

const ALL_TYPES: PaymentErrorType[] = [
  'USER_REJECTED',
  'INSUFFICIENT_FUNDS',
  'INSUFFICIENT_GAS',
  'NETWORK_SWITCH_FAILED',
  'TX_REVERTED',
  'RPC_ERROR',
  'INVALID_INVOICE',
  'UNKNOWN',
]

describe('getErrorMessage', () => {
  it.each(ALL_TYPES)('returns title, description, severity for %s', (type) => {
    const msg = getErrorMessage(type)
    expect(msg.title).toBeTruthy()
    expect(msg.description).toBeTruthy()
    expect(['info', 'warning', 'error']).toContain(msg.severity)
  })

  it('USER_REJECTED has info severity', () => {
    expect(getErrorMessage('USER_REJECTED').severity).toBe('info')
  })

  it('INSUFFICIENT_FUNDS has warning severity', () => {
    expect(getErrorMessage('INSUFFICIENT_FUNDS').severity).toBe('warning')
  })

  it('TX_REVERTED has error severity', () => {
    expect(getErrorMessage('TX_REVERTED').severity).toBe('error')
  })
})

describe('formatErrorMessage', () => {
  it('composes title and description into single string', () => {
    const msg = formatErrorMessage('USER_REJECTED')
    expect(msg).toBe('Payment canceled: You declined the transaction in your wallet.')
  })

  it.each(ALL_TYPES)('produces non-empty string for %s', (type) => {
    const msg = formatErrorMessage(type)
    expect(msg.length).toBeGreaterThan(10)
    expect(msg).toContain(':')
  })
})
