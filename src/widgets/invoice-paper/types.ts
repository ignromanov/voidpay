import { PartialInvoice, ViewedInvoiceStatus as InvoiceStatus } from '@/entities/invoice'

/**
 * Visual status of the invoice document
 * Re-exported from entities/invoice for consistency across the app.
 *
 * - draft: Invoice being created (editable, not yet generated)
 * - pending: Invoice created, awaiting payment
 * - paid: Payment confirmed on-chain
 * - overdue: Payment deadline passed
 */
export type { InvoiceStatus }

/**
 * Invoice paper display variant
 * - full: Interactive mode (copy buttons, hover effects) for modals
 * - default: Standard mode for /create and /pay pages (readonly)
 * - print: Print-optimized (less padding, no interactive elements)
 */
export type InvoicePaperVariant = 'full' | 'default' | 'print'

/**
 * Base props shared by all invoice paper variants
 */
interface InvoicePaperBaseProps {
  /**
   * Invoice data following Schema V1.
   * Can be deep-partial for 'draft' status preview (nested fields may be incomplete).
   * When undefined, renders an empty placeholder state with 'empty' status.
   */
  data: PartialInvoice | undefined

  /**
   * Display variant of the invoice paper.
   * @default 'default'
   */
  variant?: InvoicePaperVariant | undefined

  /**
   * Whether to show the QR code in the footer.
   * @default true
   */
  showQR?: boolean | undefined

  /**
   * Whether to show the texture overlay.
   * Disable for better print quality.
   * @default true
   */
  showTexture?: boolean | undefined

  /**
   * Whether to show the network-colored glow effect around the invoice.
   * Creates a soft ambient glow matching the blockchain network color.
   * @default false
   */
  showGlow?: boolean | undefined

  /**
   * Invoice URL for sharing/linking.
   * When provided with variant='full', the invoice title becomes a clickable link.
   */
  invoiceUrl?: string | undefined

  /**
   * Additional CSS classes for the container.
   */
  className?: string | undefined

  /**
   * Optional ref for the paper container (useful for PDF export).
   * Uses HTMLElement for semantic flexibility (article, section, etc.)
   */
  containerRef?: React.RefObject<HTMLElement | null> | undefined
}

/**
 * Props when invoice is NOT paid (draft, pending, overdue)
 * txHash is optional (may not exist yet)
 */
interface InvoicePaperNotPaidProps extends InvoicePaperBaseProps {
  /**
   * Current status of the invoice.
   * @default 'pending'
   */
  status?: 'draft' | 'pending' | 'overdue' | 'empty'

  /**
   * Transaction hash (optional for non-paid statuses).
   */
  txHash?: string | undefined

  /**
   * Whether the transaction hash has been validated on-chain.
   * @default true
   */
  txHashValidated?: boolean | undefined
}

/**
 * Props when invoice is paid
 * txHash is REQUIRED when status is 'paid'
 */
interface InvoicePaperPaidProps extends InvoicePaperBaseProps {
  /**
   * Status is 'paid' - invoice has been paid
   */
  status: 'paid'

  /**
   * Transaction hash REQUIRED for paid status.
   * Used to generate block explorer links.
   */
  txHash: string

  /**
   * Whether the transaction hash has been validated on-chain.
   * When false, a warning indicator is shown.
   * @default true
   */
  txHashValidated?: boolean | undefined
}

/**
 * Props for the InvoicePaper widget
 *
 * Discriminated union ensuring txHash is required when status is 'paid'.
 * This provides compile-time safety for payment verification flows.
 */
export type InvoicePaperProps = InvoicePaperNotPaidProps | InvoicePaperPaidProps
