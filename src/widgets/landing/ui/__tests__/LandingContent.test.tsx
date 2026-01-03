/**
 * LandingContent Tests
 *
 * LandingContent uses dynamic imports and complex state management.
 * Testing verifies the module exports correctly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock complex dependencies
vi.mock('@/entities/creator', () => ({
  useCreatorStore: vi.fn(() => vi.fn()),
}))

vi.mock('@/widgets/landing/hero-section/HeroSection', () => ({
  HeroSection: () => null,
}))

vi.mock('@/widgets/landing/social-proof', () => ({
  SocialProofStrip: () => null,
}))

describe('LandingContent', () => {
  beforeEach(() => {
    vi.stubGlobal('requestIdleCallback', (cb: IdleRequestCallback) => {
      return setTimeout(() => cb({} as IdleDeadline), 0)
    })
    vi.stubGlobal('cancelIdleCallback', (id: number) => clearTimeout(id))

    Object.defineProperty(navigator, 'connection', {
      value: { saveData: false },
      writable: true,
      configurable: true,
    })
  })

  it('exports LandingContent component', async () => {
    const mod = await import('../LandingContent')
    expect(mod.LandingContent).toBeDefined()
    expect(typeof mod.LandingContent).toBe('function')
  })
})
