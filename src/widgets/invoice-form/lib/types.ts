/**
 * Form Validation Types
 *
 * Hybrid validation UX: real-time feedback without annoying users
 *
 * State Machine:
 * - pristine: Initial state, no feedback
 * - typing: User is editing, show green glow on valid (no red for invalid)
 * - touched: User left field, show red border + error for invalid
 */

/**
 * Field validation state for hybrid UX
 */
export type FieldState = 'pristine' | 'typing' | 'touched'

/**
 * Validation status for a field
 */
export interface FieldValidation {
  state: FieldState
  isValid: boolean
  errorMessage?: string
}

/**
 * Track field states across the form
 */
export interface FormFieldStates {
  invoiceId: FieldState
  senderName: FieldState
  senderWallet: FieldState
  clientName: FieldState
  // Optional fields don't need state tracking
}

/**
 * Default field states (all pristine)
 */
export const DEFAULT_FIELD_STATES: FormFieldStates = {
  invoiceId: 'pristine',
  senderName: 'pristine',
  senderWallet: 'pristine',
  clientName: 'pristine',
}
