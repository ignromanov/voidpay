/**
 * Creator Entity Types
 *
 * Types for invoice creator state management (drafts, templates, history, preferences, ID counter).
 * These types are used by the CreatorStore (Zustand).
 */

import type { Address } from 'viem'
import type {
  DraftState,
  LineItem,
  InvoiceTemplate,
  CreationHistoryEntry,
} from '@/entities/invoice'

/**
 * UserPreferences
 *
 * Default settings for invoice creation.
 * All fields are optional (empty preferences = no defaults).
 */
export interface UserPreferences {
  // ========== Sender Defaults ==========

  /** Default sender name */
  defaultSenderName?: string

  /** Default sender wallet address (must be valid Ethereum address) */
  defaultSenderWallet?: Address

  /** Default sender email */
  defaultSenderEmail?: string

  /** Default sender physical address */
  defaultSenderAddress?: string

  // ========== Currency Defaults ==========

  /** Default currency symbol (e.g., "USDC") */
  defaultCurrency?: string

  /** Default network chain ID (e.g., 42161 for Arbitrum) */
  defaultNetworkId?: number

  // ========== Invoice Defaults ==========

  /** Default tax rate (e.g., "10%") */
  defaultTaxRate?: string

  /** Default invoice ID prefix (e.g., "ACME" -> "ACME-001") */
  /** Max 10 chars, alphanumeric only */
  defaultIdPrefix?: string
}

/**
 * InvoiceIDCounter
 *
 * Auto-incrementing counter for invoice IDs.
 * Counter increments ONLY when auto-generated ID is used.
 */
export interface InvoiceIDCounter {
  /** Current counter value (starts at 1, must be >= 1) */
  currentValue: number

  /** ID prefix (default: "INV", max 10 chars, alphanumeric only) */
  prefix: string
}

/**
 * CreatorStoreV1
 *
 * Version 1 of the Creator Store schema.
 * Manages invoice creation workflow state.
 *
 * Storage Key: `voidpay:creator`
 */
export interface CreatorStoreV1 {
  /** Schema version */
  version: 1

  /** Active draft (single in-progress invoice) */
  activeDraft: DraftState | null

  /** Line items for current draft (separate for UI with ids for React keys) */
  lineItems: LineItem[]

  /** Saved templates for reuse */
  templates: InvoiceTemplate[]

  /** Creation history (auto-pruned at 100 entries) */
  history: CreationHistoryEntry[]

  /** User preferences (default settings) */
  preferences: UserPreferences

  /** Auto-incrementing ID counter */
  idCounter: InvoiceIDCounter
}

// Re-export invoice types for convenience
export type { DraftState, LineItem, InvoiceTemplate, CreationHistoryEntry }
