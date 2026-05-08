import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { toast as sonnerToast } from 'sonner'
import { usePaymentToast } from '../use-payment-toast'

type UsePaymentToastParams = Parameters<typeof usePaymentToast>[0]

// sonner is aliased to mocks/sonner.tsx in vitest.config.ts
// toast.loading / toast.success / toast.error / toast.dismiss are vi.fn()

function setMatchMedia(matchesMobile: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: matchesMobile ? query === '(max-width: 767px)' : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

const BASE_PARAMS: Omit<UsePaymentToastParams, 'step'> = {
  idleSubState: 'ready',
  currency: 'USDC',
  subtotal: '1000000',
  decimals: 6,
  networkId: 1,
  error: null,
}

describe('usePaymentToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('desktop (>= 768px)', () => {
    beforeEach(() => setMatchMedia(false))

    it('calls sonnerToast.loading when an active step is present', () => {
      const { rerender } = renderHook(
        (props: UsePaymentToastParams) => usePaymentToast(props),
        { initialProps: { ...BASE_PARAMS, step: 'idle' } },
      )

      rerender({ ...BASE_PARAMS, step: 'sending' })

      expect(sonnerToast.loading).toHaveBeenCalled()
    })

    it('calls sonnerToast.success on success step', () => {
      const { rerender } = renderHook(
        (props: UsePaymentToastParams) => usePaymentToast(props),
        { initialProps: { ...BASE_PARAMS, step: 'idle' } },
      )

      rerender({ ...BASE_PARAMS, step: 'sending' })
      rerender({ ...BASE_PARAMS, step: 'success' })

      expect(sonnerToast.success).toHaveBeenCalled()
    })

    it('calls sonnerToast.error on payment failure', () => {
      const { rerender } = renderHook(
        (props: UsePaymentToastParams) => usePaymentToast(props),
        { initialProps: { ...BASE_PARAMS, step: 'idle' } },
      )

      rerender({ ...BASE_PARAMS, step: 'sending' })
      rerender({
        ...BASE_PARAMS,
        step: 'idle',
        error: { message: 'User rejected' },
      })

      expect(sonnerToast.error).toHaveBeenCalled()
    })
  })

  describe('mobile (< 768px)', () => {
    beforeEach(() => setMatchMedia(true))

    it('does NOT call sonnerToast.loading during step transitions', () => {
      const { rerender } = renderHook(
        (props: UsePaymentToastParams) => usePaymentToast(props),
        { initialProps: { ...BASE_PARAMS, step: 'idle' } },
      )

      rerender({ ...BASE_PARAMS, step: 'sending' })
      rerender({ ...BASE_PARAMS, step: 'confirming' })

      expect(sonnerToast.loading).not.toHaveBeenCalled()
    })

    it('still calls sonnerToast.success on success step', () => {
      const { rerender } = renderHook(
        (props: UsePaymentToastParams) => usePaymentToast(props),
        { initialProps: { ...BASE_PARAMS, step: 'idle' } },
      )

      rerender({ ...BASE_PARAMS, step: 'sending' })
      rerender({ ...BASE_PARAMS, step: 'success' })

      expect(sonnerToast.success).toHaveBeenCalled()
      expect(sonnerToast.loading).not.toHaveBeenCalled()
    })

    it('still calls sonnerToast.error on payment failure', () => {
      const { rerender } = renderHook(
        (props: UsePaymentToastParams) => usePaymentToast(props),
        { initialProps: { ...BASE_PARAMS, step: 'idle' } },
      )

      rerender({ ...BASE_PARAMS, step: 'sending' })
      rerender({
        ...BASE_PARAMS,
        step: 'idle',
        error: { message: 'User rejected' },
      })

      expect(sonnerToast.error).toHaveBeenCalled()
      expect(sonnerToast.loading).not.toHaveBeenCalled()
    })

    it('calls sonnerToast.dismiss on user cancel', () => {
      const { rerender } = renderHook(
        (props: UsePaymentToastParams) => usePaymentToast(props),
        { initialProps: { ...BASE_PARAMS, step: 'idle' } },
      )

      rerender({ ...BASE_PARAMS, step: 'sending' })
      rerender({ ...BASE_PARAMS, step: 'idle', error: null })

      expect(sonnerToast.dismiss).toHaveBeenCalled()
    })
  })

  describe('connecting/switching steps on mobile', () => {
    beforeEach(() => setMatchMedia(true))

    it('does NOT call sonnerToast.loading for connecting step', () => {
      const { rerender } = renderHook(
        (props: UsePaymentToastParams) => usePaymentToast(props),
        {
          initialProps: {
            ...BASE_PARAMS,
            idleSubState: 'disconnected',
            step: 'idle',
          },
        },
      )

      rerender({
        ...BASE_PARAMS,
        idleSubState: 'disconnected',
        step: 'connecting',
      })

      expect(sonnerToast.loading).not.toHaveBeenCalled()
    })
  })
})
