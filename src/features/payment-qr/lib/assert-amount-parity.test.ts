import { describe, it, expect } from 'vitest'
import { assertAmountParity } from './assert-amount-parity'

describe('assertAmountParity', () => {
  it('passes when URI amount equals displayed exactTotal', () => {
    expect(() => assertAmountParity('1250042', '1250042')).not.toThrow()
  })
  it('throws when amounts diverge (Shade S1 guard)', () => {
    expect(() => assertAmountParity('1250042', '1250000')).toThrow(/amount parity/)
  })
})
