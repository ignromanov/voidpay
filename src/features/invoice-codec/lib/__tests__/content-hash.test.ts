import { describe, it, expect } from 'vitest'
import { computeContentHash } from '../content-hash'

describe('computeContentHash', () => {
  it('returns 64-char hex string', async () => {
    const hash = await computeContentHash('H4IgbghgTg9gxgFg')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('is deterministic — same input produces same hash', async () => {
    const a = await computeContentHash('test-fragment-123')
    const b = await computeContentHash('test-fragment-123')
    expect(a).toBe(b)
  })

  it('different inputs produce different hashes', async () => {
    const a = await computeContentHash('fragment-A')
    const b = await computeContentHash('fragment-B')
    expect(a).not.toBe(b)
  })

  it('handles empty string', async () => {
    const hash = await computeContentHash('')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('handles unicode content', async () => {
    const hash = await computeContentHash('инвойс-тест-🎉')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})
