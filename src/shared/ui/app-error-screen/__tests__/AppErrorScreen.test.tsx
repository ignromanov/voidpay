import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AppErrorScreen } from '../AppErrorScreen'

// Mock clipboard API
const writeTextMock = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  writeTextMock.mockClear()
  // happy-dom provides navigator.clipboard — spy on it
  if (navigator.clipboard) {
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeTextMock)
  } else {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })
  }
})

describe('AppErrorScreen', () => {
  describe('default content', () => {
    it('renders default title', () => {
      render(<AppErrorScreen />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders default description', () => {
      render(<AppErrorScreen />)
      expect(
        screen.getByText(/unexpected error.*bug on our side/i)
      ).toBeInTheDocument()
    })

    it('renders VoidPay branding', () => {
      render(<AppErrorScreen />)
      expect(screen.getByText(/voidpay/i)).toBeInTheDocument()
    })
  })

  describe('custom content', () => {
    it('renders custom title', () => {
      render(<AppErrorScreen title="Payment Failed" />)
      expect(screen.getByText('Payment Failed')).toBeInTheDocument()
    })

    it('renders custom description', () => {
      render(<AppErrorScreen description="Custom error message" />)
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })
  })

  describe('error digest', () => {
    it('shows digest when provided', () => {
      render(<AppErrorScreen digest="abc123" />)
      expect(screen.getByText(/Error ID: abc123/)).toBeInTheDocument()
    })

    it('hides digest section when not provided', () => {
      render(<AppErrorScreen />)
      expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument()
    })
  })

  describe('action buttons', () => {
    it('calls onReset when "Try again" is clicked', async () => {
      const user = userEvent.setup()
      const onReset = vi.fn()

      render(<AppErrorScreen onReset={onReset} />)
      await user.click(screen.getByRole('button', { name: /try again/i }))
      expect(onReset).toHaveBeenCalledTimes(1)
    })

    it('hides "Try again" when onReset is not provided', () => {
      render(<AppErrorScreen />)
      expect(
        screen.queryByRole('button', { name: /try again/i })
      ).not.toBeInTheDocument()
    })

    it('calls onReturnHome when "Return home" is clicked', async () => {
      const user = userEvent.setup()
      const onReturnHome = vi.fn()

      render(<AppErrorScreen onReturnHome={onReturnHome} />)
      await user.click(screen.getByRole('button', { name: /return home/i }))
      expect(onReturnHome).toHaveBeenCalledTimes(1)
    })

    it('hides "Return home" when onReturnHome is not provided', () => {
      render(<AppErrorScreen />)
      expect(
        screen.queryByRole('button', { name: /return home/i })
      ).not.toBeInTheDocument()
    })

    it('renders "Report a bug" link with correct href', () => {
      render(<AppErrorScreen />)
      const link = screen.getByRole('link', { name: /report a bug/i })
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/ignromanov/voidpay/issues/new'
      )
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  describe('copy error details', () => {
    it('copies error details to clipboard', async () => {
      const user = userEvent.setup()
      const error = new Error('Test error message')
      error.name = 'TestError'

      render(<AppErrorScreen error={error} digest="xyz789" />)
      await user.click(screen.getByRole('button', { name: /copy details/i }))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Error ID: xyz789')
      )
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Message: Test error message')
      )
    })

    it('shows "Copied!" feedback after copying', async () => {
      const user = userEvent.setup()
      render(<AppErrorScreen error={new Error('test')} />)

      await user.click(screen.getByRole('button', { name: /copy details/i }))
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="alert"', () => {
      render(<AppErrorScreen />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has correct test id', () => {
      render(<AppErrorScreen />)
      expect(screen.getByTestId('app-error-screen')).toBeInTheDocument()
    })

    it('has backdrop-blur glassmorphism', () => {
      render(<AppErrorScreen />)
      const container = screen.getByTestId('app-error-screen')
      expect(container).toHaveClass('backdrop-blur')
    })

    it('has aria-live="assertive"', () => {
      render(<AppErrorScreen />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })

    it('icon is decorative (aria-hidden)', () => {
      const { container } = render(<AppErrorScreen />)
      const iconWrapper = container.querySelector('[aria-hidden="true"]')
      expect(iconWrapper).toBeInTheDocument()
    })
  })
})
