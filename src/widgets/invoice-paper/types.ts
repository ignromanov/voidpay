import { InvoiceSchemaV1 } from '@/entities/invoice'

/**
 * Visual status of the invoice document
 */
export type InvoiceStatus = 'draft' | 'pending' | 'paid'

/**
 * Invoice paper display variant
 * - full: Interactive mode (copy buttons, hover effects) for modals
 * - default: Standard mode for /create and /pay pages (readonly)
 * - print: Print-optimized (less padding, no interactive elements)
 */
export type InvoicePaperVariant = 'full' | 'default' | 'print'

/**
 * Props for the InvoicePaper widget
 */
export interface InvoicePaperProps {
  /**
   * Invoice data following Schema V1.
   * Can be partial for 'draft' status preview.
   */
  data: Partial<InvoiceSchemaV1>

  /**
   * Current status of the invoice.
   * Affects watermarks and badges.
   * @default 'pending'
   */
  status?: InvoiceStatus

  /**
   * Transaction hash for 'paid' status.
   * Used to generate block explorer links.
   */
  txHash?: string

  /**
   * Whether the transaction hash has been validated on-chain.
   * When false, a warning indicator is shown.
   * @default true (for backward compatibility)
   */
  txHashValidated?: boolean | undefined

  /**
   * Display variant of the invoice paper.
   * @default 'default'
   */
  variant?: InvoicePaperVariant | undefined

  /**
   * Enable responsive scaling for mobile devices.
   * When true, the invoice scales down on smaller screens.
   * @default false
   */
  responsive?: boolean | undefined

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
   * Additional CSS classes for the container.
   */
  className?: string | undefined

  /**
   * Optional ref for the paper container (useful for PDF export).
   * Uses HTMLElement for semantic flexibility (article, section, etc.)
   */
  containerRef?: React.RefObject<HTMLElement | null> | undefined
}
