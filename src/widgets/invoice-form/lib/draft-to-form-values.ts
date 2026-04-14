/**
 * Draft → Form Values Adapter
 *
 * Single source of truth for converting store PartialInvoice to
 * react-hook-form InvoiceFormValues. Ensures all optional string
 * fields are explicitly set to '' so form.reset() clears inputs
 * (react-hook-form treats undefined in reset() as "keep previous value").
 */

import type { PartialInvoice, PartialParty, PartialClient, InvoiceFormValues } from '@/shared/lib/invoice-types'

function partyToFormValues(party?: PartialParty | PartialClient) {
  return {
    name: party?.name ?? '',
    walletAddress: party?.walletAddress ?? '',
    email: party?.email ?? '',
    physicalAddress: party?.physicalAddress ?? '',
    phone: party?.phone ?? '',
    taxId: party?.taxId ?? '',
  }
}

export function draftDataToFormValues(data: PartialInvoice): InvoiceFormValues {
  return {
    invoiceId: data.invoiceId,
    issuedAt: data.issuedAt,
    dueAt: data.dueAt,
    notes: data.notes ?? '',
    networkId: data.networkId,
    currency: data.currency,
    tokenAddress: data.tokenAddress ?? '',
    decimals: data.decimals,
    tax: data.tax ?? '',
    discount: data.discount ?? '',
    from: partyToFormValues(data.from),
    client: partyToFormValues(data.client),
  }
}
