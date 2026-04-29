import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Footer } from '../Footer'

describe('Footer', () => {
  describe('rendering', () => {
    it('renders the copyright text with MIT license', () => {
      render(<Footer />)

      expect(screen.getByText('© 2026 VoidPay · MIT')).toBeInTheDocument()
    })

    it('renders privacy and terms links', () => {
      render(<Footer />)

      const privacyLink = screen.getByRole('link', { name: 'Privacy' })
      const termsLink = screen.getByRole('link', { name: 'Terms' })

      expect(privacyLink).toHaveAttribute('href', '/privacy')
      expect(termsLink).toHaveAttribute('href', '/terms')
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
    it('has correct base classes for sticky-bottom flow layout', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('bg-zinc-950', 'border-t')
      expect(footer).not.toHaveClass('fixed')
      expect(footer).not.toHaveClass('backdrop-blur-xl')
    })

    it('is hidden for print', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('print:hidden')
    })
  })
})
