/**
 * Auto-Save Hook
 *
 * Provides debounced auto-save functionality for invoice drafts.
 * Automatically saves draft changes to the store after 500ms of inactivity.
 */

import { useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useCreatorStore } from '@/entities/creator/model/useCreatorStore'
import type { InvoiceDraft } from '@/entities/invoice/model/types'
import { AUTO_SAVE_DEBOUNCE_MS } from '@/shared/lib/debounce'

/**
 * Hook for auto-saving invoice drafts
 *
 * @returns Object with save function and pending state
 *
 * @example
 * function InvoiceEditor() {
 *   const { autoSave, isPending } = useAutoSave();
 *
 *   const handleFieldChange = (field: string, value: any) => {
 *     // Update local state immediately (optimistic UI)
 *     setLocalDraft({ ...localDraft, [field]: value });
 *     // Debounced save to store
 *     autoSave({ ...localDraft, [field]: value });
 *   };
 *
 *   return (
 *     <div>
 *       {isPending && <span>Saving...</span>}
 *       <input onChange={(e) => handleFieldChange('invoiceId', e.target.value)} />
 *     </div>
 *   );
 * }
 */
export function useAutoSave() {
  const updateDraft = useCreatorStore((s) => s.updateDraft)

  const debouncedSave = useDebouncedCallback(
    (draft: Partial<InvoiceDraft>) => {
      updateDraft(draft)
    },
    AUTO_SAVE_DEBOUNCE_MS,
    {
      trailing: true, // Save after user stops typing
      leading: false, // Don't save immediately on first change
    }
  )

  const autoSave = useCallback(
    (draft: Partial<InvoiceDraft>) => {
      debouncedSave(draft)
    },
    [debouncedSave]
  )

  return {
    /**
     * Auto-save function (debounced 500ms)
     */
    autoSave,

    /**
     * Whether a save is pending (waiting for debounce)
     */
    isPending: debouncedSave.isPending,

    /**
     * Cancel pending save
     */
    cancel: debouncedSave.cancel,

    /**
     * Flush pending save immediately
     */
    flush: debouncedSave.flush,
  }
}

/**
 * Hook for auto-saving with manual trigger
 *
 * Provides both debounced auto-save and immediate save functionality.
 *
 * @example
 * function InvoiceEditor() {
 *   const { autoSave, saveNow } = useAutoSaveWithManual();
 *
 *   const handleFieldChange = (field: string, value: any) => {
 *     autoSave({ [field]: value });
 *   };
 *
 *   const handleSubmit = () => {
 *     saveNow(); // Flush pending changes immediately
 *     generateInvoiceUrl();
 *   };
 * }
 */
export function useAutoSaveWithManual() {
  const { autoSave, isPending, flush } = useAutoSave()
  const updateDraft = useCreatorStore((s) => s.updateDraft)

  const saveNow = useCallback(
    (draft?: Partial<InvoiceDraft>) => {
      // Flush any pending debounced saves
      flush()

      // If draft provided, save it immediately
      if (draft) {
        updateDraft(draft)
      }
    },
    [flush, updateDraft]
  )

  return {
    autoSave,
    saveNow,
    isPending,
  }
}
