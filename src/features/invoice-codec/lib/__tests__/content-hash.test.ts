import { describe, it, expect } from 'vitest'
import { computeContentHash } from '../content-hash'

describe('computeContentHash', () => {
  it('returns 64-char hex string', () => {
    const hash = computeContentHash('H4IgbghgTg9gxgFg')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('is deterministic — same input produces same hash', () => {
    const a = computeContentHash('test-fragment-123')
    const b = computeContentHash('test-fragment-123')
    expect(a).toBe(b)
  })

  it('different inputs produce different hashes', () => {
    const a = computeContentHash('fragment-A')
    const b = computeContentHash('fragment-B')
    expect(a).not.toBe(b)
  })

  it('handles empty string', () => {
    const hash = computeContentHash('')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('handles unicode content', () => {
    const hash = computeContentHash('инвойс-тест-🎉')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})
