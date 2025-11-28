/**
 * T023-test: Component test for ConnectButton
 *
 * Tests the wrapped ConnectButton component with address truncation
 * and disconnect flow functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock the RainbowKit ConnectButton
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    Custom: ({
      children,
    }: {
      children: (props: {
        account?: {
          address: string
          displayName: string
          displayBalance?: string
        }
        chain?: { name: string; iconUrl?: string }
        openAccountModal: () => void
        openChainModal: () => void
        openConnectModal: () => void
        mounted: boolean
      }) => React.ReactNode
    }) => {
      // Mock render props function - omit optional props instead of using undefined
      const mockProps: Parameters<typeof children>[0] = {
        openAccountModal: vi.fn(),
        openChainModal: vi.fn(),
        openConnectModal: vi.fn(),
        mounted: true,
      }
      return <>{children(mockProps)}</>
    },
  },
}))

describe('ConnectButton', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should export ConnectWalletButton component', async () => {
    const { ConnectWalletButton } = await import('../ConnectButton')
    expect(ConnectWalletButton).toBeDefined()
  })

  it('should render "Connect Wallet" button when not connected', async () => {
    const { ConnectWalletButton } = await import('../ConnectButton')

    render(<ConnectWalletButton />)

    // Should show connect button when no account
    const connectButton = screen.getByRole('button')
    expect(connectButton).toBeInTheDocument()
    expect(connectButton).toHaveTextContent(/connect/i)
  })

  describe('truncateAddress', () => {
    it('should truncate Ethereum address correctly', async () => {
      const { truncateAddress } = await import('../ConnectButton')

      const fullAddress = '0x1234567890abcdef1234567890abcdef12345678'
      const truncated = truncateAddress(fullAddress)

      // Should show first 6 and last 4 characters
      expect(truncated).toBe('0x1234...5678')
    })

    it('should handle short addresses gracefully', async () => {
      const { truncateAddress } = await import('../ConnectButton')

      const shortAddress = '0x1234'
      const result = truncateAddress(shortAddress)

      // Should return as-is if too short
      expect(result).toBe('0x1234')
    })

    it('should handle undefined address', async () => {
      const { truncateAddress } = await import('../ConnectButton')

      const result = truncateAddress(undefined as unknown as string)

      expect(result).toBe('')
    })
  })
})

describe('ConnectButton with connected account', () => {
  beforeEach(() => {
    vi.resetModules()

    // Mock with connected account
    vi.doMock('@rainbow-me/rainbowkit', () => ({
      ConnectButton: {
        Custom: ({
          children,
        }: {
          children: (props: {
            account?: {
              address: string
              displayName: string
              displayBalance?: string
            }
            chain?: { name: string; iconUrl?: string }
            openAccountModal: () => void
            openChainModal: () => void
            openConnectModal: () => void
            mounted: boolean
          }) => React.ReactNode
        }) => {
          // Omit optional iconUrl instead of setting to undefined
          const mockProps: Parameters<typeof children>[0] = {
            account: {
              address: '0x1234567890abcdef1234567890abcdef12345678',
              displayName: '0x1234...5678',
              displayBalance: '1.5 ETH',
            },
            chain: { name: 'Ethereum' },
            openAccountModal: vi.fn(),
            openChainModal: vi.fn(),
            openConnectModal: vi.fn(),
            mounted: true,
          }
          return <>{children(mockProps)}</>
        },
      },
    }))
  })

  it('should show truncated address when connected', async () => {
    const { ConnectWalletButton } = await import('../ConnectButton')

    render(<ConnectWalletButton />)

    // Should show truncated address
    expect(screen.getByText(/0x1234.*5678/)).toBeInTheDocument()
  })
})
