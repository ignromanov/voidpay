import { render, screen, userEvent } from '@/shared/lib/test-utils'
import { OpenInBrowserGateProvider, useOpenInBrowserGate } from '../OpenInBrowserGateProvider'

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
  const gate = useOpenInBrowserGate()
  return <button onClick={gate.open}>Open gate</button>
}

function StateDisplay() {
  const gate = useOpenInBrowserGate()
  return <span data-testid="gate-state">{gate.isOpen ? 'open' : 'closed'}</span>
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OpenInBrowserGateProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with modal closed', () => {
    render(
      <OpenInBrowserGateProvider>
        <StateDisplay />
      </OpenInBrowserGateProvider>,
    )
    expect(screen.getByTestId('gate-state').textContent).toBe('closed')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('open() shows the modal', async () => {
    const user = userEvent.setup()
    render(
      <OpenInBrowserGateProvider>
        <OpenButton />
        <StateDisplay />
      </OpenInBrowserGateProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Open gate' }))
    expect(screen.getByTestId('gate-state').textContent).toBe('open')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('close() hides the modal (via dialog Close button)', async () => {
    const user = userEvent.setup()
    render(
      <OpenInBrowserGateProvider>
        <OpenButton />
        <StateDisplay />
      </OpenInBrowserGateProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Open gate' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Use the dialog's built-in Close button (Radix DialogPrimitive.Close)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('gate-state').textContent).toBe('closed')
  })

  it('useOpenInBrowserGate returns NOOP_GATE when used outside provider', () => {
    // Orphan consumer: no module-level capture (react-hooks/globals rule).
    // open/close are no-ops; rendered output reflects gate.isOpen.
    function Orphan() {
      const gate = useOpenInBrowserGate()
      // Invoke no-ops during render to verify they don't throw and don't change state.
      gate.open()
      gate.close()
      return <span data-testid="orphan-state">{gate.isOpen ? 'open' : 'closed'}</span>
    }

    expect(() => render(<Orphan />)).not.toThrow()
    expect(screen.getByTestId('orphan-state')).toHaveTextContent('closed')
  })
})
