import { InvoiceSchemaV1 } from '@/entities/invoice'

/**
 * Visual status of the invoice document
 */
export type InvoiceStatus = 'draft' | 'pending' | 'paid'

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
   * Should animate text elements?
   * @default true
   */
  animated?: boolean

  /**
   * Additional CSS classes for the container.
   */
  className?: string | undefined

  /**
   * Optional ref for the paper container (useful for PDF export)
   */
  containerRef?: React.RefObject<HTMLDivElement | null> | undefined
}
