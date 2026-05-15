import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent } from '@/shared/lib/test-utils'
import { TelegramGateProvider, useTelegramGate } from '../TelegramGateProvider'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: vi.fn(() => ({ openConnectModal: vi.fn() })),
}))

vi.mock('@/features/analytics/lib/track', () => ({
  track: vi.fn(),
  AnalyticsEvent: {
    MOBILE_IAB_PAY_INTERCEPTED: 'mobile-iab-pay-intercepted',
  },
}))

// ---------------------------------------------------------------------------
// Test consumer components
// ---------------------------------------------------------------------------

function OpenButton() {
  const gate = useTelegramGate()
  return <button onClick={gate.open}>Open gate</button>
}

function StateDisplay() {
  const gate = useTelegramGate()
  return <span data-testid="gate-state">{gate.isOpen ? 'open' : 'closed'}</span>
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TelegramGateProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with modal closed', () => {
    render(
      <TelegramGateProvider>
        <StateDisplay />
      </TelegramGateProvider>,
    )
    expect(screen.getByTestId('gate-state').textContent).toBe('closed')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('open() shows the modal', async () => {
    const user = userEvent.setup()
    render(
      <TelegramGateProvider>
        <OpenButton />
        <StateDisplay />
      </TelegramGateProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Open gate' }))
    expect(screen.getByTestId('gate-state').textContent).toBe('open')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('close() hides the modal (via dialog Close button)', async () => {
    const user = userEvent.setup()
    render(
      <TelegramGateProvider>
        <OpenButton />
        <StateDisplay />
      </TelegramGateProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Open gate' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Use the dialog's built-in Close button (Radix DialogPrimitive.Close)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('gate-state').textContent).toBe('closed')
  })

  it('useTelegramGate throws when used outside provider', () => {
    // Suppress React's error boundary console noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function Orphan() {
      useTelegramGate()
      return null
    }

    expect(() => render(<Orphan />)).toThrow(
      'useTelegramGate must be used inside <TelegramGateProvider>',
    )

    consoleSpy.mockRestore()
  })
})
