import { describe, it, expect } from 'vitest'
import { derivePRNG } from '../crypto'

describe('derivePRNG', () => {
  const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])

  it('returns 32 bytes (SHA-256 output)', () => {
    const result = derivePRNG(salt, 'test')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(32)
  })

  it('is deterministic: same salt + same label → same output', () => {
    const a = derivePRNG(salt, 'magic_dust')
    const b = derivePRNG(salt, 'magic_dust')
    expect(a).toEqual(b)
  })

  it('different labels → different output', () => {
    const a = derivePRNG(salt, 'magic_dust')
    const b = derivePRNG(salt, 'domain_sep')
    expect(a).not.toEqual(b)
  })

  it('different salts → different output', () => {
    const salt2 = new Uint8Array([16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    const a = derivePRNG(salt, 'magic_dust')
    const b = derivePRNG(salt2, 'magic_dust')
    expect(a).not.toEqual(b)
  })
})
