import { render, screen } from '@/shared/lib/test-utils'
import { describe, it, expect } from 'vitest'
import { PollingStatus } from '../PollingStatus'
import type { PollingMode } from '@/features/payment'

describe('PollingStatus', () => {
  it('renders nothing for idle mode', () => {
    const { container } = render(<PollingStatus mode="idle" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders spinner and "Checking..." for manual mode', () => {
    const { container } = render(<PollingStatus mode="manual" />)
    expect(screen.getByText('Checking...')).toBeDefined()
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.className).toContain('animate-spin')
  })

  it('renders spinner and "Checking..." for auto-check mode', () => {
    const { container } = render(<PollingStatus mode="auto-check" />)
    expect(screen.getByText('Checking...')).toBeDefined()
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.className).toContain('animate-spin')
  })

  it('renders spinner and "Searching for your payment..." for aggressive mode', () => {
    const { container } = render(<PollingStatus mode="aggressive" />)
    expect(screen.getByText('Searching for your payment...')).toBeDefined()
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.className).toContain('animate-spin')
  })

  it('renders pulsing dot and "Watching for payment..." for watching mode', () => {
    const { container } = render(<PollingStatus mode="watching" />)
    expect(screen.getByText('Watching for payment...')).toBeDefined()
    const dot = container.querySelector('[data-testid="polling-dot"]')
    expect(dot).not.toBeNull()
    expect(dot!.className).toContain('animate-pulse')
  })

  it('does not render spinner for watching mode', () => {
    const { container } = render(<PollingStatus mode="watching" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeNull()
  })

  it('accepts optional className prop', () => {
    const { container } = render(<PollingStatus mode="manual" className="custom-class" />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('custom-class')
  })
})
