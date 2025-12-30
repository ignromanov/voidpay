import { toast as sonnerToast } from 'sonner'

/**
 * Void-themed toast wrappers with consistent behavior
 */
export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message, { duration: Infinity }),
  loading: (message: string) => sonnerToast.loading(message),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),

  /** Web3 transaction toast with loading → success/error states */
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => sonnerToast.promise(promise, messages),
}
