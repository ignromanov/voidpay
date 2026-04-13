/**
 * WalletButton — reconnect/idle state coverage
 *
 * Focused on the bug where `isReconnecting=true` hid the whole button
 * (opacity:0 + pointer-events:none), making the header feel frozen.
 * The fix renders an explicit disabled loading button instead.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockAccount = {
  address: undefined as `0x${string}` | undefined,
  isConnected: false,
  isReconnecting: false,
}

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => mockAccount),
  useChainId: vi.fn(() => 1),
}))

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: vi.fn(() => ({ openConnectModal: vi.fn() })),
  useAccountModal: vi.fn(() => ({ openAccountModal: vi.fn() })),
  useChainModal: vi.fn(() => ({ openChainModal: vi.fn() })),
}))

vi.mock('@/shared/ui/network-icon', () => ({
  NetworkIcon: () => <span data-testid="network-icon" />,
}))

import { WalletButton } from '../WalletButton'

describe('WalletButton', () => {
  beforeEach(() => {
    mockAccount.address = undefined
    mockAccount.isConnected = false
    mockAccount.isReconnecting = false
  })

  it('renders "Connect" button when idle + disconnected', () => {
    render(<WalletButton />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button.textContent).toContain('Connect')
    expect(button).not.toBeDisabled()
  })

  it('renders disabled "Reconnecting…" button during wagmi reconnect', () => {
    mockAccount.isReconnecting = true
    render(<WalletButton />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-label', 'Reconnecting wallet')
  })

  it('reconnect state takes priority over connected state', () => {
    mockAccount.isConnected = true
    mockAccount.address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    mockAccount.isReconnecting = true
    render(<WalletButton />)
    // Only the loading button is rendered — no account/chain buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toBeDisabled()
    expect(buttons[0]).toHaveAttribute('aria-busy', 'true')
  })
})
