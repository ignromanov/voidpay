/**
 * Payment Panel Widget - Public API
 *
 * Glassmorphism card for the /pay page showing payment status,
 * amount breakdown, and action slot for SmartPayButton.
 */

export { PaymentPanel } from './ui/PaymentPanel'
export { DevStatusToggle } from './ui/DevStatusToggle'
export { computePaymentStatus, type StatusInput } from './lib/compute-status'
export { computeAmounts, type ComputedAmounts } from './lib/compute-amounts'
export type { PaymentPanelProps, PaymentPanelStatus, ConfirmationProgress } from './types'
