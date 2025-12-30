/**
 * Invoice Entity Types
 *
 * Base TypeScript types for invoice-related entities.
 * These types are used across the application for invoice creation and management.
 */

/**
 * LineItem
 *
 * Represents an individual line item in an invoice
 */
export interface LineItem {
  /** Unique identifier (UUID v4) */
  id: string

  /** Item description */
  description: string

  /** Quantity (must be > 0) */
  quantity: number

  /** Rate per unit (decimal string) */
  rate: string
}

/**
 * InvoiceDraft
 *
 * Represents the single active in-progress invoice.
 * This structure matches the InvoiceSchemaV2 from the URL state codec.
 */
export interface InvoiceDraft {
  /** Unique draft identifier (UUID v4) */
  draftId: string

  /** Last modification timestamp (ISO 8601) */
  lastModified: string

  // ========== Invoice Fields ==========

  /** Invoice ID (max 50 chars) */
  invoiceId: string

  /** Issue date (ISO 8601) */
  issueDate: string

  /** Due date (ISO 8601) */
  dueDate: string

  /** Optional notes (max 280 chars) */
  notes?: string

  // ========== Network & Currency ==========

  /** Chain ID (e.g., 1 for Ethereum, 42161 for Arbitrum) */
  chainId: number

  /** Currency symbol (e.g., "USDC", "ETH") */
  currencySymbol: string

  /** Token contract address (undefined = native token) */
  tokenAddress?: string

  /** Token decimals */
  decimals: number

  // ========== Parties ==========

  /** Sender (invoice creator) information */
  sender: {
    name: string
    wallet: string
    email?: string
    address?: string
  }

  /** Recipient (payer) information */
  recipient: {
    name: string
    wallet?: string
    email?: string
    address?: string
  }

  // ========== Line Items ==========

  /** Line items (at least 1 required) */
  lineItems: LineItem[]

  // ========== Calculations ==========

  /** Tax rate (e.g., "10%" or "50") */
  taxRate: string

  /** Discount amount (e.g., "10%" or "50") */
  discountAmount: string
}

/**
 * InvoiceTemplate
 *
 * Saved invoice template for reuse.
 */
export interface InvoiceTemplate {
  /** Unique template identifier (UUID v4) */
  templateId: string

  /** Template name (user-provided or auto-generated) */
  name: string

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  /** Full invoice data (minus draft-specific fields) */
  invoiceData: Omit<InvoiceDraft, 'draftId' | 'lastModified'>
}

/**
 * CreationHistoryEntry
 *
 * Record of a completed invoice created by the user.
 */
export interface CreationHistoryEntry {
  /** Unique entry identifier (UUID v4) */
  entryId: string

  /** Creation timestamp (ISO 8601) */
  createdAt: string

  // ========== Key Details ==========

  /** Invoice ID (e.g., "INV-001") */
  invoiceId: string

  /** Recipient name for display */
  recipientName: string

  /** Total amount string with currency (e.g., "1250.50 USDC") */
  totalAmount: string

  /** Full URL for quick access (contains compressed data) */
  invoiceUrl: string

  // ========== Transaction Discovery ==========

  /** Transaction Hash (if discovered via polling) */
  txHash?: string

  /** Payment timestamp (if discovered via polling) */
  paidAt?: string
}

/**
 * PaymentReceipt
 *
 * Record of a completed payment made by the user (payer).
 */
export interface PaymentReceipt {
  /** Unique receipt identifier (UUID v4) */
  receiptId: string

  /** Payment timestamp (ISO 8601) */
  paidAt: string

  // ========== Invoice Details ==========

  /** Invoice ID */
  invoiceId: string

  /** Recipient name */
  recipientName: string

  /** Payment amount string with currency (e.g., "1250.50 USDC") */
  paymentAmount: string

  // ========== Transaction Details ==========

  /** Transaction Hash (0x...) */
  transactionHash: string

  /** Chain ID */
  chainId: number

  /** Original invoice URL (for reference) */
  invoiceUrl: string
}
