/**
 * Invoice Helper Types - Shared Layer
 *
 * Utility types, partial types, and helper functions for invoice data.
 * These are used across the application for invoice creation and management.
 *
 * Location: shared/lib (not entities/) to allow imports from shared layer
 * following FSD layer rules.
 */

import type { Invoice } from './schema'

// ============ Deep Partial Generic ============

/**
 * DeepPartial<T> — Makes all nested properties optional recursively.
 *
 * Useful for UI forms where data is filled in gradually.
 * Unlike Partial<T>, this works on nested objects too.
 *
 * Special handling:
 * - Arrays: elements become DeepPartial but array itself stays as array
 * - Objects: all properties become optional with DeepPartial values
 * - Primitives: unchanged
 *
 * @example
 * type PartialInvoice = DeepPartial<Invoice>
 * // { from?: { name?: string; walletAddress?: string }; items?: { description?: string }[]; ... }
 */
export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T

/**
 * PartialInvoice — Deep partial invoice type for UI components.
 *
 * Used throughout the interface where invoice data may be incomplete:
 * - Invoice editor forms
 * - Preview components (InvoicePaper)
 * - Draft states
 */
export type PartialInvoice = DeepPartial<Invoice>

/**
 * Partial types for invoice sub-objects (for component props)
 */
export type PartialParty = DeepPartial<Invoice['from']>
export type PartialClient = DeepPartial<Invoice['client']>
export type PartialItem = DeepPartial<Invoice['items'][number]>

/**
 * InvoiceItem — extracted from Invoice for type reuse
 */
export type InvoiceItem = Invoice['items'][number]

/**
 * LineItem — UI version with ID for React keys
 *
 * Extends InvoiceItem (DRY), adding only `id` for React key prop.
 * When encoding to Invoice, strip the `id` field.
 */
export type LineItem = InvoiceItem & {
  /** Unique identifier for React key (UUID v4) */
  id: string
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
  data: PartialInvoice
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
  /** Invoice data (deep partial, merged with defaults when loaded) */
  invoiceData: DeepPartial<Omit<Invoice, 'version'>>
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
  /** Full invoice data */
  invoice: Invoice
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
 * Accepts partial items from PartialInvoice for UI editing
 */
export function invoiceItemsToLineItems(items: PartialItem[]): LineItem[] {
  return items.map((item) => ({
    id: crypto.randomUUID(),
    description: item.description ?? '',
    quantity: item.quantity ?? 0,
    rate: item.rate ?? '0',
  }))
}

/**
 * Calculate and format total amount from invoice
 * @returns Formatted string like "1250.50 USDC"
 */
export function formatInvoiceTotal(invoice: Invoice): string {
  const subtotal = invoice.items.reduce((sum, item) => {
    const rate = parseFloat(item.rate)
    return sum + item.quantity * rate
  }, 0)

  let total = subtotal

  if (invoice.tax) {
    const taxValue = invoice.tax.endsWith('%')
      ? (subtotal * parseFloat(invoice.tax)) / 100
      : parseFloat(invoice.tax)
    total += taxValue
  }

  if (invoice.discount) {
    const discountValue = invoice.discount.endsWith('%')
      ? (subtotal * parseFloat(invoice.discount)) / 100
      : parseFloat(invoice.discount)
    total -= discountValue
  }

  return `${total.toFixed(2)} ${invoice.currency}`
}
