import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { ErrorBanner } from '../ui/ErrorBanner'

describe('ErrorBanner', () => {
  it('renders error message when provided', () => {
    render(<ErrorBanner error="Transaction failed" onDismiss={() => {}} />)
    expect(screen.getByText('Transaction failed')).toBeDefined()
    expect(screen.getByText('Error')).toBeDefined()
  })

  it('renders warning icon', () => {
    const { container } = render(
      <ErrorBanner error="Something went wrong" onDismiss={() => {}} />
    )
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('fires onDismiss callback on X button click', async () => {
    const onDismiss = vi.fn()
    render(<ErrorBanner error="Test error" onDismiss={onDismiss} />)

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    await userEvent.click(dismissButton)

    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('renders nothing when error is null', () => {
    const { container } = render(
      <ErrorBanner error={null} onDismiss={() => {}} />
    )
    // AnimatePresence with no children renders empty
    expect(container.textContent).toBe('')
  })

  it('renders nothing when error is undefined', () => {
    const { container } = render(
      <ErrorBanner error={undefined} onDismiss={() => {}} />
    )
    expect(container.textContent).toBe('')
  })

  it('has role="alert" for accessibility', () => {
    render(<ErrorBanner error="Network error" onDismiss={() => {}} />)
    expect(screen.getByRole('alert')).toBeDefined()
  })
})
