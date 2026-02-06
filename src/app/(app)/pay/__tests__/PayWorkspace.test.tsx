import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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

vi.mock('@/features/invoice-codec', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/invoice-codec')>()
  return {
    ...actual,
    parseInvoiceHash: vi.fn(() => ({ success: false, error: { message: 'Mock not configured' } })),
  }
})

vi.mock('@/entities/invoice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/invoice')>()
  return {
    ...actual,
    useRichInvoiceStore: vi.fn(() => ({
      addInvoice: vi.fn(),
      getInvoice: vi.fn(),
    })),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

// Import mocked modules for manipulation
import { useHashFragment } from '@/shared/lib/hooks'
import { parseInvoiceHash } from '@/features/invoice-codec'
import { useRichInvoiceStore } from '@/entities/invoice'
import { useRouter } from 'next/navigation'

// Import component under test
import { PayWorkspace } from '../PayWorkspace'

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
  dueAt: 1707955200, // 2026-02-15
}

describe('PayWorkspace', () => {
  const mockRouter = { push: vi.fn() }
  const mockAddInvoice = vi.fn()
  const mockGetInvoice = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>)
    vi.mocked(useRichInvoiceStore).mockReturnValue({
      addInvoice: mockAddInvoice,
      getInvoice: mockGetInvoice,
    } as unknown as ReturnType<typeof useRichInvoiceStore>)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('US1: View Invoice from Shared Link', () => {
    describe('Loading state (hydration)', () => {
      it('shows skeleton when hash is empty (SSR hydration)', () => {
        vi.mocked(useHashFragment).mockReturnValue('')

        render(<PayWorkspace />)

        // Should show loading indicator during hydration
        expect(screen.getByTestId('pay-workspace-skeleton')).toBeInTheDocument()
      })
    })

    describe('Valid invoice decoding', () => {
      it('decodes valid hash and displays invoice', async () => {
        vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
        vi.mocked(parseInvoiceHash).mockReturnValue({
          success: true,
          data: VALID_INVOICE,
        })

        render(<PayWorkspace />)

        await waitFor(() => {
          // Invoice content should be visible (invoice ID shown as #INV-001)
          expect(screen.getByText(/INV-001/)).toBeInTheDocument()
        })
      })

      it('displays invoice from/client information', async () => {
        vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
        vi.mocked(parseInvoiceHash).mockReturnValue({
          success: true,
          data: VALID_INVOICE,
        })

        render(<PayWorkspace />)

        await waitFor(() => {
          expect(screen.getByText('Test Sender')).toBeInTheDocument()
          expect(screen.getByText('Test Client')).toBeInTheDocument()
        })
      })
    })

    describe('Network data attribute', () => {
      it('sets data-network attribute from decoded invoice networkId', async () => {
        vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
        vi.mocked(parseInvoiceHash).mockReturnValue({
          success: true,
          data: { ...VALID_INVOICE, networkId: 42161 }, // Arbitrum
        })

        render(<PayWorkspace />)

        await waitFor(() => {
          // Content container should have data-network for theme coordination
          const container = screen.getByTestId('invoice-preview-clickable').closest('[data-network]')
          expect(container).toHaveAttribute('data-network', '42161')
        })
      })

      it('sets data-network for Ethereum chainId 1', async () => {
        vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
        vi.mocked(parseInvoiceHash).mockReturnValue({
          success: true,
          data: { ...VALID_INVOICE, networkId: 1 }, // Ethereum
        })

        render(<PayWorkspace />)

        await waitFor(() => {
          const container = screen.getByTestId('invoice-preview-clickable').closest('[data-network]')
          expect(container).toHaveAttribute('data-network', '1')
        })
      })
    })
  })

  describe('US2: Fullscreen Invoice Preview', () => {
    it('opens InvoicePreviewModal when invoice is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: true,
        data: VALID_INVOICE,
      })

      render(<PayWorkspace />)

      await waitFor(() => {
        expect(screen.getByText(/INV-001/)).toBeInTheDocument()
      })

      // Click on the invoice (inner element with tabIndex=0)
      const invoiceWrapper = screen.getByTestId('invoice-preview-clickable')
      const clickableInvoice = invoiceWrapper.querySelector('[tabindex="0"]')
      expect(clickableInvoice).toBeInTheDocument()
      await user.click(clickableInvoice!)

      // Modal should be open (Radix Dialog uses role="dialog")
      await waitFor(() => {
        // Look for the modal container or fullscreen dialog
        expect(screen.getAllByText(/INV-001/).length).toBeGreaterThan(1)
      })
    })

    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: true,
        data: VALID_INVOICE,
      })

      render(<PayWorkspace />)

      // Wait for invoice to render
      await waitFor(() => {
        expect(screen.getByText(/INV-001/)).toBeInTheDocument()
      })
      // Click on the invoice wrapper (has tabIndex=0 for accessibility)
      const invoiceWrapper = screen.getByTestId('invoice-preview-clickable')
      const clickableInvoice = invoiceWrapper.querySelector('[tabindex="0"]')
      expect(clickableInvoice).toBeInTheDocument()
      await user.click(clickableInvoice!)

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getAllByText(/INV-001/).length).toBeGreaterThan(1)
      })

      // Find and click close button (X button in modal)
      const closeButtons = screen.getAllByRole('button')
      const closeButton = closeButtons.find(
        (btn) => btn.getAttribute('aria-label')?.includes('close') ||
                 btn.textContent?.toLowerCase().includes('close')
      )

      if (closeButton) {
        await user.click(closeButton)
      } else {
        // Click outside to close (Radix overlay)
        await user.keyboard('{Escape}')
      }

      // Modal should be closed (back to single invoice display)
      await waitFor(() => {
        expect(screen.getAllByText(/INV-001/).length).toBe(1)
      })
    })
  })

  describe('US3: Handle Invalid Invoice URLs', () => {
    it('shows EMPTY_HASH error when hash is missing after hydration timeout', async () => {
      vi.mocked(useHashFragment).mockReturnValue('')

      render(<PayWorkspace />)

      // After hydration timeout, should show error
      await waitFor(() => {
        expect(screen.getByText('No Invoice Data')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('shows INVALID_FORMAT error for malformed hash', async () => {
      vi.mocked(useHashFragment).mockReturnValue('invalid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: false,
        error: { code: 'INVALID_FORMAT', message: 'Invalid format' },
      })

      render(<PayWorkspace />)

      await waitFor(() => {
        expect(screen.getByText('Invalid Invoice Link')).toBeInTheDocument()
      })
    })

    it('shows CORRUPTED_DATA error for corrupted hash', async () => {
      vi.mocked(useHashFragment).mockReturnValue('H_corrupted')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: false,
        error: { code: 'CORRUPTED_DATA', message: 'Data corrupted' },
      })

      render(<PayWorkspace />)

      await waitFor(() => {
        expect(screen.getByText('Corrupted Data')).toBeInTheDocument()
      })
    })

    it('navigates to home when Return Home button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(useHashFragment).mockReturnValue('invalid')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: false,
        error: { code: 'INVALID_FORMAT', message: 'Invalid' },
      })

      render(<PayWorkspace />)

      await waitFor(() => {
        expect(screen.getByText('Invalid Invoice Link')).toBeInTheDocument()
      })

      const returnHomeButton = screen.getByRole('button', { name: /return home/i })
      await user.click(returnHomeButton)

      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })

    it('renders error screen with data-network attribute', async () => {
      vi.mocked(useHashFragment).mockReturnValue('invalid')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: false,
        error: { code: 'INVALID_FORMAT', message: 'Invalid' },
      })

      render(<PayWorkspace />)

      await waitFor(() => {
        // Error screen should be visible (NetworkBackground is in root layout)
        expect(screen.getByTestId('decode-error-screen')).toBeInTheDocument()
        // Container should have data-network for theme coordination
        const container = screen.getByTestId('decode-error-screen').closest('[data-network]')
        expect(container).toBeInTheDocument()
      })
    })
  })

  describe('US5: Track Viewed Invoices', () => {
    it('calls addInvoice on successful decode', async () => {
      vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: true,
        data: VALID_INVOICE,
      })
      mockGetInvoice.mockReturnValue(undefined) // Not in history yet

      render(<PayWorkspace />)

      await waitFor(() => {
        expect(mockAddInvoice).toHaveBeenCalledWith(
          expect.objectContaining({
            invoiceId: 'INV-001',
            data: VALID_INVOICE,
            status: 'pending',
          })
        )
      })
    })

    it('does not add duplicate when invoice already exists', async () => {
      vi.mocked(useHashFragment).mockReturnValue('H_valid_hash')
      vi.mocked(parseInvoiceHash).mockReturnValue({
        success: true,
        data: VALID_INVOICE,
      })
      // Invoice already in history
      mockGetInvoice.mockReturnValue({
        invoiceId: 'INV-001',
        invoiceUrl: '/pay#H_mock_encoded',
        data: VALID_INVOICE,
        status: 'pending',
        createdAt: '2026-02-01T00:00:00Z',
      })

      render(<PayWorkspace />)

      await waitFor(() => {
        expect(screen.getByText(/INV-001/)).toBeInTheDocument()
      })

      // Should not call addInvoice for existing invoice
      expect(mockAddInvoice).not.toHaveBeenCalled()
    })
  })
})
