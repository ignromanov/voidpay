import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast as sonnerToast } from 'sonner'
import { toast } from '../toast'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}))

describe('toast wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('toast.success', () => {
    it('should call sonner success with message', () => {
      toast.success('Operation successful')
      expect(sonnerToast.success).toHaveBeenCalledWith('Operation successful', undefined)
    })
  })

  describe('toast.error', () => {
    it('should call sonner error with message and infinite duration', () => {
      toast.error('Something went wrong')
      expect(sonnerToast.error).toHaveBeenCalledWith('Something went wrong', {
        duration: Infinity,
      })
    })

    it('should persist error toast until manually dismissed', () => {
      toast.error('Critical error')
      const callArgs = vi.mocked(sonnerToast.error).mock.calls[0]
      expect(callArgs?.[1]).toEqual({ duration: Infinity })
    })
  })

  describe('toast.loading', () => {
    it('should call sonner loading with message', () => {
      toast.loading('Processing...')
      expect(sonnerToast.loading).toHaveBeenCalledWith('Processing...', undefined)
    })
  })

  describe('toast.dismiss', () => {
    it('should call sonner dismiss without id', () => {
      toast.dismiss()
      expect(sonnerToast.dismiss).toHaveBeenCalledWith(undefined)
    })

    it('should call sonner dismiss with specific id', () => {
      toast.dismiss('toast-123')
      expect(sonnerToast.dismiss).toHaveBeenCalledWith('toast-123')
    })

    it('should accept numeric id', () => {
      toast.dismiss(42)
      expect(sonnerToast.dismiss).toHaveBeenCalledWith(42)
    })
  })

  describe('toast.promise', () => {
    it('should call sonner promise with promise and messages', async () => {
      const testPromise = Promise.resolve('result')
      const messages = {
        loading: 'Sending transaction...',
        success: 'Transaction confirmed!',
        error: 'Transaction failed',
      }

      toast.promise(testPromise, messages)

      expect(sonnerToast.promise).toHaveBeenCalledWith(testPromise, messages)
    })

    it('should support Web3 transaction flow', async () => {
      const txPromise = new Promise((resolve) => setTimeout(resolve, 100))
      const web3Messages = {
        loading: 'Waiting for wallet confirmation...',
        success: 'Payment sent successfully!',
        error: 'Payment failed',
      }

      toast.promise(txPromise, web3Messages)

      expect(sonnerToast.promise).toHaveBeenCalledWith(txPromise, web3Messages)
    })
  })
})

describe('toast exports', () => {
  it('should export all required methods', () => {
    expect(toast).toHaveProperty('success')
    expect(toast).toHaveProperty('error')
    expect(toast).toHaveProperty('loading')
    expect(toast).toHaveProperty('dismiss')
    expect(toast).toHaveProperty('promise')
  })

  it('should have correct function types', () => {
    expect(typeof toast.success).toBe('function')
    expect(typeof toast.error).toBe('function')
    expect(typeof toast.loading).toBe('function')
    expect(typeof toast.dismiss).toBe('function')
    expect(typeof toast.promise).toBe('function')
  })
})
