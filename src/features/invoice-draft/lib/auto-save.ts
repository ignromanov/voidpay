/**
 * Auto-Save Hook
 *
 * Provides debounced auto-save functionality for invoice drafts.
 * Automatically saves draft changes to the store after 500ms of inactivity.
 */

import { useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useCreatorStore } from '@/entities/creator'
import type { PartialInvoice } from '@/entities/invoice'
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
 *   const handleFieldChange = (field: keyof Invoice, value: unknown) => {
 *     // Update local state immediately (optimistic UI)
 *     setLocalDraft({ ...localDraft, [field]: value });
 *     // Debounced save to store
 *     autoSave({ [field]: value });
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
    (data: PartialInvoice) => {
      updateDraft(data)
    },
    AUTO_SAVE_DEBOUNCE_MS,
    {
      trailing: true, // Save after user stops typing
      leading: false, // Don't save immediately on first change
    }
  )

  const autoSave = useCallback(
    (data: PartialInvoice) => {
      debouncedSave(data)
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
 *   const handleFieldChange = (field: keyof Invoice, value: unknown) => {
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
    (data?: PartialInvoice) => {
      // Flush any pending debounced saves
      flush()

      // If data provided, save it immediately
      if (data) {
        updateDraft(data)
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
