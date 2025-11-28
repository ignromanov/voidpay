import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mockWagmiConfig } from './wagmi-mock'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

export function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  const {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  } = options ?? {}

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
