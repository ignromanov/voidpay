/**
 * Invoice Validation for URL Generation
 *
 * Validates invoice data before generating shareable URLs.
 * Checks required fields and estimates URL size.
 */

import { isValidAddress } from '@/shared/lib/validation'
import type { PartialInvoice, LineItem } from '@/shared/lib/invoice-types'
import type { ValidationResult, ValidationError } from './types'

/** URL size limit in bytes */
const URL_SIZE_LIMIT = 2000

/** Warning threshold for URL size (90% of limit) */
const URL_SIZE_WARNING_THRESHOLD = 1800

/**
 * Validate invoice data before URL generation
 *
 * Checks all required fields and estimates the resulting URL size.
 * Returns validation result with errors and size estimation.
 *
 * @param draft - Partial invoice data from form
 * @param lineItems - Line items with tempId for form tracking
 * @returns ValidationResult with isValid, errors, and size estimation
 */
export function validateInvoiceForGeneration(
  draft: PartialInvoice,
  lineItems: LineItem[]
): ValidationResult {
  const errors: ValidationError[] = []

  // Required field validations
  if (!draft.invoiceId?.trim()) {
    errors.push({
      field: 'invoiceId',
      message: 'Invoice number is required',
    })
  }

  // From (sender) validations
  if (!draft.from?.name?.trim()) {
    errors.push({
      field: 'from.name',
      message: 'Sender name is required',
    })
  }

  if (!draft.from?.walletAddress?.trim() || !isValidAddress(draft.from.walletAddress)) {
    errors.push({
      field: 'from.walletAddress',
      message: 'Valid sender wallet address required',
    })
  }

  // Client validations
  if (!draft.client?.name?.trim()) {
    errors.push({
      field: 'client.name',
      message: 'Client name is required',
    })
  }

  // Line items validations
  if (!lineItems || lineItems.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one line item is required',
    })
  } else {
    lineItems.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors.push({
          field: `items[${index}].description`,
          message: 'Item description is required',
        })
      }

      // Rate must be positive (stored as bigint string in atomic units)
      let rate: bigint
      try {
        rate = BigInt(item.rate || '0')
      } catch {
        errors.push({
          field: `items[${index}].rate`,
          message: 'Item rate is not a valid number',
        })
        return
      }
      if (rate <= BigInt(0)) {
        errors.push({
          field: `items[${index}].rate`,
          message: 'Item rate must be greater than 0',
        })
      }
    })
  }

  // Network and token validations
  if (draft.networkId === undefined || draft.networkId === null) {
    errors.push({
      field: 'networkId',
      message: 'Network must be selected',
    })
  }

  if (!draft.currency?.trim()) {
    errors.push({
      field: 'currency',
      message: 'Token must be selected',
    })
  }

  if (draft.decimals === undefined || draft.decimals === null) {
    errors.push({
      field: 'decimals',
      message: 'Token decimals required',
    })
  }

  // Estimate URL size
  const estimatedSize = estimateUrlSize(draft, lineItems)

  // Size warning (but not error - actual check happens during generation)
  const result: ValidationResult = {
    isValid: errors.length === 0,
    errors,
    estimatedSize,
  }

  if (estimatedSize > URL_SIZE_WARNING_THRESHOLD && estimatedSize <= URL_SIZE_LIMIT) {
    result.sizeWarning = `URL size (${estimatedSize} bytes) is approaching the ${URL_SIZE_LIMIT} byte limit. Consider reducing notes or line items.`
  }

  return result
}

/**
 * Estimate the URL size for an invoice
 *
 * Uses a simplified calculation based on field lengths.
 * Actual URL size depends on compression, but this gives a reasonable estimate.
 */
function estimateUrlSize(draft: PartialInvoice, lineItems: LineItem[]): number {
  // Base URL: https://voidpay.xyz/pay#
  let size = 25

  // Estimate compressed size (roughly 60-70% of raw JSON)
  const jsonSize = JSON.stringify({
    ...draft,
    items: lineItems.map(({ id: _id, ...item }) => item),
  }).length

  // Binary encoding + Brotli + Base64url typically achieves ~60% of JSON size
  size += Math.ceil(jsonSize * 0.6)

  return size
}
