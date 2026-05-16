import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent } from '@/shared/lib/test-utils'
import { InAppBrowserGuard } from '../InAppBrowserGuard'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@/shared/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib')>()
  return {
    ...actual,
    isHostileInAppBrowser: vi.fn(() => false),
  }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { isHostileInAppBrowser } from '@/shared/lib'

function setHostile(value: boolean) {
  vi.mocked(isHostileInAppBrowser).mockReturnValue(value)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InAppBrowserGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setHostile(false)
  })

  // ─── Render branches ────────────────────────────────────────────────────

  it('renders null for regular browser', () => {
    const { container } = render(<InAppBrowserGuard />)
    expect(container.firstChild).toBeNull()
  })

  it('renders passive bottom panel when isHostileInAppBrowser is true', () => {
    setHostile(true)
    render(<InAppBrowserGuard />)
    expect(screen.getByText(/open in safari\/chrome to pay/i)).toBeInTheDocument()
    // No dialog role — panel is informational, not a dialog
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('bottom panel sits above floating Footer (uses calc offset, not bottom-0)', () => {
    setHostile(true)
    const { container } = render(<InAppBrowserGuard />)
    // The outermost panel div must NOT use bottom-0; it must use the safe-area-aware offset
    const panel = container.firstElementChild as HTMLElement
    expect(panel).not.toHaveClass('bottom-0')
    expect(panel.className).toContain('bottom-[calc(2.75rem+env(safe-area-inset-bottom,0px))]')
  })

  it('does not render interstitial (old blocking dialog) in hostile IAB', () => {
    setHostile(true)
    render(<InAppBrowserGuard />)
    expect(screen.queryByText('Wallet connection unavailable')).toBeNull()
  })

  // ─── Copy link — behaviour assertions ───────────────────────────────────

  it('keeps fallback hidden when clipboard.writeText resolves', async () => {
    setHostile(true)
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<InAppBrowserGuard />)
    await user.click(screen.getByRole('button', { name: /copy link/i }))

    // Success path: readonly-input fallback must NOT appear
    expect(screen.queryByLabelText('Invoice link')).not.toBeInTheDocument()
  })

  it('shows fallback input when clipboard.writeText rejects', async () => {
    setHostile(true)
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('NotAllowedError'))

    const user = userEvent.setup()
    render(<InAppBrowserGuard />)
    await user.click(screen.getByRole('button', { name: /copy link/i }))

    expect(await screen.findByLabelText('Invoice link')).toBeInTheDocument()
  })

  // ─── Dismissibility ─────────────────────────────────────────────────────

  it('hides the panel when the dismiss button is clicked', async () => {
    setHostile(true)
    const user = userEvent.setup()
    render(<InAppBrowserGuard />)
    expect(screen.getByText(/open in safari\/chrome to pay/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(screen.queryByText(/open in safari\/chrome to pay/i)).not.toBeInTheDocument()
  })

  it('does not render a Show QR Code button (removed 2026-05-15)', () => {
    setHostile(true)
    render(<InAppBrowserGuard />)
    expect(screen.queryByRole('button', { name: /show qr code/i })).toBeNull()
  })
})
