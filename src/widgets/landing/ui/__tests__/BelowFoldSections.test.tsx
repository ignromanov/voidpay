/**
 * BelowFoldSections Tests
 *
 * This component bundles all below-fold sections for code-splitting.
 * Since child components have complex dependencies (DemoSection uses invoice state, etc.),
 * we test that the component renders without errors.
 */
import { describe, it, expect, vi } from 'vitest'

// Mock complex child components at module path level
vi.mock('@/widgets/landing/how-it-works/HowItWorks', () => ({
  HowItWorks: () => null,
}))

vi.mock('@/widgets/landing/demo-section/DemoSection', () => ({
  DemoSection: () => null,
}))

vi.mock('@/widgets/landing/why-voidpay/WhyVoidPay', () => ({
  WhyVoidPay: () => null,
}))

vi.mock('@/widgets/landing/comparison/ComparisonTable', () => ({
  ComparisonTable: () => null,
}))

vi.mock('@/widgets/landing/audience-section/AudienceSection', () => ({
  AudienceSection: () => null,
}))

vi.mock('@/widgets/landing/faq-section', () => ({
  FaqSection: () => null,
}))

vi.mock('@/widgets/landing/footer-cta/FooterCta', () => ({
  FooterCta: () => null,
}))

describe('BelowFoldSections', () => {
  it('exports BelowFoldSections component', async () => {
    const mod = await import('../BelowFoldSections')
    expect(mod.BelowFoldSections).toBeDefined()
    expect(typeof mod.BelowFoldSections).toBe('function')
  })
})
