'use client'

import type { UseFormReturn, FormState } from 'react-hook-form'

import { Input } from '@/shared/ui/input'
import { FIELD_LIMITS } from '@/shared/lib/invoice-types'

import type { InvoiceFormValues } from '../../lib/use-invoice-form'
import { getFieldError } from '../../lib/get-field-error'

export interface TaxDiscountSectionProps {
  form: UseFormReturn<InvoiceFormValues>
  formState: FormState<InvoiceFormValues>
}

/**
 * Tax and discount percentage inputs in a 2-column grid.
 */
export function TaxDiscountSection({ form, formState }: TaxDiscountSectionProps) {
  const { register } = form
  const { touchedFields, errors } = formState

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Tax (%)</label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0"
          maxLength={FIELD_LIMITS.percentage}
          error={getFieldError(errors.tax)}
          touched={touchedFields.tax}
          {...register('tax')}
          className="text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Discount (%)</label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0"
          maxLength={FIELD_LIMITS.percentage}
          error={getFieldError(errors.discount)}
          touched={touchedFields.discount}
          {...register('discount')}
          className="text-sm"
        />
      </div>
    </div>
  )
}
