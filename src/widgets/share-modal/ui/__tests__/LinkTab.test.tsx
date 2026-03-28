/**
 * LinkTab component tests
 * Feature: 028-share-modal-redesign
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test-utils/render'
import userEvent from '@testing-library/user-event'
import { LinkTab } from '../LinkTab'

const DEFAULT_PROPS = {
  url: 'https://voidpay.xyz/pay?og=INV-001_1250_USDC_arb_Acme#N4IgbghgTg9g',
  copied: false,
  onCopy: vi.fn(),
  telegramUrl: 'https://t.me/share/url?url=https%3A%2F%2Fvoidpay.xyz',
  twitterUrl: 'https://twitter.com/intent/tweet?url=https%3A%2F%2Fvoidpay.xyz',
  emailUrl: 'mailto:?subject=Invoice&body=https%3A%2F%2Fvoidpay.xyz',
  includeOg: true,
  onOgToggle: vi.fn(),
}

function renderWithUser(props = DEFAULT_PROPS) {
  return {
    user: userEvent.setup(),
    ...render(<LinkTab {...props} />),
  }
}

describe('LinkTab', () => {
  it('renders color-coded URL parts', () => {
    renderWithUser()
    // Domain in violet
    expect(screen.getByText('voidpay.xyz')).toBeInTheDocument()
    // Path in muted violet
    expect(screen.getByText('/pay')).toBeInTheDocument()
    // OG params in amber (includeOg=true)
    expect(screen.getByText('?og=INV-001_1250_USDC_arb_Acme')).toBeInTheDocument()
    // Hash in zinc
    expect(screen.getByText('#N4IgbghgTg9g')).toBeInTheDocument()
  })

  it('does NOT render OG params when includeOg is false', () => {
    renderWithUser({ ...DEFAULT_PROPS, includeOg: false })
    expect(screen.queryByText('?og=INV-001_1250_USDC_arb_Acme')).not.toBeInTheDocument()
  })

  it('renders void-style Copy Link button', () => {
    renderWithUser()
    const btn = screen.getByRole('button', { name: /copy link/i })
    expect(btn).toBeInTheDocument()
  })

  it('does NOT render inline copy button next to URL', () => {
    renderWithUser()
    // Only one button total — the primary CTA
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
  })

  it('renders Telegram, Twitter, and Email share buttons', () => {
    renderWithUser()
    expect(screen.getByRole('link', { name: /telegram/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /email/i })).toBeInTheDocument()
  })

  it('email button has mailto: href', () => {
    renderWithUser()
    const emailLink = screen.getByRole('link', { name: /email/i })
    expect(emailLink).toHaveAttribute('href', DEFAULT_PROPS.emailUrl)
    expect(emailLink.getAttribute('href')).toMatch(/^mailto:/)
  })

  it('renders OG toggle with amber styling when checked', () => {
    renderWithUser()
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
    // The visual indicator div should have amber classes — find the label container
    expect(screen.getByText('Link preview card')).toBeInTheDocument()
  })

  it('calls onOgToggle when checkbox changes', async () => {
    const onOgToggle = vi.fn()
    const { user } = renderWithUser({ ...DEFAULT_PROPS, onOgToggle })
    const label = screen.getByText('Link preview card').closest('label')!
    await user.click(label)
    expect(onOgToggle).toHaveBeenCalledWith(false)
  })

  it('renders positive privacy hint', () => {
    renderWithUser()
    expect(screen.getByText(/privacy by design/i)).toBeInTheDocument()
    expect(screen.getByText(/no servers/i)).toBeInTheDocument()
    expect(screen.getByText(/no tracking/i)).toBeInTheDocument()
  })

  it('shows Copied state with emerald styling when copied=true', () => {
    renderWithUser({ ...DEFAULT_PROPS, copied: true })
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /copy link/i })).not.toBeInTheDocument()
  })

  it('calls onCopy when CTA clicked', async () => {
    const onCopy = vi.fn()
    const { user } = renderWithUser({ ...DEFAULT_PROPS, onCopy })
    await user.click(screen.getByRole('button', { name: /copy link/i }))
    expect(onCopy).toHaveBeenCalledTimes(1)
  })
})
