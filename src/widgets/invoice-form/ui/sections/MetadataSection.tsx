'use client'

import { useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { Input } from '@/shared/ui/input'
import { Text } from '@/shared/ui/typography'
import { CalendarIcon } from '@/shared/ui/icons'
import { FIELD_LIMITS } from '@/shared/lib/invoice-types'

import type { InvoiceFormValues } from '../../lib/use-invoice-form'
import { getFieldError, type RequiredFieldsValidation } from '../../lib/get-field-error'
import { DateInput } from '../components/DateInput'

export interface MetadataSectionProps {
  form: UseFormReturn<InvoiceFormValues>
  fieldValidation: RequiredFieldsValidation
  submitAttempted?: boolean
}

/**
 * Invoice metadata section: Invoice ID and dates (issued/due).
 */
export function MetadataSection({ form, fieldValidation, submitAttempted }: MetadataSectionProps) {
  const {
    register,
    setValue,
    watch,
    formState: { touchedFields, errors },
  } = form

  const issuedAt = watch('issuedAt')
  const dueAt = watch('dueAt')

  const handleIssuedAtChange = useCallback(
    (unix: number | undefined) => {
      setValue('issuedAt', unix)
    },
    [setValue]
  )

  const handleDueAtChange = useCallback(
    (unix: number | undefined) => {
      setValue('dueAt', unix)
    },
    [setValue]
  )

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <Input
        label="Invoice No. *"
        {...register('invoiceId')}
        className="font-mono"
        placeholder="INV-2026-001"
        maxLength={FIELD_LIMITS.invoiceId}
        error={getFieldError(errors.invoiceId, fieldValidation, 'invoiceId', 'Invoice number is required')}
        touched={touchedFields.invoiceId || submitAttempted}
      />

      <div className="space-y-1.5">
        <Text variant="label" className="flex items-center gap-1.5 text-zinc-400">
          <CalendarIcon size={12} /> Dates (Issue / Due) *
        </Text>
        <div className="grid grid-cols-2 gap-2">
          <DateInput value={issuedAt} onChange={handleIssuedAtChange} aria-label="Issue date" />
          <DateInput value={dueAt} onChange={handleDueAtChange} aria-label="Due date" />
        </div>
      </div>
    </div>
  )
}
