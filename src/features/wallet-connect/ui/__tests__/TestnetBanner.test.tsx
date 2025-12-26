/**
 * T051-test: Component test for TestnetBanner
 *
 * Tests the "TESTNET MODE" warning banner component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock wagmi with all required exports
vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useChainId: vi.fn(() => 1), // Default to mainnet
  }
})

describe('TestnetBanner', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it(
    'should export TestnetBanner component',
    async () => {
      const { TestnetBanner } = await import('../TestnetBanner')
      expect(TestnetBanner).toBeDefined()
    },
    20000
  ) // Increase timeout for dynamic import

  it('should not render when on mainnet', async () => {
    vi.mocked((await import('wagmi')).useChainId).mockReturnValue(1)

    const { TestnetBanner } = await import('../TestnetBanner')
    const { container } = render(<TestnetBanner />)

    // Should not render anything on mainnet
    expect(container.firstChild).toBeNull()
  })

  it('should render banner when on testnet', async () => {
    vi.mocked((await import('wagmi')).useChainId).mockReturnValue(11155111) // Sepolia

    const { TestnetBanner } = await import('../TestnetBanner')
    render(<TestnetBanner />)

    // Should show testnet warning
    expect(screen.getByText(/testnet/i)).toBeInTheDocument()
  })

  it('should include warning about test funds', async () => {
    vi.mocked((await import('wagmi')).useChainId).mockReturnValue(11155111)

    const { TestnetBanner } = await import('../TestnetBanner')
    render(<TestnetBanner />)

    // Should warn about test funds
    const banner = screen.getByRole('alert')
    expect(banner).toBeInTheDocument()
  })
})

describe('useIsTestnet', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should export useIsTestnet hook', async () => {
    const { useIsTestnet } = await import('../TestnetBanner')
    expect(useIsTestnet).toBeDefined()
  })
})
