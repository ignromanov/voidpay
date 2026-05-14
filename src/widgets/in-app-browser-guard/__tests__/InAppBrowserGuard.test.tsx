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

vi.mock('@/features/analytics/lib/track', () => ({
  track: vi.fn(),
  AnalyticsEvent: {
    MOBILE_TG_WEBVIEW_BLOCKED: 'mobile-tg-webview-blocked',
  },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { isTelegramWebView, isInAppBrowser } from '@/shared/lib'
import { track } from '@/features/analytics/lib/track'

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
    // Interstitial must NOT be present
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders Telegram interstitial when isTelegramWebView is true', () => {
    setTelegram(true)
    render(<InAppBrowserGuard />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Wallet connection unavailable')).toBeInTheDocument()
    // Banner must NOT be present
    expect(screen.queryByText('In-app browser detected')).toBeNull()
  })

  // ─── A11y ────────────────────────────────────────────────────────────────

  it('interstitial has aria-modal="true"', () => {
    setTelegram(true)
    render(<InAppBrowserGuard />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  // ─── Analytics ──────────────────────────────────────────────────────────

  it('fires mobile-tg-webview-blocked exactly once on mount', () => {
    setTelegram(true)
    render(<InAppBrowserGuard />)
    expect(track).toHaveBeenCalledOnce()
    expect(track).toHaveBeenCalledWith('mobile-tg-webview-blocked')
  })

  it('does not fire analytics event in banner mode', () => {
    setTelegram(false)
    setInAppBrowser(true)
    render(<InAppBrowserGuard />)
    expect(track).not.toHaveBeenCalled()
  })

  // ─── Copy link ───────────────────────────────────────────────────────────

  it('keeps fallback hidden when clipboard.writeText resolves successfully', async () => {
    setTelegram(true)
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<InAppBrowserGuard />)
    await user.click(screen.getByRole('button', { name: /copy link/i }))

    // Behaviour assertion: successful copy must NOT trigger the readonly-input fallback.
    // Pairs with the rejection test below — together they prove both try/catch branches
    // exercise navigator.clipboard.writeText (avoids vitest+happy-dom call-tracking quirks
    // with vi.spyOn on host-object accessors).
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

  // ─── Show QR Code ────────────────────────────────────────────────────────

  it('dismisses interstitial when Show QR Code is clicked', async () => {
    setTelegram(true)
    const user = userEvent.setup()
    render(<InAppBrowserGuard />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /show qr code/i }))

    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
