import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent } from '@/shared/lib/test-utils'
import { TelegramPayActionModal } from '../TelegramPayActionModal'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockOpenConnectModal = vi.fn()

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: vi.fn(() => ({ openConnectModal: mockOpenConnectModal })),
}))

vi.mock('@/features/analytics/lib/track', () => ({
  track: vi.fn(),
  AnalyticsEvent: {
    MOBILE_TG_PAY_INTERCEPTED: 'mobile-tg-pay-intercepted',
  },
}))

import { track } from '@/features/analytics/lib/track'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TelegramPayActionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Render gating ───────────────────────────────────────────────────────

  it('does not render when open is false', () => {
    render(<TelegramPayActionModal open={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders dialog when open is true', () => {
    render(<TelegramPayActionModal open={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/open in another browser to pay/i)).toBeInTheDocument()
  })

  // ─── Dismissal paths ────────────────────────────────────────────────────

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<TelegramPayActionModal open={true} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when ESC is pressed', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<TelegramPayActionModal open={true} onClose={onClose} />)

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })

  // ─── Copy link — behaviour assertions ───────────────────────────────────

  it('keeps fallback hidden when clipboard.writeText resolves', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<TelegramPayActionModal open={true} onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /copy link/i }))

    // Success path: readonly-input fallback must NOT appear
    expect(screen.queryByLabelText('Invoice link')).not.toBeInTheDocument()
  })

  it('shows fallback input when clipboard.writeText rejects', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('NotAllowedError'))
    const user = userEvent.setup()
    render(<TelegramPayActionModal open={true} onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /copy link/i }))

    expect(await screen.findByLabelText('Invoice link')).toBeInTheDocument()
  })

  // ─── Show QR Code ────────────────────────────────────────────────────────

  it('calls openConnectModal and onClose when Show QR Code is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<TelegramPayActionModal open={true} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /show qr code/i }))

    expect(mockOpenConnectModal).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  // ─── Analytics ───────────────────────────────────────────────────────────

  it('fires mobile-tg-pay-intercepted once when modal opens', () => {
    render(<TelegramPayActionModal open={true} onClose={vi.fn()} />)

    expect(track).toHaveBeenCalledOnce()
    expect(track).toHaveBeenCalledWith('mobile-tg-pay-intercepted')
  })

  it('does not fire analytics when modal is closed', () => {
    render(<TelegramPayActionModal open={false} onClose={vi.fn()} />)

    expect(track).not.toHaveBeenCalled()
  })

  it('fires analytics only once per open transition even on re-render', () => {
    const { rerender } = render(<TelegramPayActionModal open={true} onClose={vi.fn()} />)
    rerender(<TelegramPayActionModal open={true} onClose={vi.fn()} />)

    expect(track).toHaveBeenCalledOnce()
  })

  it('fires analytics again when modal is re-opened after close', () => {
    const { rerender } = render(<TelegramPayActionModal open={true} onClose={vi.fn()} />)
    expect(track).toHaveBeenCalledTimes(1)

    rerender(<TelegramPayActionModal open={false} onClose={vi.fn()} />)
    rerender(<TelegramPayActionModal open={true} onClose={vi.fn()} />)

    expect(track).toHaveBeenCalledTimes(2)
  })
})
