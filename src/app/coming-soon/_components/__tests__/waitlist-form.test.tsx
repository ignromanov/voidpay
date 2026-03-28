/**
 * WaitlistForm component tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@/shared/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { WaitlistForm } from '../waitlist-form'

describe('WaitlistForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial rendering', () => {
    it('renders the email input', () => {
      render(<WaitlistForm />)
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    })

    it('renders the submit button', () => {
      render(<WaitlistForm />)
      expect(screen.getByRole('button', { name: /get early access/i })).toBeInTheDocument()
    })

    it('renders the no-spam disclaimer', () => {
      render(<WaitlistForm />)
      expect(screen.getByText(/no spam, ever/i)).toBeInTheDocument()
    })

    it('submit button is disabled when email is empty', () => {
      render(<WaitlistForm />)
      expect(screen.getByRole('button', { name: /get early access/i })).toBeDisabled()
    })
  })

  describe('form interaction', () => {
    it('enables the submit button when email is typed', async () => {
      const user = userEvent.setup()
      render(<WaitlistForm />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')

      expect(screen.getByRole('button', { name: /get early access/i })).not.toBeDisabled()
    })

    it('keeps submit button disabled when only whitespace is typed', async () => {
      const user = userEvent.setup()
      render(<WaitlistForm />)

      await user.type(screen.getByLabelText('Email address'), '   ')

      expect(screen.getByRole('button', { name: /get early access/i })).toBeDisabled()
    })
  })

  describe('form submission — FORMSPREE_ID not configured', () => {
    it('shows error when FORMSPREE_ID is not set', async () => {
      const user = userEvent.setup()
      render(<WaitlistForm />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /get early access/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/waitlist is not configured/i),
        ).toBeInTheDocument()
      })
    })

    it('does not call fetch when FORMSPREE_ID is not set', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const user = userEvent.setup()
      render(<WaitlistForm />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /get early access/i }))

      await waitFor(() => {
        expect(screen.getByText(/waitlist is not configured/i)).toBeInTheDocument()
      })

      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('form submission — fetch behaviour via spy', () => {
    /**
     * These tests patch FORMSPREE_ID by re-assigning process.env before module load.
     * Since the const is captured at module level, we use vi.resetModules() with
     * dynamic import to get a fresh module instance with the env var set.
     */

    beforeEach(() => {
      vi.resetModules()
    })

    it('shows loading state (button text changes) during pending fetch', async () => {
      vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ID', 'test-form-id')

      const { WaitlistForm: FreshForm } = await import('../waitlist-form')

      let resolveResponse!: (v: Response) => void
      const pendingFetch = new Promise<Response>((res) => { resolveResponse = res })
      vi.spyOn(global, 'fetch').mockReturnValueOnce(pendingFetch)

      const user = userEvent.setup()
      render(<FreshForm />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /get early access/i }))

      // While fetch is pending the button label changes
      await waitFor(() => {
        expect(screen.getByRole('button').textContent).toContain('Joining')
      })
      expect(screen.getByRole('button')).toBeDisabled()

      // Cleanup: resolve the fetch so no pending promises leak
      resolveResponse({ ok: true } as Response)
      vi.unstubAllEnvs()
    })

    it('shows success state after successful submission', async () => {
      vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ID', 'test-form-id')

      const { WaitlistForm: FreshForm } = await import('../waitlist-form')
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true } as Response)

      const user = userEvent.setup()
      render(<FreshForm />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /get early access/i }))

      await waitFor(() => {
        expect(screen.getByText(/you're on the list/i)).toBeInTheDocument()
      })

      vi.unstubAllEnvs()
    })

    it('shows server error message on non-ok response', async () => {
      vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ID', 'test-form-id')

      const { WaitlistForm: FreshForm } = await import('../waitlist-form')
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already subscribed' }),
      } as Response)

      const user = userEvent.setup()
      render(<FreshForm />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /get early access/i }))

      await waitFor(() => {
        expect(screen.getByText(/email already subscribed/i)).toBeInTheDocument()
      })

      vi.unstubAllEnvs()
    })

    it('shows fallback error when server response has no error field', async () => {
      vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ID', 'test-form-id')

      const { WaitlistForm: FreshForm } = await import('../waitlist-form')
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)

      const user = userEvent.setup()
      render(<FreshForm />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /get early access/i }))

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      })

      vi.unstubAllEnvs()
    })

    it('shows network error when fetch throws', async () => {
      vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ID', 'test-form-id')

      const { WaitlistForm: FreshForm } = await import('../waitlist-form')
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network failure'))

      const user = userEvent.setup()
      render(<FreshForm />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /get early access/i }))

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      vi.unstubAllEnvs()
    })

    it('clears email after success (success UI replaces form)', async () => {
      vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ID', 'test-form-id')

      const { WaitlistForm: FreshForm } = await import('../waitlist-form')
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true } as Response)

      const user = userEvent.setup()
      render(<FreshForm />)

      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /get early access/i }))

      await waitFor(() => {
        expect(screen.getByText(/you're on the list/i)).toBeInTheDocument()
      })

      // Form replaced by success UI — email input gone
      expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument()

      vi.unstubAllEnvs()
    })
  })
})
