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
    isTelegramWebView: vi.fn(() => false),
    isInAppBrowser: vi.fn(() => false),
  }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { isTelegramWebView, isInAppBrowser } from '@/shared/lib'

function setTelegram(value: boolean) {
  vi.mocked(isTelegramWebView).mockReturnValue(value)
}

function setInAppBrowser(value: boolean) {
  vi.mocked(isInAppBrowser).mockReturnValue(value)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InAppBrowserGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setTelegram(false)
    setInAppBrowser(false)
  })

  // ─── Render branches ────────────────────────────────────────────────────

  it('renders null for regular browser', () => {
    const { container } = render(<InAppBrowserGuard />)
    expect(container.firstChild).toBeNull()
  })

  it('renders dismissible banner for non-Telegram in-app browser', () => {
    setTelegram(false)
    setInAppBrowser(true)
    render(<InAppBrowserGuard />)
    expect(screen.getByText('In-app browser detected')).toBeInTheDocument()
    // Panel must NOT be present
    expect(screen.queryByText(/open in safari/i)).toBeNull()
  })

  it('renders passive bottom panel when isTelegramWebView is true', () => {
    setTelegram(true)
    render(<InAppBrowserGuard />)
    expect(screen.getByText(/open in safari\/chrome to pay/i)).toBeInTheDocument()
    // No dialog role — panel is informational, not a dialog
    expect(screen.queryByRole('dialog')).toBeNull()
    // Banner must NOT be present
    expect(screen.queryByText('In-app browser detected')).toBeNull()
  })

  it('does not render interstitial (old blocking dialog) in Telegram', () => {
    setTelegram(true)
    render(<InAppBrowserGuard />)
    expect(screen.queryByText('Wallet connection unavailable')).toBeNull()
  })

  // ─── Copy link — behaviour assertions ───────────────────────────────────

  it('keeps fallback hidden when clipboard.writeText resolves', async () => {
    setTelegram(true)
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<InAppBrowserGuard />)
    await user.click(screen.getByRole('button', { name: /copy link/i }))

    // Success path: readonly-input fallback must NOT appear
    expect(screen.queryByLabelText('Invoice link')).not.toBeInTheDocument()
  })

  it('shows fallback input when clipboard.writeText rejects', async () => {
    setTelegram(true)
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('NotAllowedError'))

    const user = userEvent.setup()
    render(<InAppBrowserGuard />)
    await user.click(screen.getByRole('button', { name: /copy link/i }))

    expect(await screen.findByLabelText('Invoice link')).toBeInTheDocument()
  })

  // ─── Show QR Code CTA ────────────────────────────────────────────────────

  it('calls onShowQRClick when Show QR Code button is clicked', async () => {
    setTelegram(true)
    const onShowQRClick = vi.fn()
    const user = userEvent.setup()
    render(<InAppBrowserGuard onShowQRClick={onShowQRClick} />)

    await user.click(screen.getByRole('button', { name: /show qr code/i }))

    expect(onShowQRClick).toHaveBeenCalledOnce()
  })

  it('does not render Show QR Code button when onShowQRClick is not provided', () => {
    setTelegram(true)
    render(<InAppBrowserGuard />)
    expect(screen.queryByRole('button', { name: /show qr code/i })).toBeNull()
  })

  // ─── Banner branch preserved ─────────────────────────────────────────────

  it('banner is dismissible via X button', async () => {
    setInAppBrowser(true)
    const user = userEvent.setup()
    render(<InAppBrowserGuard />)

    expect(screen.getByText('In-app browser detected')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(screen.queryByText('In-app browser detected')).toBeNull()
  })
})
