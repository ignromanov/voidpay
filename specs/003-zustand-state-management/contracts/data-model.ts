/**
 * Data Model: Client-Side State Management
 * 
 * Feature: 003-zustand-state-management
 * Date: 2025-11-20
 * Version: 1.0
 * 
 * This file defines the TypeScript data models for client-side state management using Zustand.
 * All entities are stored in browser LocalStorage via Zustand persist middleware.
 */

// ============================================================================
// Store Schemas
// ============================================================================

/**
 * CreatorStore (v1)
 * 
 * Purpose: Manages invoice creation workflow state (drafts, templates, history, preferences, ID counter)
 * Storage Key: voidpay:creator
 */
export interface CreatorStoreV1 {
  version: 1
  
  // Active draft (single)
  activeDraft: InvoiceDraft | null
  
  // Saved templates
  templates: InvoiceTemplate[]
  
  // Creation history
  history: CreationHistoryEntry[]
  
  // User preferences
  preferences: UserPreferences
  
  // Auto-incrementing ID counter
  idCounter: InvoiceIDCounter
}

/**
 * PayerStore (v1)
 * 
 * Purpose: Manages payment receipt storage
 * Storage Key: voidpay:payer
 */
export interface PayerStoreV1 {
  version: 1
  
  // Payment receipts
  receipts: PaymentReceipt[]
}

// ============================================================================
// Entity Definitions
// ============================================================================

/**
 * LineItem
 * 
 * Description: Individual line item in an invoice
 */
export interface LineItem {
  id: string                   // UUID v4
  description: string
  quantity: number
  rate: string                 // Decimal string
}

/**
 * InvoiceDraft
 * 
 * Description: Represents the single active in-progress invoice
 */
export interface InvoiceDraft {
  draftId: string              // UUID v4
  lastModified: string         // ISO 8601 timestamp
  
  // Invoice fields (matches InvoiceSchemaV1 structure)
  invoiceId: string
  issueDate: string            // ISO 8601
  dueDate: string              // ISO 8601
  notes?: string               // Max 280 chars
  
  // Network & currency
  chainId: number
  currencySymbol: string
  tokenAddress?: string        // undefined = native token
  decimals: number
  
  // Parties
  sender: {
    name: string
    wallet: string
    email?: string
    address?: string
  }
  
  recipient: {
    name: string
    wallet?: string
    email?: string
    address?: string
  }
  
  // Line items
  lineItems: LineItem[]
  
  // Calculations
  taxRate: string              // e.g. "10%" or "50"
  discountAmount: string       // e.g. "10%" or "50"
}

/**
 * InvoiceTemplate
 * 
 * Description: Saved invoice template for reuse
 */
export interface InvoiceTemplate {
  templateId: string           // UUID v4
  name: string                 // User-provided or auto-generated
  createdAt: string            // ISO 8601 timestamp
  
  // Full invoice data (same structure as InvoiceDraft, minus draftId/lastModified)
  invoiceData: Omit<InvoiceDraft, 'draftId' | 'lastModified'>
}

/**
 * CreationHistoryEntry
 * 
 * Description: Record of a completed invoice
 */
export interface CreationHistoryEntry {
  entryId: string              // UUID v4
  createdAt: string            // ISO 8601 timestamp
  
  // Key details for display
  invoiceId: string
  recipientName: string
  totalAmount: string          // Decimal string with currency symbol (e.g., "1250.50 USDC")
  
  // Full URL for quick access
  invoiceUrl: string           // Full URL with compressed params
}

/**
 * UserPreferences
 * 
 * Description: Default settings for invoice creation
 */
export interface UserPreferences {
  // Sender defaults
  defaultSenderName?: string
  defaultSenderWallet?: string
  defaultSenderEmail?: string
  defaultSenderAddress?: string
  
  // Currency defaults
  defaultCurrency?: string     // e.g., "USDC"
  defaultChainId?: number      // e.g., 42161 (Arbitrum)
  
  // Invoice defaults
  defaultTaxRate?: string      // e.g., "10%"
  defaultIdPrefix?: string     // e.g., "ACME" → "ACME-001"
}

/**
 * InvoiceIDCounter
 * 
 * Description: Auto-incrementing counter for invoice IDs
 */
export interface InvoiceIDCounter {
  currentValue: number         // Current counter (starts at 1)
  prefix: string               // ID prefix (default: "INV")
}

/**
 * PaymentReceipt
 * 
 * Description: Record of a completed payment
 */
export interface PaymentReceipt {
  receiptId: string            // UUID v4
  paidAt: string               // ISO 8601 timestamp
  
  // Invoice details
  invoiceId: string
  recipientName: string
  paymentAmount: string        // Decimal string with currency (e.g., "1250.50 USDC")
  
  // Transaction details
  transactionHash: string      // 0x... hash
  chainId: number
  
  // Original invoice URL
  invoiceUrl: string
}

// ============================================================================
// Export/Import Schema
// ============================================================================

/**
 * ExportDataV1
 * 
 * Description: Envelope format for data export/import
 */
export interface ExportDataV1 {
  version: 1
  exportedAt: string           // ISO 8601 timestamp
  
  creator: CreatorStoreV1
  payer: PayerStoreV1
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate next invoice ID from counter
 * 
 * @param counter - Invoice ID counter
 * @returns Generated ID (e.g., "INV-001")
 */
export function generateNextId(counter: InvoiceIDCounter): string {
  const paddedNumber = counter.currentValue.toString().padStart(3, '0')
  return `${counter.prefix}-${paddedNumber}` // e.g., "INV-001"
}
