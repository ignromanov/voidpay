'use client'

import { useEffect, useState } from 'react'
import { useCreatorStore } from '@/entities/creator/model/useCreatorStore'
import { useAutoSave } from '@/features/invoice-draft/lib/auto-save'
import { NewInvoiceDialog } from '@/features/invoice-draft/ui/NewInvoiceDialog'
import { generateAndTrackInvoice } from '@/entities/invoice/lib/invoice-helpers'

export default function CreateInvoicePage() {
  const activeDraft = useCreatorStore((s) => s.activeDraft)
  const createNewDraft = useCreatorStore((s) => s.createNewDraft)
  const clearDraft = useCreatorStore((s) => s.clearDraft)

  const { autoSave, isPending } = useAutoSave()

  const [showNewDialog, setShowNewDialog] = useState(false)
  const [localInvoiceId, setLocalInvoiceId] = useState('')
  const [localRecipientName, setLocalRecipientName] = useState('')

  // Restore draft on page load
  useEffect(() => {
    if (activeDraft) {
      setLocalInvoiceId(activeDraft.invoiceId)
      setLocalRecipientName(activeDraft.recipient.name)
    }
  }, [activeDraft])

  const handleNewInvoice = () => {
    if (activeDraft) {
      setShowNewDialog(true)
    } else {
      createNewDraft()
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    // Update local state immediately (optimistic UI)
    if (field === 'invoiceId') {
      setLocalInvoiceId(value)
    } else if (field === 'recipientName') {
      setLocalRecipientName(value)
    }

    // Debounced save to store
    if (field === 'invoiceId') {
      autoSave({ invoiceId: value })
    } else if (field === 'recipientName') {
      autoSave({ recipient: { name: value } })
    }
  }

  const handleGenerateInvoice = async () => {
    if (!activeDraft) {
      alert('Please create a draft first')
      return
    }

    try {
      const url = await generateAndTrackInvoice(activeDraft)
      alert(`Invoice generated! URL: ${url}\n\nCheck the History page to see the entry.`)
      clearDraft()
    } catch (error) {
      console.error('Failed to generate invoice:', error)
      alert('Failed to generate invoice')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-electric-violet mb-8 text-3xl font-bold">Create Invoice</h1>

      <div className="w-full max-w-2xl space-y-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {activeDraft && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Draft ID: {activeDraft.draftId.slice(0, 8)}...
              </span>
            )}
            {isPending() && (
              <span className="text-sm text-blue-600 dark:text-blue-400">Saving...</span>
            )}
          </div>

          <button
            onClick={handleNewInvoice}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            New Invoice
          </button>
        </div>

        {/* Simple Form (Placeholder for full invoice editor) */}
        <div className="space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Invoice ID
            </label>
            <input
              type="text"
              value={localInvoiceId}
              onChange={(e) => handleFieldChange('invoiceId', e.target.value)}
              placeholder="INV-001"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Recipient Name
            </label>
            <input
              type="text"
              value={localRecipientName}
              onChange={(e) => handleFieldChange('recipientName', e.target.value)}
              placeholder="Acme Corp"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 Your draft is automatically saved every 500ms
            </p>
            {activeDraft && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Last modified: {new Date(activeDraft.lastModified).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={clearDraft}
              disabled={!activeDraft}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear Draft
            </button>
            <button
              onClick={handleGenerateInvoice}
              disabled={!activeDraft}
              className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>

      {/* New Invoice Dialog */}
      <NewInvoiceDialog
        isOpen={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onConfirm={() => {
          createNewDraft()
          setShowNewDialog(false)
          setLocalInvoiceId('')
          setLocalRecipientName('')
        }}
      />
    </div>
  )
}
