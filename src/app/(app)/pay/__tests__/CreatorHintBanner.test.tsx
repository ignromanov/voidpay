import { render, screen, waitFor } from '@/shared/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion to avoid animation issues in tests
vi.mock('@/shared/ui/motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock @/shared/config to provide STORAGE_KEYS
vi.mock('@/shared/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/config')>()
  return {
    ...actual,
    STORAGE_KEYS: {
      CREATOR: 'voidpay:creator',
      PAYER: 'voidpay:payer',
      INVOICES: 'voidpay:invoices',
      HINT_DISMISSED: 'voidpay:hint-dismissed',
    },
  }
})

// Import component under test
import { CreatorHintBanner } from '../CreatorHintBanner'

describe('CreatorHintBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('does not render when isCreator=false', () => {
    render(<CreatorHintBanner isCreator={false} />)

    expect(screen.queryByText('Track status →')).not.toBeInTheDocument()
  })

  it('renders when isCreator=true and localStorage has no dismissed flag', async () => {
    // No dismissed flag in localStorage
    render(<CreatorHintBanner isCreator={true} />)

    await waitFor(() => {
      expect(screen.getByText('Track status →')).toBeInTheDocument()
    })
  })

  it('shows "Track status" link pointing to /invoice', async () => {
    render(<CreatorHintBanner isCreator={true} />)

    await waitFor(() => {
      const link = screen.getByText('Track status →')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
      expect(link.getAttribute('href')).toContain('/invoice')
    })
  })

  it('dismisses on X click and saves to localStorage', async () => {
    const user = userEvent.setup()

    render(<CreatorHintBanner isCreator={true} />)

    await waitFor(() => {
      expect(screen.getByText('Track status →')).toBeInTheDocument()
    })

    const dismissButton = screen.getByRole('button', { name: /dismiss hint/i })
    await user.click(dismissButton)

    await waitFor(() => {
      expect(screen.queryByText('Track status →')).not.toBeInTheDocument()
    })

    // Verify localStorage was updated
    expect(localStorage.getItem('voidpay:hint-dismissed')).toBe('true')
  })

  it('stays hidden when localStorage has dismissed=true', async () => {
    localStorage.setItem('voidpay:hint-dismissed', 'true')

    render(<CreatorHintBanner isCreator={true} />)

    // Component starts with dismissed=true, effect confirms it
    // Banner should never appear
    await waitFor(() => {
      expect(screen.queryByText('This is your invoice')).not.toBeInTheDocument()
    })
  })
})
