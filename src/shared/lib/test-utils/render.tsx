/**
 * Custom render for tests with Web3 providers
 *
 * Использует shared QueryClient для производительности.
 * Провайдеры создаются один раз, кэш очищается между тестами.
 */

import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mockWagmiConfig } from './wagmi-mock'
import { testQueryClient, clearTestQueryClient } from './query-client'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Custom QueryClient (по умолчанию используется shared testQueryClient) */
  queryClient?: QueryClient
}

export function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  const { queryClient = testQueryClient, ...renderOptions } = options ?? {}

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <WagmiProvider config={mockWagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override render with our custom version
export { customRender as render }

// Render with pre-configured userEvent instance
export function renderWithUser(ui: ReactElement, options?: CustomRenderOptions) {
  return { user: userEvent.setup(), ...customRender(ui, options) }
}

// Re-export cleanup helper
export { clearTestQueryClient }
