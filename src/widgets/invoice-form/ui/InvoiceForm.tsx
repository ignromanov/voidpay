'use client'

import { cn } from '@/shared/lib/utils'

import { useInvoiceForm } from '../lib/use-invoice-form'
import {
  MetadataSection,
  PartySection,
  LineItemsSection,
  TaxDiscountSection,
  PaymentSection,
  NotesSection,
  LinkOptionsSection,
  GenerateButton,
} from './sections'

export interface InvoiceFormProps {
  className?: string
  onGenerate?: () => void
  isGenerating?: boolean
}

/**
 * InvoiceForm Widget
 *
 * Main form for creating invoices using react-hook-form for performant input handling.
 * Form has its own internal state (uncontrolled inputs) and syncs to Zustand store with debounce.
 *
 * Architecture:
 * - useInvoiceForm: manages form state + debounced sync to store
 * - Sections: modular components for each form area
 * - LineItems: managed separately via store (not form)
 *
 * Sections:
 * - MetadataSection: Invoice ID + dates
 * - PartySection: Sender/Recipient (reusable via partyType prop)
 * - LineItemsSection: Line items table
 * - TaxDiscountSection: Tax & discount inputs
 * - PaymentSection: Network & token selects
 * - NotesSection: Notes textarea
 * - LinkOptionsSection: Magic Dust + OG image
 * - GenerateButton: Generate invoice link
 */
export function InvoiceForm({ className, onGenerate, isGenerating = false }: InvoiceFormProps) {
  const { form, fieldValidation, formState, canGenerate } = useInvoiceForm()
  const decimals = form.watch('decimals')

  return (
    <div className={cn('space-y-8', className)}>
      <MetadataSection form={form} fieldValidation={fieldValidation} />

      <PartySection partyType="from" form={form} fieldValidation={fieldValidation} formState={formState} />

      <PartySection partyType="client" form={form} fieldValidation={fieldValidation} formState={formState} />

      <LineItemsSection decimals={decimals ?? 6} />

      <TaxDiscountSection form={form} formState={formState} />

      <PaymentSection form={form} />

      <NotesSection form={form} />

      <LinkOptionsSection />

      <GenerateButton onGenerate={onGenerate} canGenerate={canGenerate} isGenerating={isGenerating} />
    </div>
  )
}
