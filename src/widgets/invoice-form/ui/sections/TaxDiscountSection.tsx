'use client'

import type { UseFormReturn, FormState } from 'react-hook-form'

import { Input } from '@/shared/ui/input'
import { FIELD_LIMITS } from '@/shared/lib/invoice-types'

import type { InvoiceFormValues } from '../../lib/use-invoice-form'
import { getFieldError } from '../../lib/get-field-error'

export interface TaxDiscountSectionProps {
  form: UseFormReturn<InvoiceFormValues>
  formState: FormState<InvoiceFormValues>
  submitAttempted?: boolean
}

/**
 * Tax and discount percentage inputs in a 2-column grid.
 */
export function TaxDiscountSection({ form, formState, submitAttempted }: TaxDiscountSectionProps) {
  const { register } = form
  const { touchedFields, errors } = formState

  return (
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Tax (%)"
        type="text"
        inputMode="decimal"
        placeholder="0"
        maxLength={FIELD_LIMITS.percentage}
        error={getFieldError(errors.tax)}
        touched={touchedFields.tax || submitAttempted}
        {...register('tax')}
        className="text-sm"
      />
      <Input
        label="Discount (%)"
        type="text"
        inputMode="decimal"
        placeholder="0"
        maxLength={FIELD_LIMITS.percentage}
        error={getFieldError(errors.discount)}
        touched={touchedFields.discount || submitAttempted}
        {...register('discount')}
        className="text-sm"
      />
    </div>
  )
}
