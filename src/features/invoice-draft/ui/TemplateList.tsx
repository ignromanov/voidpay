/**
 * Template List Component
 *
 * Displays saved invoice templates with load and delete actions.
 */

'use client'

import { useState } from 'react'
import { useCreatorStore } from '@/entities/creator/model/useCreatorStore'
import type { InvoiceTemplate } from '@/entities/invoice/model/types'

interface TemplateListProps {
  /**
   * Callback when template is loaded
   */
  onTemplateLoad?: (templateId: string) => void
}

/**
 * Template List Component
 *
 * @example
 * function TemplatesPage() {
 *   return (
 *     <div>
 *       <h1>Saved Templates</h1>
 *       <TemplateList onTemplateLoad={(id) => router.push('/create')} />
 *     </div>
 *   );
 * }
 */
export function TemplateList({ onTemplateLoad }: TemplateListProps) {
  const templates = useCreatorStore((s) => s.templates)
  const loadTemplate = useCreatorStore((s) => s.loadTemplate)
  const deleteTemplate = useCreatorStore((s) => s.deleteTemplate)

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleLoad = (templateId: string) => {
    loadTemplate(templateId)
    onTemplateLoad?.(templateId)
  }

  const handleDelete = (templateId: string) => {
    deleteTemplate(templateId)
    setDeleteConfirm(null)
  }

  if (templates.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No saved templates yet.</p>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          Save a draft as a template to reuse it later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.templateId}
          template={template}
          onLoad={() => handleLoad(template.templateId)}
          onDelete={() => setDeleteConfirm(template.templateId)}
          showDeleteConfirm={deleteConfirm === template.templateId}
          onDeleteConfirm={() => handleDelete(template.templateId)}
          onDeleteCancel={() => setDeleteConfirm(null)}
        />
      ))}
    </div>
  )
}

interface TemplateCardProps {
  template: InvoiceTemplate
  onLoad: () => void
  onDelete: () => void
  showDeleteConfirm: boolean
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

function TemplateCard({
  template,
  onLoad,
  onDelete,
  showDeleteConfirm,
  onDeleteConfirm,
  onDeleteCancel,
}: TemplateCardProps) {
  const { name, createdAt, invoiceData } = template

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Created {formattedDate}</p>

          <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <span className="font-medium">Recipient:</span> {invoiceData.recipient.name || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Currency:</span> {invoiceData.currencySymbol}
            </p>
            <p>
              <span className="font-medium">Items:</span> {invoiceData.lineItems.length}
            </p>
          </div>
        </div>

        <div className="ml-4 flex flex-col space-y-2">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={onLoad}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
              >
                Load
              </button>
              <button
                onClick={onDelete}
                className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Delete this template?</p>
              <button
                onClick={onDeleteConfirm}
                className="rounded-md bg-red-600 px-3 py-1 text-xs text-white transition-colors hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={onDeleteCancel}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
