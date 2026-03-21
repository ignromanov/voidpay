import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock error screen components
vi.mock('@/shared/ui/decode-error-screen', () => ({
  DecodeErrorScreen: ({ errorType }: { errorType: string }) => (
    <div data-testid="decode-error-screen" data-error-type={errorType}>
      DecodeErrorScreen: {errorType}
    </div>
  ),
}))

vi.mock('@/shared/ui/app-error-screen', () => ({
  AppErrorScreen: ({ error }: { error?: Error }) => (
    <div data-testid="app-error-screen">
      AppErrorScreen: {error?.message}
    </div>
  ),
}))

import PayError from '../error'

describe('PayError — error classification', () => {
  const reset = vi.fn()

  describe('codec errors → DecodeErrorScreen', () => {
    it('shows DecodeErrorScreen for "decode" keyword', () => {
      const error = Object.assign(new Error('Failed to decode invoice'), { digest: undefined })
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('decode-error-screen')).toBeInTheDocument()
    })

    it('shows DecodeErrorScreen for "binary" keyword', () => {
      const error = Object.assign(new Error('Invalid binary data'), { digest: undefined })
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('decode-error-screen')).toBeInTheDocument()
    })

    it('shows DecodeErrorScreen for "base64" keyword', () => {
      const error = Object.assign(new Error('base64 decoding failed'), { digest: undefined })
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('decode-error-screen')).toBeInTheDocument()
    })

    it('shows DecodeErrorScreen for "hash fragment" keyword', () => {
      const error = Object.assign(new Error('Empty hash fragment'), { digest: undefined })
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('decode-error-screen')).toBeInTheDocument()
    })
  })

  describe('sub-classification of codec errors', () => {
    it('classifies "empty" as EMPTY_HASH', () => {
      const error = Object.assign(new Error('Empty hash fragment, no decode possible'), { digest: undefined })
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('decode-error-screen')).toHaveAttribute(
        'data-error-type',
        'EMPTY_HASH'
      )
    })

    it('classifies "unsupported version" as UNSUPPORTED_VERSION', () => {
      const error = Object.assign(new Error('Unsupported version in decode'), { digest: undefined })
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('decode-error-screen')).toHaveAttribute(
        'data-error-type',
        'UNSUPPORTED_VERSION'
      )
    })

    it('classifies "invalid format" as INVALID_FORMAT', () => {
      const error = Object.assign(new Error('Invalid format in binary decode'), { digest: undefined })
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('decode-error-screen')).toHaveAttribute(
        'data-error-type',
        'INVALID_FORMAT'
      )
    })

    it('defaults to CORRUPTED_DATA for other codec errors', () => {
      const error = Object.assign(new Error('Failed to decompress data'), { digest: undefined })
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('decode-error-screen')).toHaveAttribute(
        'data-error-type',
        'CORRUPTED_DATA'
      )
    })
  })

  describe('app errors → AppErrorScreen', () => {
    it('shows AppErrorScreen for WagmiProviderNotFoundError', () => {
      const error = Object.assign(
        new Error('`useConfig` must be used within `WagmiProvider`'),
        { digest: 'abc123' }
      )
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('app-error-screen')).toBeInTheDocument()
    })

    it('shows AppErrorScreen for generic runtime error', () => {
      const error = Object.assign(
        new Error('Cannot read properties of undefined'),
        { digest: undefined }
      )
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('app-error-screen')).toBeInTheDocument()
    })

    it('shows AppErrorScreen for unknown error messages', () => {
      const error = Object.assign(
        new Error('Something completely unexpected'),
        { digest: undefined }
      )
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('app-error-screen')).toBeInTheDocument()
    })

    it('shows AppErrorScreen for hydration errors', () => {
      const error = Object.assign(
        new Error('Hydration failed because the initial UI does not match'),
        { digest: undefined }
      )
      render(<PayError error={error} reset={reset} />)
      expect(screen.getByTestId('app-error-screen')).toBeInTheDocument()
    })
  })
})
