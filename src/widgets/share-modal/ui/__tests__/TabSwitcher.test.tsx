import { render, renderWithUser, screen } from '@/shared/lib/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { TabSwitcher } from '../TabSwitcher'

describe('TabSwitcher', () => {
  it('renders Link and QR Code tabs', () => {
    render(<TabSwitcher activeTab="link" onTabChange={vi.fn()} />)

    expect(screen.getByRole('tab', { name: /link/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /qr code/i })).toBeInTheDocument()
  })

  it('marks the active tab as selected', () => {
    render(<TabSwitcher activeTab="link" onTabChange={vi.fn()} />)

    expect(screen.getByRole('tab', { name: /link/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /qr code/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('marks QR tab as selected when activeTab is qr', () => {
    render(<TabSwitcher activeTab="qr" onTabChange={vi.fn()} />)

    expect(screen.getByRole('tab', { name: /link/i })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: /qr code/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onTabChange when clicking a tab', async () => {
    const onTabChange = vi.fn()
    const { user } = renderWithUser(<TabSwitcher activeTab="link" onTabChange={onTabChange} />)

    await user.click(screen.getByRole('tab', { name: /qr code/i }))

    expect(onTabChange).toHaveBeenCalledWith('qr')
  })

  it('calls onTabChange with link when clicking link tab', async () => {
    const onTabChange = vi.fn()
    const { user } = renderWithUser(<TabSwitcher activeTab="qr" onTabChange={onTabChange} />)

    await user.click(screen.getByRole('tab', { name: /link/i }))

    expect(onTabChange).toHaveBeenCalledWith('link')
  })

  it('has tablist role on container', () => {
    render(<TabSwitcher activeTab="link" onTabChange={vi.fn()} />)

    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})
