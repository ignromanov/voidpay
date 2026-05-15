import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, createNavigationMock } from '@/shared/lib/test-utils'

// Mock next/navigation with shared factory
vi.mock('next/navigation', () => createNavigationMock({ pathname: '/' }))

// isHostileInAppBrowser — default false; individual tests override
vi.mock('@/shared/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib')>()
  return {
    ...actual,
    isHostileInAppBrowser: vi.fn(() => false),
  }
})

// Mock TelegramGateProvider / useTelegramGate
const mockGateOpen = vi.fn()
vi.mock('@/widgets/in-app-browser-guard', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/widgets/in-app-browser-guard')>()
  return {
    ...actual,
    TelegramGateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useTelegramGate: vi.fn(() => ({ isOpen: false, open: mockGateOpen, close: vi.fn() })),
  }
})

// Mock WalletButton - it has its own tests
let capturedOnBeforeConnect: (() => boolean) | undefined
vi.mock('@/features/wallet-connect', () => ({
  LazyWalletButton: ({ onBeforeConnect }: { onBeforeConnect?: () => boolean }) => {
    capturedOnBeforeConnect = onBeforeConnect
    return <button data-testid="wallet-button">Connect Wallet</button>
  },
}))

import { isHostileInAppBrowser } from '@/shared/lib'
import { Navigation } from '../Navigation'

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedOnBeforeConnect = undefined
    vi.mocked(isHostileInAppBrowser).mockReturnValue(false)
  })

  describe('rendering', () => {
    it('renders VoidPay logo and brand name', () => {
      render(<Navigation />)

      expect(screen.getByText('VoidPay')).toBeInTheDocument()
    })

    it('renders wallet connect button', () => {
      render(<Navigation />)

      expect(screen.getByTestId('wallet-button')).toBeInTheDocument()
    })

    it('renders History navigation link', () => {
      render(<Navigation />)

      const historyLink = screen.getByRole('link', { name: 'History' })
      expect(historyLink).toHaveAttribute('href', '/history')
    })

    it('renders Create button linking to /create', () => {
      render(<Navigation />)

      const createButton = screen.getByRole('link', { name: /Create/i })
      expect(createButton).toHaveAttribute('href', '/create')
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

  describe('hostile IAB intercept', () => {
    it('passes onBeforeConnect=undefined to WalletButton in regular browser', () => {
      vi.mocked(isHostileInAppBrowser).mockReturnValue(false)
      render(<Navigation />)
      expect(capturedOnBeforeConnect).toBeUndefined()
    })

    it('passes onBeforeConnect callback to WalletButton in hostile in-app browser', () => {
      vi.mocked(isHostileInAppBrowser).mockReturnValue(true)
      render(<Navigation />)
      expect(capturedOnBeforeConnect).toBeTypeOf('function')
    })

    it('onBeforeConnect calls gate.open() and returns true in hostile IAB', async () => {
      vi.mocked(isHostileInAppBrowser).mockReturnValue(true)
      render(<Navigation />)

      const result = capturedOnBeforeConnect?.()

      expect(result).toBe(true)
      expect(mockGateOpen).toHaveBeenCalledOnce()
    })
  })
})
