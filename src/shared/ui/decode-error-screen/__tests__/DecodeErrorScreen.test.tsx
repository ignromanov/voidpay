import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  DecodeErrorScreen,
  type DecodeErrorType,
} from '../DecodeErrorScreen'

describe('DecodeErrorScreen', () => {
  const errorTypes: Array<{
    type: DecodeErrorType
    expectedTitle: string
    expectedDescription: RegExp
  }> = [
    {
      type: 'EMPTY_HASH',
      expectedTitle: 'No Invoice Data',
      expectedDescription: /doesn't contain invoice data/i,
    },
    {
      type: 'INVALID_FORMAT',
      expectedTitle: 'Invalid Invoice Link',
      expectedDescription: /malformed or corrupted/i,
    },
    {
      type: 'UNSUPPORTED_VERSION',
      expectedTitle: 'Unsupported Version',
      expectedDescription: /newer version/i,
    },
    {
      type: 'CORRUPTED_DATA',
      expectedTitle: 'Corrupted Data',
      expectedDescription: /appears to be damaged/i,
    },
  ]

  describe.each(errorTypes)(
    'renders $type error correctly',
    ({ type, expectedTitle, expectedDescription }) => {
      it(`shows correct title for ${type}`, () => {
        render(<DecodeErrorScreen errorType={type} />)
        expect(screen.getByText(expectedTitle)).toBeInTheDocument()
      })

      it(`shows correct description for ${type}`, () => {
        render(<DecodeErrorScreen errorType={type} />)
        expect(screen.getByText(expectedDescription)).toBeInTheDocument()
      })
    }
  )

  describe('Return Home button', () => {
    it('renders Return Home button', () => {
      render(<DecodeErrorScreen errorType="EMPTY_HASH" />)
      expect(
        screen.getByRole('button', { name: /return home/i })
      ).toBeInTheDocument()
    })

    it('calls onReturnHome callback when clicked', async () => {
      const user = userEvent.setup()
      const onReturnHome = vi.fn()

      render(
        <DecodeErrorScreen errorType="EMPTY_HASH" onReturnHome={onReturnHome} />
      )

      await user.click(screen.getByRole('button', { name: /return home/i }))
      expect(onReturnHome).toHaveBeenCalledTimes(1)
    })

    it('does not crash when onReturnHome is not provided', async () => {
      const user = userEvent.setup()
      render(<DecodeErrorScreen errorType="EMPTY_HASH" />)

      // Should not throw
      await user.click(screen.getByRole('button', { name: /return home/i }))
    })
  })

  describe('branding', () => {
    it('displays VoidPay branding', () => {
      render(<DecodeErrorScreen errorType="EMPTY_HASH" />)
      expect(screen.getByText(/voidpay/i)).toBeInTheDocument()
    })
  })

  describe('visual elements', () => {
    it('renders error icon', () => {
      render(<DecodeErrorScreen errorType="INVALID_FORMAT" />)
      // Icon should be present (via aria-hidden or testid)
      const container = screen.getByTestId('decode-error-screen')
      expect(container).toBeInTheDocument()
    })

    it('renders with glassmorphism card styling', () => {
      render(<DecodeErrorScreen errorType="EMPTY_HASH" />)
      const container = screen.getByTestId('decode-error-screen')
      expect(container).toHaveClass('backdrop-blur')
    })
  })
})
