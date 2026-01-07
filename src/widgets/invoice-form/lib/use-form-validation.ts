'use client'

import { useMemo } from 'react'
import { isAddress } from 'viem'
import type { DraftState, LineItem } from '@/shared/lib/invoice-types'

/**
 * Form Validation Hook
 *
 * Computes `canGenerate` based on required fields validation.
 * Used by InvoiceForm to enable/disable Generate button.
 *
 * @param draft - Current draft state from useCreatorStore
 * @param lineItems - Line items array from useCreatorStore
 * @returns Object with canGenerate boolean and validation details
 */
export function useFormValidation(draft: DraftState | null, lineItems: LineItem[]) {
  const canGenerate = useMemo(() => {
    if (!draft?.data) return false

    const data = draft.data

    // Required text fields
    const hasInvoiceId = Boolean(data.invoiceId && data.invoiceId.length > 0)
    const hasSenderName = Boolean(data.from?.name && data.from.name.length > 0)
    const hasClientName = Boolean(data.client?.name && data.client.name.length > 0)

    // Wallet address validation (EIP-55 checksum via viem)
    const hasValidSenderWallet = Boolean(
      data.from?.walletAddress && isAddress(data.from.walletAddress)
    )

    // Line items validation (min 1, each must have description and price > 0)
    const hasValidLineItems =
      lineItems.length >= 1 &&
      lineItems.length <= 5 &&
      lineItems.every(
        (item) => item.description && item.description.length > 0 && parseFloat(item.rate) > 0
      )

    // Network and token validation
    const hasNetwork = Boolean(data.networkId && data.networkId > 0)
    const hasToken = Boolean(data.currency && data.currency.length > 0)

    // Cross-field validation: dueDate >= issueDate (if both set)
    const hasValidDates = !data.dueAt || !data.issuedAt || data.dueAt >= data.issuedAt

    return (
      hasInvoiceId &&
      hasSenderName &&
      hasValidSenderWallet &&
      hasClientName &&
      hasValidLineItems &&
      hasNetwork &&
      hasToken &&
      hasValidDates
    )
  }, [draft, lineItems])

  // Individual field validation for UI feedback
  const fieldValidation = useMemo(() => {
    if (!draft?.data) {
      return {
        invoiceId: false,
        senderName: false,
        senderWallet: false,
        clientName: false,
        lineItems: false,
        network: false,
        token: false,
      }
    }

    const data = draft.data

    return {
      invoiceId: Boolean(data.invoiceId && data.invoiceId.length > 0),
      senderName: Boolean(data.from?.name && data.from.name.length > 0),
      senderWallet: Boolean(data.from?.walletAddress && isAddress(data.from.walletAddress)),
      clientName: Boolean(data.client?.name && data.client.name.length > 0),
      lineItems:
        lineItems.length >= 1 &&
        lineItems.length <= 5 &&
        lineItems.every(
          (item) => item.description && item.description.length > 0 && parseFloat(item.rate) > 0
        ),
      network: Boolean(data.networkId && data.networkId > 0),
      token: Boolean(data.currency && data.currency.length > 0),
    }
  }, [draft, lineItems])

  return {
    canGenerate,
    fieldValidation,
  }
}
