import { useCallback, useRef, useEffect } from 'react'
import { useCreatorStore } from '@/entities/creator'
import type { PartialInvoice } from '@/shared/lib/invoice-types'

/**
 * Debounced Draft Update Hook
 *
 * Provides a debounced version of updateDraft to prevent excessive localStorage writes.
 * Uses 500ms delay as specified in US6 - Auto-Save Draft.
 *
 * @returns Debounced updateDraft function
 *
 * @example
 * ```tsx
 * const updateDraft = useDebouncedDraftUpdate()
 * // Multiple rapid calls will be batched
 * updateDraft({ invoiceId: 'INV-001' })
 * updateDraft({ currency: 'USDC' }) // Only this final value writes after 500ms
 * ```
 */
export function useDebouncedDraftUpdate() {
  const storeUpdateDraft = useCreatorStore((s) => s.updateDraft)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingUpdatesRef = useRef<PartialInvoice>({})

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        // Flush pending updates on unmount
        if (Object.keys(pendingUpdatesRef.current).length > 0) {
          storeUpdateDraft(pendingUpdatesRef.current)
        }
      }
    }
  }, [storeUpdateDraft])

  const debouncedUpdate = useCallback(
    (updates: PartialInvoice) => {
      // Merge updates
      pendingUpdatesRef.current = {
        ...pendingUpdatesRef.current,
        ...updates,
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        storeUpdateDraft(pendingUpdatesRef.current)
        pendingUpdatesRef.current = {}
        timeoutRef.current = null
      }, 500)
    },
    [storeUpdateDraft]
  )

  return debouncedUpdate
}
