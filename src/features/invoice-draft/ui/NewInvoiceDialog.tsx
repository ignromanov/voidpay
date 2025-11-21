/**
 * New Invoice Dialog
 *
 * Confirmation dialog shown when user tries to create a new invoice
 * while an active draft exists.
 *
 * Prevents accidental data loss by prompting user to save or discard.
 */

'use client'

import { useState } from 'react'
import { useCreatorStore } from '@/entities/creator/model/useCreatorStore'

interface NewInvoiceDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean

  /**
   * Callback when dialog is closed
   */
  onClose: () => void

  /**
   * Callback when user confirms creating new invoice
   */
  onConfirm: () => void
}

/**
 * New Invoice Confirmation Dialog
 *
 * @example
 * function CreatePage() {
 *   const [showDialog, setShowDialog] = useState(false);
 *   const activeDraft = useCreatorStore((s) => s.activeDraft);
 *   const createNewDraft = useCreatorStore((s) => s.createNewDraft);
 *
 *   const handleNewInvoice = () => {
 *     if (activeDraft) {
 *       setShowDialog(true);
 *     } else {
 *       createNewDraft();
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleNewInvoice}>New Invoice</button>
 *       <NewInvoiceDialog
 *         isOpen={showDialog}
 *         onClose={() => setShowDialog(false)}
 *         onConfirm={() => {
 *           createNewDraft();
 *           setShowDialog(false);
 *         }}
 *       />
 *     </>
 *   );
 * }
 */
export function NewInvoiceDialog({ isOpen, onClose, onConfirm }: NewInvoiceDialogProps) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const activeDraft = useCreatorStore((s) => s.activeDraft)
  const saveTemplate = useCreatorStore((s) => s.saveAsTemplate)
  const clearDraft = useCreatorStore((s) => s.clearDraft)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (saveAsTemplate && activeDraft) {
      // Save current draft as template before clearing
      saveTemplate()
    }

    clearDraft()
    onConfirm()
  }

  const handleDiscard = () => {
    clearDraft()
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Create New Invoice?
        </h2>

        <p className="mb-6 text-gray-600 dark:text-gray-300">
          You have an active draft. What would you like to do?
        </p>

        <div className="mb-6">
          <label className="flex cursor-pointer items-center space-x-2">
            <input
              type="checkbox"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Save current draft as template
            </span>
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={handleDiscard}
            className="flex-1 rounded-md border border-red-300 px-4 py-2 text-red-700 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Discard Draft
          </button>

          <button
            onClick={handleConfirm}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            {saveAsTemplate ? 'Save & Continue' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
