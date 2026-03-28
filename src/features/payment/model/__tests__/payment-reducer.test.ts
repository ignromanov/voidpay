import { describe, it, expect } from 'vitest'
import { paymentReducer, INITIAL_PAYMENT_STATE } from '../use-payment-flow'
import type { PaymentState, PaymentError } from '../types'

describe('paymentReducer', () => {
  it('START(sending) transitions idle→sending with intent=true', () => {
    const state = paymentReducer(INITIAL_PAYMENT_STATE, { type: 'START', fromStep: 'sending' })
    expect(state.step).toBe('sending')
    expect(state.intent).toBe(true)
    expect(state.error).toBeNull()
  })

  it('START(connecting) transitions idle→connecting with intent=true', () => {
    const state = paymentReducer(INITIAL_PAYMENT_STATE, { type: 'START', fromStep: 'connecting' })
    expect(state.step).toBe('connecting')
    expect(state.intent).toBe(true)
  })

  it('START(switching) transitions idle→switching with intent=true', () => {
    const state = paymentReducer(INITIAL_PAYMENT_STATE, { type: 'START', fromStep: 'switching' })
    expect(state.step).toBe('switching')
    expect(state.intent).toBe(true)
  })

  it('START clears previous error', () => {
    const errorState: PaymentState = {
      ...INITIAL_PAYMENT_STATE,
      error: { type: 'UNKNOWN', message: 'test', step: 'sending' },
    }
    const state = paymentReducer(errorState, { type: 'START', fromStep: 'sending' })
    expect(state.error).toBeNull()
  })

  it('CONNECTED transitions connecting→switching when intent=true', () => {
    const connecting: PaymentState = { ...INITIAL_PAYMENT_STATE, step: 'connecting', intent: true }
    const state = paymentReducer(connecting, { type: 'CONNECTED' })
    expect(state.step).toBe('switching')
  })

  it('CONNECTED is ignored without intent', () => {
    const connecting: PaymentState = { ...INITIAL_PAYMENT_STATE, step: 'connecting', intent: false }
    const state = paymentReducer(connecting, { type: 'CONNECTED' })
    expect(state.step).toBe('connecting')
  })

  it('CONNECTED is ignored when not in connecting step', () => {
    const idle: PaymentState = { ...INITIAL_PAYMENT_STATE, intent: true }
    const state = paymentReducer(idle, { type: 'CONNECTED' })
    expect(state.step).toBe('idle')
  })

  it('SWITCHED transitions switching→sending when intent=true', () => {
    const switching: PaymentState = { ...INITIAL_PAYMENT_STATE, step: 'switching', intent: true }
    const state = paymentReducer(switching, { type: 'SWITCHED' })
    expect(state.step).toBe('sending')
  })

  it('SWITCHED is ignored without intent', () => {
    const switching: PaymentState = { ...INITIAL_PAYMENT_STATE, step: 'switching', intent: false }
    const state = paymentReducer(switching, { type: 'SWITCHED' })
    expect(state.step).toBe('switching')
  })

  it('SWITCHED is ignored when not in switching step', () => {
    const state = paymentReducer(INITIAL_PAYMENT_STATE, { type: 'SWITCHED' })
    expect(state.step).toBe('idle')
  })

  it('TX_SUBMITTED transitions sending→confirming with hash', () => {
    const sending: PaymentState = { ...INITIAL_PAYMENT_STATE, step: 'sending', intent: true }
    const hash = '0xabc123' as `0x${string}`
    const state = paymentReducer(sending, { type: 'TX_SUBMITTED', hash })
    expect(state.step).toBe('confirming')
    expect(state.txHash).toBe(hash)
  })

  it('TX_SUBMITTED is ignored when not in sending step', () => {
    const state = paymentReducer(INITIAL_PAYMENT_STATE, { type: 'TX_SUBMITTED', hash: '0xabc' })
    expect(state.step).toBe('idle')
  })

  it('CONFIRMED transitions confirming→success with intent=false', () => {
    const confirming: PaymentState = {
      ...INITIAL_PAYMENT_STATE,
      step: 'confirming',
      intent: true,
      txHash: '0xabc',
    }
    const state = paymentReducer(confirming, { type: 'CONFIRMED' })
    expect(state.step).toBe('success')
    expect(state.intent).toBe(false)
  })

  it('CONFIRMED is ignored when not in confirming step', () => {
    const state = paymentReducer(INITIAL_PAYMENT_STATE, { type: 'CONFIRMED' })
    expect(state.step).toBe('idle')
  })

  it('ERROR resets to idle with error, clears intent and txHash', () => {
    const sending: PaymentState = {
      ...INITIAL_PAYMENT_STATE,
      step: 'sending',
      intent: true,
      txHash: '0xabc',
    }
    const error: PaymentError = { type: 'USER_REJECTED', message: 'Rejected', step: 'sending' }
    const state = paymentReducer(sending, { type: 'ERROR', error })
    expect(state.step).toBe('idle')
    expect(state.error).toEqual(error)
    expect(state.intent).toBe(false)
    expect(state.txHash).toBeNull()
  })

  it('RESET returns initial state', () => {
    const modified: PaymentState = {
      step: 'success',
      error: null,
      txHash: '0xabc',
      intent: false,
    }
    const state = paymentReducer(modified, { type: 'RESET' })
    expect(state).toEqual(INITIAL_PAYMENT_STATE)
  })

  it('returns current state for unknown action', () => {
    const state = paymentReducer(INITIAL_PAYMENT_STATE, { type: 'UNKNOWN' } as never)
    expect(state).toBe(INITIAL_PAYMENT_STATE)
  })

  // US2/US3: Intent preservation through auto-progression chain
  it('CONNECTED preserves intent=true when auto-progressing to switching', () => {
    const connecting: PaymentState = { ...INITIAL_PAYMENT_STATE, step: 'connecting', intent: true }
    const state = paymentReducer(connecting, { type: 'CONNECTED' })
    expect(state.step).toBe('switching')
    expect(state.intent).toBe(true)
  })

  it('SWITCHED preserves intent=true when auto-progressing to sending', () => {
    const switching: PaymentState = { ...INITIAL_PAYMENT_STATE, step: 'switching', intent: true }
    const state = paymentReducer(switching, { type: 'SWITCHED' })
    expect(state.step).toBe('sending')
    expect(state.intent).toBe(true)
  })
})
