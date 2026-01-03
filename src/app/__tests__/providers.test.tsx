/**
 * T021-test: Integration test for providers setup
 *
 * Tests that WagmiProvider, QueryClientProvider, and RainbowKitProvider
 * are correctly configured and can render children.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock RainbowKit CSS import
vi.mock('@rainbow-me/rainbowkit/styles.css', () => ({}))

// Mock the RainbowKit and Wagmi modules since they require DOM
vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="rainbowkit-provider">{children}</div>
  ),
  getDefaultConfig: vi.fn(() => ({
    chains: [],
    connectors: [],
    ssr: true,
  })),
  darkTheme: vi.fn(() => ({})),
}))

vi.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="wagmi-provider">{children}</div>
  ),
  createConfig: vi.fn(),
  createStorage: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })),
  http: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  QueryClient: class MockQueryClient {
    defaultOptions = {}
    constructor(options?: { defaultOptions?: object }) {
      this.defaultOptions = options?.defaultOptions ?? {}
    }
    clear() {}
  },
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}))

// Mock the wagmi config from shared
vi.mock('@/shared/config/wagmi', () => ({
  config: {
    chains: [],
    connectors: [],
    state: {},
    storage: {},
  },
  wagmiConfig: {
    chains: [],
    connectors: [],
    state: {},
    storage: {},
  },
  chains: [],
}))

// Mock the theme from shared config
vi.mock('@/shared/config/rainbowkit-theme', () => ({
  voidPayTheme: {
    colors: {
      modalBackground: '#000',
    },
  },
  VOIDPAY_ACCENT_COLOR: '#7C3AED',
}))

describe('Providers', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should export a Providers component', async () => {
    const { Providers } = await import('../providers')
    expect(Providers).toBeDefined()
    expect(typeof Providers).toBe('function')
  }, 60000)

  it('should export a Web3Provider component', async () => {
    const { Web3Provider } = await import('../providers')
    expect(Web3Provider).toBeDefined()
    expect(typeof Web3Provider).toBe('function')
  }, 30000)

  it('should render children within providers', async () => {
    const { Providers } = await import('../providers')

    render(
      <Providers>
        <div data-testid="child-content">Test Content</div>
      </Providers>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('should wrap content in WagmiProvider', async () => {
    const { Providers } = await import('../providers')

    render(
      <Providers>
        <div>Test</div>
      </Providers>
    )

    expect(screen.getByTestId('wagmi-provider')).toBeInTheDocument()
  })

  it('should wrap content in QueryClientProvider', async () => {
    const { Providers } = await import('../providers')

    render(
      <Providers>
        <div>Test</div>
      </Providers>
    )

    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument()
  })

  it('should wrap content in RainbowKitProvider', async () => {
    const { Providers } = await import('../providers')

    render(
      <Providers>
        <div>Test</div>
      </Providers>
    )

    expect(screen.getByTestId('rainbowkit-provider')).toBeInTheDocument()
  })

  it('should maintain correct provider nesting order', async () => {
    const { Providers } = await import('../providers')

    render(
      <Providers>
        <div data-testid="content">Content</div>
      </Providers>
    )

    // WagmiProvider should be outermost, then QueryClientProvider, then RainbowKitProvider
    const wagmiProvider = screen.getByTestId('wagmi-provider')
    const queryClientProvider = screen.getByTestId('query-client-provider')
    const rainbowkitProvider = screen.getByTestId('rainbowkit-provider')

    // Verify nesting: WagmiProvider > QueryClientProvider > RainbowKitProvider
    expect(wagmiProvider).toContainElement(queryClientProvider)
    expect(queryClientProvider).toContainElement(rainbowkitProvider)
    expect(rainbowkitProvider).toContainElement(screen.getByTestId('content'))
  })
})
