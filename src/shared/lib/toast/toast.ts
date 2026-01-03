import { toast as sonnerToast, ExternalToast } from 'sonner'

/**
 * Promise messages type with support for dynamic error messages
 */
interface PromiseMessages<T> {
  loading: string
  success: string | ((data: T) => string)
  error: string | ((error: Error) => string)
}

/**
 * Void-themed toast wrappers with consistent behavior
 */
export const toast = {
  success: (message: string, options?: ExternalToast) => sonnerToast.success(message, options),

  error: (message: string, options?: ExternalToast) =>
    sonnerToast.error(message, { duration: Infinity, ...options }),

  loading: (message: string, options?: ExternalToast) => sonnerToast.loading(message, options),

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),

  /**
   * Web3 transaction toast with loading → success/error states
   *
   * Supports dynamic error messages to show actual failure reason:
   * @example
   * toast.promise(txPromise, {
   *   loading: 'Sending payment...',
   *   success: 'Payment sent!',
   *   error: (err) => `Payment failed: ${err.message}`,
   * })
   */
  promise: <T>(promise: Promise<T>, messages: PromiseMessages<T>) =>
    sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      // Allow dynamic error messages that include the actual error
      error:
        typeof messages.error === 'function'
          ? messages.error
          : (err: Error) => `${messages.error}: ${err.message}`,
    }),
}
