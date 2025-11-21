/**
 * Payer Store API Contract
 *
 * This file defines the public API for usePayerStore.
 * All components should interact with the store through these methods only.
 */

import type { PaymentReceipt } from './data-model'

export interface PayerStoreState {
  // State
  version: 1
  receipts: PaymentReceipt[]
}

export interface PayerStoreActions {
  // Receipt Management

  /**
   * Add a new payment receipt (called after transaction confirmation)
   * @param receipt - Receipt data (without receiptId and paidAt)
   */
  addReceipt: (receipt: Omit<PaymentReceipt, 'receiptId' | 'paidAt'>) => void

  /**
   * Delete a receipt
   * @param receiptId - Receipt ID to delete
   */
  deleteReceipt: (receiptId: string) => void

  /**
   * Get a specific receipt by ID
   * @param receiptId - Receipt ID
   * @returns Receipt or undefined if not found
   */
  getReceipt: (receiptId: string) => PaymentReceipt | undefined

  /**
   * Search/filter receipts
   * @param query - Search query (matches invoiceId, recipientName, paymentAmount)
   * @returns Filtered receipts
   */
  searchReceipts: (query: string) => PaymentReceipt[]

  /**
   * Get all receipts sorted by payment date (newest first)
   */
  getReceipts: () => PaymentReceipt[]

  /**
   * Get receipts for a specific chain
   * @param chainId - Chain ID to filter by
   */
  getReceiptsByChain: (chainId: number) => PaymentReceipt[]

  /**
   * Manually trigger receipt pruning (auto-called when > 100 entries)
   */
  pruneReceipts: () => void

  // Utility

  /**
   * Clear all receipts (with confirmation)
   */
  clearAllReceipts: () => void

  /**
   * Get current LocalStorage usage estimate
   * @returns Size in bytes
   */
  getStorageSize: () => number

  /**
   * Check if storage quota is near limit (> 80%)
   * @returns True if near limit
   */
  isStorageNearLimit: () => boolean
}

export type PayerStore = PayerStoreState & PayerStoreActions

/**
 * Hook to access the payer store
 *
 * @example
 * // Select specific state
 * const receipts = usePayerStore((s) => s.receipts)
 *
 * @example
 * // Select action
 * const addReceipt = usePayerStore((s) => s.addReceipt)
 *
 * @example
 * // Select multiple values
 * const { receipts, addReceipt } = usePayerStore((s) => ({
 *   receipts: s.receipts,
 *   addReceipt: s.addReceipt,
 * }))
 */
export declare function usePayerStore<T>(selector: (state: PayerStore) => T): T
