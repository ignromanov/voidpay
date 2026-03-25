import { render, screen, waitFor } from '@/shared/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Stable mock store state — hoisted so it's available inside vi.mock factories
const mockStoreState = vi.hoisted(() => ({
  addInvoice: vi.fn(),
  trackView: vi.fn(),
  getInvoice: vi.fn(),
  setTxHash: vi.fn(),
  setError: vi.fn(),
  invoices: [] as never[],
}))

// Mock dependencies before importing component
vi.mock('@/shared/lib/hooks', () => ({
  useHashFragment: vi.fn(() => ''),
  useIsMounted: vi.fn(() => true),
  useHydrated: vi.fn(() => true),
}))

// Mock useReducedMotion used by VoidLogo
vi.mock('@/shared/ui/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('@/shared/ui/motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useAnimationControls: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
}))

vi.mock('@/features/invoice-codec', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/invoice-codec')>()
  return {
    ...actual,
    parseInvoiceHash: vi.fn(() => ({ success: false, error: { message: 'Mock not configured' } })),
  }
})

vi.mock('@/entities/invoice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/invoice')>()
  const hook = vi.fn((selector?: (s: typeof mockStoreState) => unknown) => {
    if (typeof selector === 'function') return selector(mockStoreState)
    return mockStoreState
  })
  // Static methods used by usePaymentPolling
  ;(hook as unknown as Record<string, unknown>).getState = () => mockStoreState
  ;(hook as unknown as Record<string, unknown>).persist = {
    hasHydrated: () => true,
    onFinishHydration: vi.fn(),
  }
  return {
    ...actual,
    useTrackedInvoiceStore: hook,
  }
})

vi.mock('@/entities/creator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/creator')>()
  return {
    ...actual,
    useCreatorStore: vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
      const state = {
        setNetworkTheme: vi.fn(),
        preferences: { includeOgImage: false },
        updatePreferences: vi.fn(),
      }
      if (typeof selector === 'function') return selector(state)
      return state
    }),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// Mock next/dynamic to eagerly resolve dynamic imports in tests
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    let Resolved: React.ComponentType<unknown> | null = null
    loader().then((mod) => {
      Resolved = (mod as unknown as { default?: React.ComponentType<unknown> }).default ?? (mod as unknown as React.ComponentType<unknown>)
    })
    return function DynamicMock(props: Record<string, unknown>) {
      return Resolved ? <Resolved {...props} /> : null
    }
  },
}))

// Mock InvoiceVerifier to render nothing
vi.mock('../InvoiceVerifier', () => ({
  InvoiceVerifier: () => null,
}))

// Import mocked modules for manipulation
import { useHashFragment } from '@/shared/lib/hooks'
import { parseInvoiceHash } from '@/features/invoice-codec'
import { useRouter } from 'next/navigation'

// Import component under test
import { InvoiceWorkspace } from '../InvoiceWorkspace'

// Test fixtures matching Invoice schema
const VALID_INVOICE = {
  version: 2,
  invoiceId: 'INV-001',
  from: {
    name: 'Test Sender',
    email: 'sender@test.com',
    walletAddress: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  },
  client: {
    name: 'Test Client',
    email: 'client@test.com',
  },
  items: [
    { description: 'Service', quantity: 1, rate: '100' },
  ],
  currency: 'USDC',
  decimals: 6,
  networkId: 42161, // Arbitrum
  issuedAt: 1706745600, // 2026-02-01
  // dueAt omitted — invoice never expires (avoids overdue status in tests)
}

describe('InvoiceWorkspace', () => {
  const mockRouter = { push: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>)
    // Sync test-local mocks into the shared store state
    mockStoreState.addInvoice = vi.fn()
    mockStoreState.trackView = vi.fn()
    mockStoreState.getInvoice = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Loading state', () => {
    it('shows loading skeleton when hash is empty (SSR hydration)', () => {
      vi.mocked(useHashFragment).mockReturnValue('')

      render(<InvoiceWorkspace />)

      // Loading state renders ScaledInvoicePreview with loading prop — no invoice content visible
      expect(screen.queryByText('INV-001')).not.toBeInTheDocument()
      // No error screen either
      expect(screen.queryByText('No Invoice Data')).not.toBeInTheDocument()
    })
  })

  describe('Valid invoice decoding', () => {
    it('decodes valid hash and displays invoice', async () => {
      vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: true,
        data: VALID_INVOICE,
      })

      render(<InvoiceWorkspace />)

      await waitFor(() => {
        // Invoice content should be visible (invoice ID shown as #INV-001)
        expect(screen.getByText(/INV-001/)).toBeInTheDocument()
      })
    })

    it('calls trackView with source "created"', async () => {
      vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: true,
        data: VALID_INVOICE,
      })

      render(<InvoiceWorkspace />)

      await waitFor(() => {
        expect(mockStoreState.trackView).toHaveBeenCalledWith(
          expect.objectContaining({
            invoiceId: 'INV-001',
            source: 'created',
            viewedAt: expect.any(String),
          })
        )
      })
    })
  })

  describe('Error states', () => {
    it('shows EMPTY_HASH error when hash missing after hydration', async () => {
      vi.mocked(useHashFragment).mockReturnValue('')

      render(<InvoiceWorkspace />)

      await waitFor(() => {
        expect(screen.getByText('No Invoice Data')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('shows INVALID_FORMAT for malformed hash', async () => {
      vi.mocked(useHashFragment).mockReturnValue('invalid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: false,
        error: { code: 'INVALID_FORMAT', message: 'Invalid format' },
      })

      render(<InvoiceWorkspace />)

      await waitFor(() => {
        expect(screen.getByText('Invalid Invoice Link')).toBeInTheDocument()
      })
    })

    it('navigates home on Return Home click', async () => {
      const user = userEvent.setup()
      vi.mocked(useHashFragment).mockReturnValue('invalid')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: false,
        error: { code: 'INVALID_FORMAT', message: 'Invalid' },
      })

      render(<InvoiceWorkspace />)

      await waitFor(() => {
        expect(screen.getByText('Invalid Invoice Link')).toBeInTheDocument()
      })

      const returnHomeButton = screen.getByRole('button', { name: /return home/i })
      await user.click(returnHomeButton)

      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  describe('"Pay this invoice" link', () => {
    it('renders "Pay this invoice" link when invoice is unpaid', async () => {
      vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: true,
        data: VALID_INVOICE,
      })

      render(<InvoiceWorkspace />)

      await waitFor(() => {
        expect(screen.getByText('Pay this invoice')).toBeInTheDocument()
      })
    })

    it('link href contains /pay and current hash', async () => {
      vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: true,
        data: VALID_INVOICE,
      })

      render(<InvoiceWorkspace />)

      await waitFor(() => {
        const link = screen.getByText('Pay this invoice').closest('a')
        expect(link).not.toBeNull()
        expect(link?.getAttribute('href')).toContain('/pay')
      })
    })
  })

  describe('No SmartPayButton', () => {
    it('does NOT render SmartPayButton or PayButton', async () => {
      vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: true,
        data: VALID_INVOICE,
      })

      render(<InvoiceWorkspace />)

      await waitFor(() => {
        expect(screen.getByText(/INV-001/)).toBeInTheDocument()
      })

      // SmartPayButton renders "Smart Pay" or similar pay-action text
      expect(screen.queryByText('Smart Pay')).not.toBeInTheDocument()
      expect(screen.queryByText(/^Pay \d/)).not.toBeInTheDocument()
    })
  })
})
