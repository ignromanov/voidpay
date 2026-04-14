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
import { calculateTotalsBigInt, formatAmount } from '../amount-utils'

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

// ============ Payment Tracking ============

/**
 * Block confirmation progress for payment verification.
 * Used by payment-panel widget and rich-invoice-store.
 */
export interface ConfirmationProgress {
  /** Current number of block confirmations */
  current: number
  /** Required confirmations for finality */
  required: number
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
  return items.map((item) => {
    const rawQty = item.quantity ?? 0
    return {
      id: crypto.randomUUID(),
      description: item.description ?? '',
      // Handle string quantities from old templates in localStorage
      quantity: typeof rawQty === 'string' ? parseFloat(rawQty) || 0 : rawQty,
      rate: item.rate ?? '0',
    }
  })
}

/**
 * Calculate and format total amount from invoice using BigInt precision.
 *
 * Rates are stored as atomic units (e.g., "150000000" = $150.00 for 6 decimals).
 * Uses BigInt arithmetic to avoid floating-point precision issues.
 *
 * @param invoice - Complete invoice data
 * @returns Formatted string like "1250.50 USDC"
 */
export function formatInvoiceTotal(invoice: Invoice): string {
  const decimals = invoice.decimals ?? 6

  // If invoice has pre-calculated total, use it
  if (invoice.total) {
    return `${formatAmount(invoice.total, decimals)} ${invoice.currency}`
  }

  // Map items for BigInt calculation
  const items = invoice.items.map((item) => ({
    quantity: item.quantity,
    rate: item.rate || '0',
  }))

  // Extract tax/discount percentages (strip % suffix if present)
  const tax = invoice.tax?.endsWith('%') ? invoice.tax.slice(0, -1) : invoice.tax
  const discount = invoice.discount?.endsWith('%') ? invoice.discount.slice(0, -1) : invoice.discount

  // Calculate using BigInt arithmetic
  const result = calculateTotalsBigInt(items, { tax, discount, decimals })

  return `${formatAmount(result.total, decimals)} ${invoice.currency}`
}
