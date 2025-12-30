/**
 * Invoice Entity Types
 *
 * Base TypeScript types for invoice-related entities.
 * These types are used across the application for invoice creation and management.
 */

import type { InvoiceSchemaV1 } from './schema'

/**
 * Invoice
 *
 * Alias for InvoiceSchemaV1 - the canonical invoice type.
 * Use this type throughout the application for invoice data.
 */
export type Invoice = InvoiceSchemaV1

/**
 * LineItem
 *
 * Represents an individual line item in an invoice with UI-specific id.
 * The `id` field is for React keys and is NOT persisted to URL.
 */
export interface LineItem {
  /** Unique identifier for React keys (UUID v4) - NOT persisted to URL */
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
 * UI-specific metadata for draft management.
 * Stored alongside invoice data but NOT persisted to URL.
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
 * Combines draft metadata with partial invoice data.
 * The `data` field contains invoice fields being edited.
 */
export interface DraftState {
  /** Draft metadata (UI-specific) */
  meta: DraftMetadata

  /** Partial invoice data being edited */
  data: Partial<Invoice>
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

  /** Full invoice data for template */
  invoiceData: Partial<Invoice>
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
