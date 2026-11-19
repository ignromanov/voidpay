import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('geist/font/sans', () => ({ GeistSans: { variable: 'geist-sans' } }))
vi.mock('geist/font/mono', () => ({ GeistMono: { variable: 'geist-mono' } }))
vi.mock('@/widgets/navigation', () => ({ Navigation: () => null }))
vi.mock('@/widgets/footer', () => ({ FooterSlot: () => null }))
vi.mock('@/widgets/network-background', () => ({ NetworkBackground: () => null }))
vi.mock('@/shared/ui/toaster', () => ({ Toaster: () => null }))
vi.mock('@/features/analytics', () => ({ UmamiScript: () => null }))

import RootLayout, { metadata } from '../layout'
import GlobalError from '../global-error'

describe('browser auto-translate opt-out', () => {
  it('declares the google notranslate meta signal in root metadata', () => {
    expect(metadata.other?.google).toBe('notranslate')
  })

  it('sets translate="no" on the root <html> element', () => {
    const root = RootLayout({ children: null })
    expect(root.type).toBe('html')
    expect(root.props.translate).toBe('no')
  })

  it('sets translate="no" on the global-error <html> element', () => {
    const html = renderToStaticMarkup(
      <GlobalError error={new Error('x')} reset={() => {}} />,
    )
    expect(html).toMatch(/^<html[^>]*translate="no"/)
  })
})
