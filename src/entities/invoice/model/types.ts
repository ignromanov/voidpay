/**
 * Invoice Entity Types
 *
 * Base TypeScript types for invoice-related entities.
 * These types are used across the application for invoice creation and management.
 */

import type { Invoice } from './schema'

// Re-export Invoice for convenience
export type { Invoice }

/**
 * LineItem (UI version with ID for React keys)
 *
 * Used in forms for tracking individual line items.
 * When encoding to Invoice, the `id` is stripped.
 */
export interface LineItem {
  /** Unique identifier for React key (UUID v4) */
  id: string
  /** Item description */
  description: string
  /** Quantity (must be > 0) */
  quantity: number
  /** Rate per unit (decimal string) */
  rate: string
}

/**
 * DraftMetadata
 *
 * Metadata for an in-progress invoice draft.
 * Stored separately from invoice data.
 */
export interface DraftMetadata {
  /** Unique draft identifier (UUID v4) */
  draftId: string
  /** Last modification timestamp (ISO 8601) */
  lastModified: string
}

/**
 * DraftState
 *
 * Complete draft state combining metadata and partial invoice data.
 * The invoice data may be incomplete during editing.
 */
export interface DraftState {
  /** Draft metadata */
  meta: DraftMetadata
  /** Partial invoice data (may be incomplete) */
  data: Partial<Invoice>
}

/**
 * InvoiceTemplate
 *
 * Saved invoice template for reuse.
 * Contains partial invoice data that can be loaded and completed.
 */
export interface InvoiceTemplate {
  /** Unique template identifier (UUID v4) */
  templateId: string
  /** Template name (user-provided or auto-generated) */
  name: string
  /** Creation timestamp (ISO 8601) */
  createdAt: string
  /** Invoice data (partial, merged with defaults when loaded) */
  invoiceData: Partial<Omit<Invoice, 'version'>>
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
  /** Invoice ID (e.g., "INV-001") */
  invoiceId: string
  /** Recipient name for display */
  recipientName: string
  /** Total amount string with currency (e.g., "1250.50 USDC") */
  totalAmount: string
  /** Full URL for quick access (contains compressed data) */
  invoiceUrl: string
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
  /** Invoice ID */
  invoiceId: string
  /** Recipient name */
  recipientName: string
  /** Payment amount string with currency (e.g., "1250.50 USDC") */
  paymentAmount: string
  /** Transaction Hash (0x...) */
  transactionHash: string
  /** Chain ID */
  chainId: number
  /** Original invoice URL (for reference) */
  invoiceUrl: string
}

// ============ Helpers ============

/**
 * Convert LineItem[] (with IDs) to Invoice items format (without IDs)
 */
export function lineItemsToInvoiceItems(lineItems: LineItem[]): Invoice['items'] {
  return lineItems.map(({ description, quantity, rate }) => ({
    description,
    quantity,
    rate,
  }))
}

/**
 * Convert Invoice items to LineItem[] (adding IDs)
 */
export function invoiceItemsToLineItems(items: Invoice['items']): LineItem[] {
  return items.map((item) => ({
    id: crypto.randomUUID(),
    description: item.description,
    quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity),
    rate: item.rate,
  }))
}
