/**
 * ShareModal component tests
 * Feature: 028-share-modal-redesign
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@/shared/lib/test-utils/render'
import userEvent from '@testing-library/user-event'
import { ShareModal } from '../ShareModal'
import { TEST_INVOICES } from '@/shared/lib/test-utils'

// Mock next/dynamic to render QRTab synchronously as a stub
vi.mock('next/dynamic', () => ({
  default: () => {
    function QRTabStub() {
      return <div data-testid="qr-tab-stub" />
    }
    return QRTabStub
  },
}))

// Mock subcomponents that have their own tests
vi.mock('../TabSwitcher', () => ({
  TabSwitcher: ({
    activeTab,
    onTabChange,
  }: {
    activeTab: string
    onTabChange: (tab: string) => void
  }) => (
    <div data-testid="tab-switcher">
      <button onClick={() => onTabChange('link')}>Link</button>
      <button onClick={() => onTabChange('qr')}>QR</button>
      <span data-testid="active-tab">{activeTab}</span>
    </div>
  ),
}))

vi.mock('../InvoiceSummary', () => ({
  InvoiceSummary: ({ invoice }: { invoice: { invoiceId: string } }) => (
    <div data-testid="invoice-summary">{invoice.invoiceId}</div>
  ),
}))

vi.mock('../LinkTab', () => ({
  LinkTab: ({
    url,
    copied,
    onCopy,
    telegramUrl,
    twitterUrl,
    emailUrl,
    includeOg,
    onOgToggle,
  }: {
    url: string
    copied: boolean
    onCopy: () => void
    telegramUrl: string
    twitterUrl: string
    emailUrl: string
    includeOg: boolean
    onOgToggle: (v: boolean) => void
  }) => (
    <div data-testid="link-tab">
      <span data-testid="link-tab-url">{url}</span>
      <span data-testid="link-tab-copied">{String(copied)}</span>
      <span data-testid="link-tab-telegram">{telegramUrl}</span>
      <span data-testid="link-tab-twitter">{twitterUrl}</span>
      <span data-testid="link-tab-email">{emailUrl}</span>
      <span data-testid="link-tab-include-og">{String(includeOg)}</span>
      <button data-testid="link-tab-copy" onClick={onCopy}>
        Copy
      </button>
      <button data-testid="link-tab-og-toggle" onClick={() => onOgToggle(!includeOg)}>
        Toggle OG
      </button>
    </div>
  ),
}))

const TEST_URL = 'https://voidpay.xyz/pay#N4IgbghgTg9g'
const TEST_INVOICE = TEST_INVOICES.full()

function renderModal(overrides?: Partial<React.ComponentProps<typeof ShareModal>>) {
  const defaultProps = {
    url: TEST_URL,
    invoice: TEST_INVOICE,
    open: true,
    onOpenChange: vi.fn(),
    includeOg: false,
    onOgToggle: vi.fn(),
  }
  return render(<ShareModal {...defaultProps} {...overrides} />)
}

describe('ShareModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('dialog structure', () => {
    it('renders inside Radix Dialog (has role="dialog")', () => {
      renderModal()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render when open=false', () => {
      renderModal({ open: false })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('header content', () => {
    it('shows "Invoice Ready" title', () => {
      renderModal()
      expect(screen.getByText('Invoice Ready')).toBeInTheDocument()
    })

    it('shows "Share this link to get paid" subtitle', () => {
      renderModal()
      expect(screen.getByText('Share this link to get paid')).toBeInTheDocument()
    })

    it('has a close button provided by DialogContent', () => {
      renderModal()
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })
  })

  describe('body subcomponents', () => {
    it('renders InvoiceSummary with the invoice prop', () => {
      renderModal()
      expect(screen.getByTestId('invoice-summary')).toBeInTheDocument()
      expect(screen.getByTestId('invoice-summary')).toHaveTextContent(TEST_INVOICE.invoiceId)
    })

    it('renders TabSwitcher', () => {
      renderModal()
      expect(screen.getByTestId('tab-switcher')).toBeInTheDocument()
    })

    it('shows LinkTab by default (link tab active)', () => {
      renderModal()
      expect(screen.getByTestId('link-tab')).toBeInTheDocument()
      expect(screen.getByTestId('active-tab')).toHaveTextContent('link')
    })

    it('shows QRTab when qr tab is selected', async () => {
      const user = userEvent.setup()
      renderModal()
      await user.click(screen.getByRole('button', { name: 'QR' }))
      expect(screen.getByTestId('qr-tab-stub')).toBeInTheDocument()
      expect(screen.queryByTestId('link-tab')).not.toBeInTheDocument()
    })
  })

  describe('LinkTab props', () => {
    it('passes url to LinkTab', () => {
      renderModal()
      expect(screen.getByTestId('link-tab-url')).toHaveTextContent(TEST_URL)
    })

    it('passes emailUrl to LinkTab (computed from url)', () => {
      renderModal()
      const emailUrl = screen.getByTestId('link-tab-email').textContent ?? ''
      expect(emailUrl).toContain('mailto:')
      expect(emailUrl).toContain(encodeURIComponent(TEST_URL))
    })

    it('passes telegramUrl to LinkTab (computed from url)', () => {
      renderModal()
      const telegramUrl = screen.getByTestId('link-tab-telegram').textContent ?? ''
      expect(telegramUrl).toContain('t.me/share/url')
      expect(telegramUrl).toContain(encodeURIComponent(TEST_URL))
    })

    it('passes twitterUrl to LinkTab (computed from url)', () => {
      renderModal()
      const twitterUrl = screen.getByTestId('link-tab-twitter').textContent ?? ''
      expect(twitterUrl).toContain('twitter.com/intent/tweet')
      expect(twitterUrl).toContain(encodeURIComponent(TEST_URL))
    })

    it('passes includeOg=false to LinkTab by default', () => {
      renderModal({ includeOg: false })
      expect(screen.getByTestId('link-tab-include-og')).toHaveTextContent('false')
    })

    it('passes includeOg=true to LinkTab when set', () => {
      renderModal({ includeOg: true })
      expect(screen.getByTestId('link-tab-include-og')).toHaveTextContent('true')
    })

    it('calls onOgToggle when LinkTab triggers the toggle', async () => {
      const onOgToggle = vi.fn()
      const user = userEvent.setup()
      renderModal({ onOgToggle })
      await user.click(screen.getByTestId('link-tab-og-toggle'))
      expect(onOgToggle).toHaveBeenCalledWith(true)
    })
  })

  describe('no footer', () => {
    it('does not render an "Open Invoice" button', () => {
      renderModal()
      expect(screen.queryByText(/open invoice/i)).not.toBeInTheDocument()
    })
  })

  describe('copy functionality', () => {
    it('writes url to clipboard when copy is triggered', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', { clipboard: { writeText } })

      renderModal()
      await userEvent.click(screen.getByTestId('link-tab-copy'))

      await vi.waitFor(() => {
        expect(writeText).toHaveBeenCalledWith(TEST_URL)
      })

      vi.unstubAllGlobals()
    })

    it('sets copied=true after successful copy', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', { clipboard: { writeText } })

      renderModal()
      await userEvent.click(screen.getByTestId('link-tab-copy'))

      await vi.waitFor(() => {
        expect(screen.getByTestId('link-tab-copied')).toHaveTextContent('true')
      })

      vi.unstubAllGlobals()
    })

    it('silently ignores clipboard errors', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'))
      vi.stubGlobal('navigator', { clipboard: { writeText } })

      renderModal()
      await userEvent.click(screen.getByTestId('link-tab-copy'))

      await vi.waitFor(() => {
        expect(writeText).toHaveBeenCalledWith(TEST_URL)
      })

      vi.unstubAllGlobals()
    })
  })

  describe('close behaviour', () => {
    it('calls onOpenChange(false) when close button is clicked', async () => {
      const onOpenChange = vi.fn()
      const user = userEvent.setup()
      renderModal({ onOpenChange })

      await user.click(screen.getByRole('button', { name: /close/i }))
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
