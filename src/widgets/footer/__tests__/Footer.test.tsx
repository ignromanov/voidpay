import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Footer } from '../Footer'

describe('Footer', () => {
  describe('rendering', () => {
    it('renders the copyright text with MIT license', () => {
      render(<Footer />)

      expect(screen.getByText('© 2026 VoidPay · MIT')).toBeInTheDocument()
    })

    it('renders privacy and terms links with aria-labels', () => {
      render(<Footer />)

      const privacyLink = screen.getByRole('link', { name: 'Privacy' })
      const termsLink = screen.getByRole('link', { name: 'Terms' })

      expect(privacyLink).toHaveAttribute('href', '/privacy')
      expect(termsLink).toHaveAttribute('href', '/terms')
    })

    it('terms link has aria-label for icon-only mode on small viewports', () => {
      render(<Footer />)

      const termsLink = screen.getByRole('link', { name: 'Terms' })
      expect(termsLink).toHaveAttribute('aria-label', 'Terms')
    })

    it('privacy link has aria-label for icon-only mode on small viewports', () => {
      render(<Footer />)

      const privacyLink = screen.getByRole('link', { name: 'Privacy' })
      expect(privacyLink).toHaveAttribute('aria-label', 'Privacy')
    })

    it('renders contact email link with mail icon', () => {
      render(<Footer />)

      const contactLink = screen.getByRole('link', { name: 'Contact email' })
      expect(contactLink).toHaveAttribute('href', 'mailto:hello@voidpay.xyz')
    })

    it('renders GitHub link with correct attributes', () => {
      render(<Footer />)

      const githubLink = screen.getByRole('link', { name: 'GitHub' })
      expect(githubLink).toHaveAttribute('target', '_blank')
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders Twitter link with correct attributes', () => {
      render(<Footer />)

      const twitterLink = screen.getByRole('link', { name: 'Twitter' })
      expect(twitterLink).toHaveAttribute('target', '_blank')
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('styling', () => {
    it('renders in document flow (no fixed class) by default', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('bg-zinc-950', 'border-t', 'relative')
      expect(footer).not.toHaveClass('fixed')
      expect(footer).not.toHaveClass('backdrop-blur-xl')
    })

    it('renders as fixed overlay when floating=true', () => {
      const { container } = render(<Footer floating />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('fixed', 'bottom-0')
      expect(footer).not.toHaveClass('relative')
    })

    it('copyright spans have whitespace-nowrap to prevent line break', () => {
      const { container } = render(<Footer />)

      const spans = Array.from(container.querySelectorAll('span.whitespace-nowrap'))
      const texts = spans.map((s) => s.textContent)
      expect(texts).toContain('© VoidPay')
      expect(texts).toContain('© 2026 VoidPay · MIT')
    })

    it('is hidden for print', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('print:hidden')
    })

    it('flex container uses flex-nowrap to prevent line breaks', () => {
      const { container } = render(<Footer />)

      const inner = container.querySelector('.flex-nowrap')
      expect(inner).toBeInTheDocument()
    })
  })
})
