import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { UmamiScript } from '../UmamiScript'

// Expose Script props as data attributes — next/script renders nothing testable in happy-dom
vi.mock('next/script', () => ({
  default: (props: Record<string, string>) => (
    <script
      data-testid="umami-script"
      data-exclude-hash={props['data-exclude-hash']}
      data-exclude-search={props['data-exclude-search']}
    />
  ),
}))

describe('UmamiScript', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('emits data-exclude-hash and data-exclude-search in production', () => {
    vi.stubEnv('NODE_ENV', 'production')

    render(<UmamiScript />)

    const script = screen.getByTestId('umami-script')
    expect(script).toHaveAttribute('data-exclude-hash', 'true')
    expect(script).toHaveAttribute('data-exclude-search', 'true')
  })

  it('does not render outside production', () => {
    render(<UmamiScript />)
    expect(screen.queryByTestId('umami-script')).not.toBeInTheDocument()
  })
})
