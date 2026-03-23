/**
 * Payment Panel Widget - Public API
 *
 * Glassmorphism card for the /pay page showing payment status,
 * amount breakdown, and action slot for SmartPayButton.
 */

export { PaymentPanel } from './ui/PaymentPanel'
export { DevStatusToggle } from './ui/DevStatusToggle'
export { DevPaymentStepToggle } from './ui/DevPaymentStepToggle'
export { computePaymentStatus, type StatusInput } from './lib/compute-status'
export { computeAmounts, type ComputedAmounts } from './lib/compute-amounts'
export type { PaymentPanelProps, PaymentPanelStatus, ConfirmationProgress } from './types'
export { PollingStatus } from './ui/PollingStatus'
export type { PollingStatusProps } from './ui/PollingStatus'
export { StatusBadge } from './ui/StatusBadge'
export { MinimizedPill } from './ui/MinimizedPill'
export { useInvoiceView } from './model/use-invoice-view'
export type { InvoiceViewState, UseInvoiceViewOptions } from './model/use-invoice-view'
