import { describe, it, expect } from 'vitest'
import { getErrorMessage, formatErrorMessage, CANCELED_COPY } from '../error-messages'
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

  it('USER_REJECTED references CANCELED_COPY', () => {
    const msg = getErrorMessage('USER_REJECTED')
    expect(msg.title).toBe(CANCELED_COPY.title)
    expect(msg.description).toBe(CANCELED_COPY.description)
  })
})

describe('CANCELED_COPY', () => {
  // Shade S7 (spec 095): only UserRejectedRequestError / EIP-1193 4001 maps here.
  it('has the S7-compliant canceled copy', () => {
    expect(CANCELED_COPY.title).toBe('You canceled')
    expect(CANCELED_COPY.description).toBe('Tap Send when ready.')
  })
})

describe('formatErrorMessage', () => {
  it('composes title and description into single string', () => {
    const msg = formatErrorMessage('USER_REJECTED')
    expect(msg).toBe('You canceled: Tap Send when ready.')
  })

  it.each(ALL_TYPES)('produces non-empty string for %s', (type) => {
    const msg = formatErrorMessage(type)
    expect(msg.length).toBeGreaterThan(10)
    expect(msg).toContain(':')
  })
})
