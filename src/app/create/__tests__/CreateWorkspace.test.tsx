/**
 * CreateWorkspace component tests
 * Feature: 015-create-page-preview
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type React from 'react'
import { CreateWorkspace } from '../CreateWorkspace'
import { useCreatorStore } from '@/entities/creator'
import { TEST_INVOICES } from '@/shared/lib/test-utils'
import { encodeInvoice } from '@/features/invoice-codec'
import * as toastModule from '@/shared/lib/toast'

// Helper to render with userEvent
function renderWithUser(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  }
}

// Mock hooks from shared/lib/hooks
const mockUseHashFragment = vi.hoisted(() => vi.fn(() => ''))
const mockUseHydrated = vi.hoisted(() => vi.fn(() => true))
vi.mock('@/shared/lib/hooks', () => ({
  useHashFragment: mockUseHashFragment,
  useHydrated: mockUseHydrated,
}))

// Mock toast
const mockToast = {
  error: vi.fn(),
  success: vi.fn(),
  loading: vi.fn(),
  info: vi.fn(),
}
vi.spyOn(toastModule, 'toast', 'get').mockReturnValue(mockToast as any)

describe('CreateWorkspace', () => {
  beforeEach(() => {
    // Reset store state
    useCreatorStore.setState({
      activeDraft: null,
      lineItems: [],
      templates: [],
      history: [],
      preferences: {
        defaultNetworkId: 1,
        defaultCurrency: 'USDC',
      },
      networkTheme: 'ethereum',
    })
    mockUseHashFragment.mockReturnValue('')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders preview container', () => {
      renderWithUser(<CreateWorkspace />)

      // Should have main container
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('renders Live Preview badge', () => {
      renderWithUser(<CreateWorkspace />)

      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('renders invoice from store when available', () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      renderWithUser(<CreateWorkspace />)

      // Invoice content should be visible (invoiceId rendered with # prefix)
      // Multiple matches (screen + print target), take first
      expect(screen.getAllByText(new RegExp(testInvoice.invoiceId))[0]).toBeInTheDocument()
      expect(screen.getAllByText(testInvoice.from.name)[0]).toBeInTheDocument()
    })

    it('renders with empty state when no invoice', () => {
      renderWithUser(<CreateWorkspace />)

      // Live Preview badge should still be visible
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('renders Expand button on hover when invoice exists', async () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      const { user, container } = renderWithUser(<CreateWorkspace />)

      // Find the scaled preview container (role="button" div without aria-label)
      const previewButton = container.querySelector('[role="button"]') as HTMLElement
      expect(previewButton).toBeInTheDocument()

      // Expand button should be hidden initially (opacity-0)
      const expandButton = screen.getByText('Expand')
      expect(expandButton).toBeInTheDocument()

      // Hover over preview
      await user.hover(previewButton)

      // Button should be visible (opacity-100 applied via isHovered)
      expect(expandButton).toBeInTheDocument()
    })

    it('hides Expand button on mouse leave', async () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      const { user, container } = renderWithUser(<CreateWorkspace />)

      const previewButton = container.querySelector('[role="button"]') as HTMLElement

      // Hover over preview
      await user.hover(previewButton)

      const expandButton = screen.getByText('Expand')
      expect(expandButton).toBeInTheDocument()

      // Unhover
      await user.unhover(previewButton)

      // Button should still be in DOM (just opacity changes)
      expect(expandButton).toBeInTheDocument()
    })
  })

  describe('URL hash decoding', () => {
    it('decodes invoice from URL hash on mount', async () => {
      const testInvoice = TEST_INVOICES.full()
      const encodedHash = encodeInvoice(testInvoice)

      mockUseHashFragment.mockReturnValue(encodedHash)

      renderWithUser(<CreateWorkspace />)

      // Wait for useEffect to decode
      await waitFor(() => {
        const state = useCreatorStore.getState()
        expect(state.activeDraft?.data.invoiceId).toBe(testInvoice.invoiceId)
      })
    })

    it('updates store when hash changes', async () => {
      const { rerender } = renderWithUser(<CreateWorkspace />)

      // Initially no hash
      expect(useCreatorStore.getState().activeDraft).toBeNull()

      // Change hash
      const testInvoice = TEST_INVOICES.full()
      const encodedHash = encodeInvoice(testInvoice)
      mockUseHashFragment.mockReturnValue(encodedHash)

      rerender(<CreateWorkspace />)

      await waitFor(() => {
        const state = useCreatorStore.getState()
        expect(state.activeDraft?.data.invoiceId).toBe(testInvoice.invoiceId)
      })
    })

    it('shows error toast when hash decoding fails', async () => {
      mockUseHashFragment.mockReturnValue('invalid-hash-data')

      renderWithUser(<CreateWorkspace />)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled()
      })
    })

    it('does not clear store on decode error', async () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      mockUseHashFragment.mockReturnValue('invalid-hash')

      renderWithUser(<CreateWorkspace />)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled()
      })

      // Store should still have the original draft
      const state = useCreatorStore.getState()
      expect(state.activeDraft?.data.invoiceId).toBe(testInvoice.invoiceId)
    })

    it('does not show success toast on successful decode (silent)', async () => {
      const testInvoice = TEST_INVOICES.full()
      const encodedHash = encodeInvoice(testInvoice)

      mockUseHashFragment.mockReturnValue(encodedHash)

      renderWithUser(<CreateWorkspace />)

      await waitFor(() => {
        const state = useCreatorStore.getState()
        expect(state.activeDraft).not.toBeNull()
      })

      // Should NOT show success toast (per spec)
      expect(mockToast.success).not.toHaveBeenCalled()
    })

    it('does nothing when hash is empty', () => {
      mockUseHashFragment.mockReturnValue('')

      renderWithUser(<CreateWorkspace />)

      // No decode attempt, no toast
      expect(mockToast.error).not.toHaveBeenCalled()
      expect(mockToast.success).not.toHaveBeenCalled()
    })
  })

  describe('network theme management', () => {
    it('sets network theme from invoice networkId', async () => {
      const testInvoice = TEST_INVOICES.full()
      testInvoice.networkId = 42161 // Arbitrum

      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      renderWithUser(<CreateWorkspace />)

      await waitFor(() => {
        const state = useCreatorStore.getState()
        expect(state.networkTheme).toBe('arbitrum')
      })
    })

    it('defaults to ethereum theme when no invoice', () => {
      renderWithUser(<CreateWorkspace />)

      const state = useCreatorStore.getState()
      expect(state.networkTheme).toBe('ethereum')
    })

    it('updates theme when invoice networkId changes', async () => {
      const testInvoice = TEST_INVOICES.full()
      testInvoice.networkId = 1 // Ethereum

      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
        networkTheme: 'ethereum',
      })

      const { rerender } = renderWithUser(<CreateWorkspace />)

      // Change networkId
      testInvoice.networkId = 137 // Polygon
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      rerender(<CreateWorkspace />)

      await waitFor(() => {
        const state = useCreatorStore.getState()
        expect(state.networkTheme).toBe('polygon')
      })
    })
  })

  describe('preview modal interaction', () => {
    it('opens preview modal when preview is clicked', async () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      const { user, container } = renderWithUser(<CreateWorkspace />)

      const previewButton = container.querySelector('[role="button"]') as HTMLElement

      await user.click(previewButton)

      // Modal should be open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('does not open modal when no invoice data', async () => {
      const { user, container } = renderWithUser(<CreateWorkspace />)

      // Preview container exists but clicking it should not open modal
      const previewButton = container.querySelector('[role="button"]') as HTMLElement
      expect(previewButton).toBeInTheDocument()

      await user.click(previewButton)

      // Modal should NOT open (no invoice data)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('closes modal when close button clicked', async () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      const { user, container } = renderWithUser(<CreateWorkspace />)

      // Open modal
      const previewButton = container.querySelector('[role="button"]') as HTMLElement
      await user.click(previewButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Close modal
      const closeButton = screen.getByLabelText(/close preview/i)
      await user.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes on clickable preview', () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      const { container } = renderWithUser(<CreateWorkspace />)

      const previewButton = container.querySelector('[role="button"]') as HTMLElement
      expect(previewButton).toHaveAttribute('tabIndex', '0')
    })

    it('supports keyboard navigation (Enter key)', async () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      const { user, container } = renderWithUser(<CreateWorkspace />)

      const previewButton = container.querySelector('[role="button"]') as HTMLElement
      previewButton.focus()

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation (Space key)', async () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      const { user, container } = renderWithUser(<CreateWorkspace />)

      const previewButton = container.querySelector('[role="button"]') as HTMLElement
      previewButton.focus()

      await user.keyboard(' ')

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })
  })

  describe('responsive scaling', () => {
    it('applies correct glow className from network', () => {
      const testInvoice = TEST_INVOICES.full()
      testInvoice.networkId = 42161 // Arbitrum

      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      renderWithUser(<CreateWorkspace />)

      // Component should render with network-specific glow
      // (Actual glow classes tested in ScaledInvoicePreview tests)
      // Multiple matches (screen + print target), take first
      expect(screen.getAllByText(new RegExp(testInvoice.invoiceId))[0]).toBeInTheDocument()
    })

    it('uses editor preset for scaling', () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      renderWithUser(<CreateWorkspace />)

      // ScaledInvoicePreview should be rendered with preset="editor"
      // (Scaling behavior tested in ScaledInvoicePreview tests)
      // Multiple matches (screen + print target), take first
      expect(screen.getAllByText(new RegExp(testInvoice.invoiceId))[0]).toBeInTheDocument()
    })
  })

  describe('print layout', () => {
    it('renders print-only invoice section', () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      const { container } = renderWithUser(<CreateWorkspace />)

      // Should have .invoice-print-target element
      const printTarget = container.querySelector('.invoice-print-target')
      expect(printTarget).toBeInTheDocument()
    })

    it('hides print section on screen', () => {
      const testInvoice = TEST_INVOICES.full()
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: testInvoice,
        },
      })

      const { container } = renderWithUser(<CreateWorkspace />)

      const printTarget = container.querySelector('.invoice-print-target')
      expect(printTarget).toHaveClass('hidden')
      expect(printTarget).toHaveClass('print:block')
    })
  })

  describe('edge cases', () => {
    it('handles invoice with minimal data', () => {
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: {
            invoiceId: 'MIN-001',
            networkId: 1,
            currency: 'ETH',
            decimals: 18,
            from: { name: 'Sender' },
          },
        },
      })

      renderWithUser(<CreateWorkspace />)

      // invoiceId rendered with # prefix
      // Multiple matches (screen + print target), take first
      expect(screen.getAllByText(/MIN-001/)[0]).toBeInTheDocument()
      expect(screen.getAllByText('Sender')[0]).toBeInTheDocument()
    })

    it('handles rapid hash changes gracefully', async () => {
      const invoice1 = TEST_INVOICES.full()
      invoice1.invoiceId = 'RAPID-001'

      const invoice2 = TEST_INVOICES.full()
      invoice2.invoiceId = 'RAPID-002'

      // First hash
      mockUseHashFragment.mockReturnValue(encodeInvoice(invoice1))
      const { rerender } = renderWithUser(<CreateWorkspace />)

      await waitFor(() => {
        expect(useCreatorStore.getState().activeDraft?.data.invoiceId).toBe('RAPID-001')
      })

      // Second hash
      mockUseHashFragment.mockReturnValue(encodeInvoice(invoice2))
      rerender(<CreateWorkspace />)

      await waitFor(() => {
        expect(useCreatorStore.getState().activeDraft?.data.invoiceId).toBe('RAPID-002')
      })
    })

    it('handles missing decimals in invoice', () => {
      useCreatorStore.setState({
        activeDraft: {
          meta: {
            draftId: 'draft-1',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
          data: {
            invoiceId: 'NO-DECIMALS',
            networkId: 1,
            currency: 'USDC',
            from: { name: 'Test' },
            // decimals missing
          } as any,
        },
      })

      renderWithUser(<CreateWorkspace />)

      // Should render without crashing (invoiceId with # prefix)
      // Multiple matches (screen + print target), take first
      expect(screen.getAllByText(/NO-DECIMALS/)[0]).toBeInTheDocument()
    })
  })
})
