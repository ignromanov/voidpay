import { toast as sonnerToast, ExternalToast } from 'sonner'

/**
 * Void-themed toast wrappers with consistent behavior
 */
export const toast = {
  success: (message: string, options?: ExternalToast) => sonnerToast.success(message, options),

  error: (message: string, options?: ExternalToast) =>
    sonnerToast.error(message, { duration: Infinity, ...options }),

  loading: (message: string, options?: ExternalToast) => sonnerToast.loading(message, options),

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),

  /** Web3 transaction toast with loading → success/error states */
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => sonnerToast.promise(promise, messages),
}
