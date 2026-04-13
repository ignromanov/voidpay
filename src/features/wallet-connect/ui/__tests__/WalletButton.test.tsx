/**
 * WalletButton — hydration / idle state coverage
 *
 * Focused on the bug where `isReconnecting=true` hid the whole button
 * (opacity:0 + pointer-events:none), making the header feel frozen, plus
 * the follow-up bug where wagmi's SSR pre-hydration window (`status='disconnected'`
 * even with a persisted connection in localStorage) flashed a clickable
 * "Connect" button before the real reconnect state arrived. The fix renders an
 * explicit disabled loading button whenever `useWagmiHydrating()` is true.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockAccount = {
  address: undefined as `0x${string}` | undefined,
  isConnected: false,
}
let mockIsHydrating = false

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => mockAccount),
  useChainId: vi.fn(() => 1),
}))

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: vi.fn(() => ({ openConnectModal: vi.fn() })),
  useAccountModal: vi.fn(() => ({ openAccountModal: vi.fn() })),
  useChainModal: vi.fn(() => ({ openChainModal: vi.fn() })),
}))

vi.mock('@/shared/lib', async () => {
  const actual = await vi.importActual<typeof import('@/shared/lib')>('@/shared/lib')
  return {
    ...actual,
    useWagmiHydrating: vi.fn(() => mockIsHydrating),
  }
})

vi.mock('@/shared/ui/network-icon', () => ({
  NetworkIcon: () => <span data-testid="network-icon" />,
}))

import { WalletButton } from '../WalletButton'

describe('WalletButton', () => {
  beforeEach(() => {
    mockAccount.address = undefined
    mockAccount.isConnected = false
    mockIsHydrating = false
  })

  it('renders "Connect" button when idle + disconnected', () => {
    render(<WalletButton />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button.textContent).toContain('Connect')
    expect(button).not.toBeDisabled()
  })

  it('renders disabled "Reconnecting…" button while wagmi is hydrating', () => {
    mockIsHydrating = true
    render(<WalletButton />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-label', 'Reconnecting wallet')
  })

  it('hydration state takes priority over connected state', () => {
    mockAccount.isConnected = true
    mockAccount.address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    mockIsHydrating = true
    render(<WalletButton />)
    // Only the loading button is rendered — no account/chain buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toBeDisabled()
    expect(buttons[0]).toHaveAttribute('aria-busy', 'true')
  })

  it('hydration covers pre-SSR gap where useAccount is still disconnected', () => {
    // Reproduces the bug: wagmi with ssr:true reports status='disconnected'
    // on the first client render even when a persisted connection exists.
    // useWagmiHydrating's pre-hydration heuristic must keep the button in the
    // loading state until wagmi flips to reconnecting/connected.
    mockAccount.isConnected = false
    mockIsHydrating = true
    render(<WalletButton />)
    const button = screen.getByRole('button')
    // NOT the plain "Connect" idle button — it's the disabled loading one
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button.textContent).toContain('Reconnecting')
  })
})
