import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock WalletButton - it has its own tests
vi.mock('@/features/wallet-connect', () => ({
  LazyWalletButton: () => <button data-testid="wallet-button">Connect Wallet</button>,
}))

import { Navigation } from '../Navigation'

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders VoidPay logo and brand name', () => {
      render(<Navigation />)

      expect(screen.getByText('VoidPay')).toBeInTheDocument()
    })

    it('renders Home navigation link', () => {
      render(<Navigation />)

      const homeLink = screen.getByRole('link', { name: 'Home' })
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('renders History navigation link', () => {
      render(<Navigation />)

      const historyLink = screen.getByRole('link', { name: 'History' })
      expect(historyLink).toHaveAttribute('href', '/history')
    })

    it('renders Blocked link with warning style', () => {
      render(<Navigation />)

      const blockedLink = screen.getByText('Blocked')
      expect(blockedLink.closest('a')).toHaveClass('text-red-400')
    })

    it('renders Create button linking to /create', () => {
      render(<Navigation />)

      const createButton = screen.getByRole('link', { name: /Create/i })
      expect(createButton).toHaveAttribute('href', '/create')
    })

    it('renders GitHub link', () => {
      render(<Navigation />)

      const githubLink = screen.getByRole('link', { name: 'GitHub repository' })
      expect(githubLink).toHaveAttribute('target', '_blank')
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders wallet connect button', () => {
      render(<Navigation />)

      expect(screen.getByTestId('wallet-button')).toBeInTheDocument()
    })
  })

  describe('active state', () => {
    it('highlights Home link when on home page', () => {
      render(<Navigation />)

      const homeLink = screen.getByRole('link', { name: 'Home' })
      expect(homeLink).toHaveClass('bg-zinc-800', 'text-zinc-50')
    })

    it('shows inactive state for History when on home page', () => {
      render(<Navigation />)

      const historyLink = screen.getByRole('link', { name: 'History' })
      expect(historyLink).toHaveClass('text-zinc-400')
      expect(historyLink).not.toHaveClass('bg-zinc-800')
    })
  })

  describe('styling', () => {
    it('has correct base classes for glass effect', () => {
      const { container } = render(<Navigation />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('fixed', 'backdrop-blur-xl')
    })

    it('is hidden for print', () => {
      const { container } = render(<Navigation />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('print:hidden')
    })
  })
})
