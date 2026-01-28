/**
 * Required fields validation result from validateRequiredFields()
 */
export interface RequiredFieldsValidation {
  invoiceId: boolean
  senderName: boolean
  senderWallet: boolean
  clientName: boolean
}

/**
 * Get error message from Zod validation or required field check.
 * Returns empty string if no error (for exactOptionalPropertyTypes compatibility).
 *
 * @param zodError - Error object from react-hook-form (with optional message)
 * @param fieldValidation - Validation result from validateRequiredFields
 * @param requiredField - Key to check in fieldValidation
 * @param requiredMessage - Message to show if required field is invalid
 */
export function getFieldError(
  zodError: { message?: string } | undefined,
  fieldValidation?: RequiredFieldsValidation,
  requiredField?: keyof RequiredFieldsValidation,
  requiredMessage?: string
): string {
  // Zod validation errors (max length, format, etc.)
  if (zodError?.message) return zodError.message
  // Required field validation
  if (fieldValidation && requiredField && requiredMessage && !fieldValidation[requiredField]) {
    return requiredMessage
  }
  return ''
}
