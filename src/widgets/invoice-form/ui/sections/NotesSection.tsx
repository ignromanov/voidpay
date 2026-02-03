'use client'

import { useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { Textarea } from '@/shared/ui/textarea'
import { FIELD_LIMITS } from '@/shared/lib/invoice-types'

import type { InvoiceFormValues } from '../../lib/use-invoice-form'
import { CollapsibleSection } from '../CollapsibleSection'

export interface NotesSectionProps {
  form: UseFormReturn<InvoiceFormValues>
}

/**
 * Notes/memo section with collapsible wrapper.
 */
export function NotesSection({ form }: NotesSectionProps) {
  const { setValue, watch } = form
  const notes = watch('notes')

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.slice(0, FIELD_LIMITS.notes)
      setValue('notes', value)
    },
    [setValue]
  )

  return (
    <div className="border-t border-zinc-800/50 pt-4">
      <CollapsibleSection title="Add Notes / Memo (Optional)" defaultOpen>
        <Textarea
          value={notes || ''}
          onChange={handleNotesChange}
          placeholder="Additional information for the invoice..."
          className="min-h-[80px] resize-none"
          maxLength={FIELD_LIMITS.notes}
          showCount
        />
      </CollapsibleSection>
    </div>
  )
}
