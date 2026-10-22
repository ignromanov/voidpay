/**
 * After "Generate Invoice Link" the page must do a full document navigation
 * (Next router appends the hash onto a cached /invoice route -> `#A#A`).
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/shared/lib/test-utils/render'
import userEvent from '@testing-library/user-event'
import { CreateWorkspace } from '../CreateWorkspace'
import { useCreatorStore } from '@/entities/creator'
import { TEST_INVOICES } from '@/shared/lib/test-utils'

const mockRouterReplace = vi.hoisted(() => vi.fn())
const mockRouterPush = vi.hoisted(() => vi.fn())
const mockNavigateToHashUrl = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace, prefetch: vi.fn() }),
  usePathname: () => '/create',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

vi.mock('@/shared/lib/navigation', () => ({
  navigateToHashUrl: mockNavigateToHashUrl,
}))

vi.mock('@/shared/lib/hooks', () => ({
  useHashFragment: () => '',
  useHydrated: () => true,
}))

vi.mock('@/features/generate-link', () => ({
  UrlSizeError: class UrlSizeError extends Error {},
  validateInvoiceForGeneration: () => ({ isValid: true, errors: [] }),
  generateAndTrackInvoice: vi.fn(async () => ({
    url: 'https://voidpay.xyz/pay#HASHDATA',
  })),
}))

vi.mock('@/widgets/invoice-form', () => ({
  InvoiceForm: ({ onGenerate }: { onGenerate: () => void }) => (
    <button onClick={onGenerate}>Generate Invoice Link</button>
  ),
}))

describe('CreateWorkspace generate -> /invoice navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCreatorStore.setState({
      activeDraft: {
        meta: { draftId: 'd1', lastModified: new Date().toISOString() },
        data: TEST_INVOICES.full(),
      },
      lineItems: [],
    })
  })

  it('navigates to /invoice?share=1#hash via navigateToHashUrl, not the router', async () => {
    const user = userEvent.setup()
    render(<CreateWorkspace />)

    await user.click(screen.getByRole('button', { name: /generate invoice link/i }))

    await waitFor(() => expect(mockNavigateToHashUrl).toHaveBeenCalledTimes(1))
    const [url, opts] = mockNavigateToHashUrl.mock.calls[0]!
    expect(String(url instanceof URL ? url.pathname + url.search + url.hash : url)).toBe(
      '/invoice?share=1#HASHDATA',
    )
    expect(opts).toEqual({ replace: true })
    expect(mockRouterReplace).not.toHaveBeenCalled()
    expect(mockRouterPush).not.toHaveBeenCalled()
  })
})
