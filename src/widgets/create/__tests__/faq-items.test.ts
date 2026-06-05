import { describe, expect, it } from 'vitest'
import { FAQ_ITEMS } from '../config/faq-items'

describe('FAQ_ITEMS', () => {
  it('is non-empty', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThan(0)
  })

  it('every entry has a non-empty question string', () => {
    for (const item of FAQ_ITEMS) {
      expect(typeof item.question).toBe('string')
      expect(item.question.trim().length).toBeGreaterThan(0)
    }
  })

  it('every entry has a non-empty answer string', () => {
    for (const item of FAQ_ITEMS) {
      expect(typeof item.answer).toBe('string')
      expect(item.answer.trim().length).toBeGreaterThan(0)
    }
  })
})
