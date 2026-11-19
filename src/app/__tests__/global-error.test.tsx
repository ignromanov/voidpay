import { describe, it, expect, vi } from 'vitest'
import { renderWithUser, screen } from '@/shared/lib/test-utils'
import GlobalError from '../global-error'

describe('GlobalError', () => {
  it('renders critical error heading, digest, and calls reset on Try again click', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const reset = vi.fn()
    const error = Object.assign(new Error('Root layout crash'), { digest: 'ERR-999' })

    const { user } = renderWithUser(<GlobalError error={error} reset={reset} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Critical Error' })).toBeInTheDocument()
    expect(screen.getByText('Error ID: ERR-999')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/')

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledOnce()

    consoleSpy.mockRestore()
  })
})
